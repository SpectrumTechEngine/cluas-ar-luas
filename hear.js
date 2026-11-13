// Cluas ar Luas: the speaking check.
// Records the learner (stops by itself after they finish talking), sends the recording to Azure's Irish listener
// through our own small server (so the Azure key stays secret), and compares what it heard with the phrase, kindly.
(function () {
'use strict';
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const URL_HEAR = LOCAL ? 'http://localhost:5332/hear' : 'https://europe-west1-chopthecheck.cloudfunctions.net/cluasHear';

let rec = null; // { ctx, stream, node, chunks, stop }

function available() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (self.AudioContext || self.webkitAudioContext)); }

// Records until the speaker goes quiet (or maxMs). Resolves with { wav: ArrayBuffer, url } or null if cancelled.
async function record({ maxMs = 7000, onLevel } = {}) {
  stop(true);
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const ctx = new (self.AudioContext || self.webkitAudioContext)();
  const src = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  let spoke = false, quietSince = 0, started = performance.now();
  return new Promise((resolve) => {
    const finish = (cancel) => {
      if (!rec) return;
      try { node.disconnect(); src.disconnect(); } catch {}
      stream.getTracks().forEach((t) => t.stop());
      const rate = ctx.sampleRate;
      ctx.close().catch(() => {});
      rec = null;
      if (cancel || !chunks.length) return resolve(null);
      const wav = toWav(chunks, rate);
      resolve({ wav, url: URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })), spoke });
    };
    rec = { stop: finish };
    node.onaudioprocess = (e) => {
      const d = e.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(d));
      let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
      const rms = Math.sqrt(s / d.length);
      if (onLevel) onLevel(rms);
      const now = performance.now();
      if (rms > 0.025) { spoke = true; quietSince = 0; }
      else if (spoke && rms < 0.015) { if (!quietSince) quietSince = now; else if (now - quietSince > 1100) finish(false); }
      if (now - started > maxMs) finish(false);
    };
    src.connect(node); node.connect(ctx.destination);
  });
}
function stop(cancel) { if (rec) rec.stop(!!cancel); }
function recording() { return !!rec; }

// 16 kHz, 16-bit mono WAV (what Azure wants)
function toWav(chunks, rate) {
  const len = chunks.reduce((n, c) => n + c.length, 0);
  const all = new Float32Array(len); let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
  const ratio = rate / 16000, n = Math.floor(len / ratio);
  const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (p, s) => { for (let i = 0; i < s.length; i++) v.setUint8(p + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    // simple average of the samples that fold into this one (cheap anti-alias)
    const a = Math.floor(i * ratio), b = Math.min(len, Math.floor((i + 1) * ratio));
    let s = 0; for (let k = a; k < b; k++) s += all[k];
    const x = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return buf;
}

// Ask the listener what it heard. Resolves { ok: true, texts: [...] } or { ok: false, why }
async function recognise(wav) {
  try {
    const r = await fetch(URL_HEAR, { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: wav });
    if (!r.ok) return { ok: false, why: 'server ' + r.status };
    const j = await r.json();
    return { ok: true, texts: j.texts || [] };
  } catch (e) { return { ok: false, why: 'offline' }; }
}

// ---------- kind comparison ----------
function lev(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const close = (a, b) => a === b || (Math.max(a.length, b.length) >= 4 && 1 - lev(a, b) / Math.max(a.length, b.length) >= 0.7);
// expected: Irish phrase text. texts: what the listener heard (best first).
// Returns { stars: 1|2|3, missing: [indexes of expected words not heard], heard: best text }
function score(expected, texts) {
  // the listener sometimes writes numbers as digits ("Tá 6 go deas" for "Tá sé go deas")
  const NUM = ['naid', 'aon', 'do', 'tri', 'ceathair', 'cuig', 'se', 'seacht', 'ocht', 'naoi', 'deich'];
  const plain = (s) => self.CONTENT.plain(String(s).replace(/\b(10|[0-9])\b/g, (m) => ' ' + NUM[+m] + ' '));
  const E = plain(expected).split(' ').filter(Boolean);
  let best = { stars: 1, missing: E.map((_, i) => i), heard: texts[0] || '', hit: -1 };
  for (const t of texts) {
    const H = plain(t).split(' ').filter(Boolean);
    const joined = H.join('');
    const missing = [];
    E.forEach((w, i) => { if (!H.some((h) => close(w, h)) && !joined.includes(w)) missing.push(i); });
    const hit = E.length - missing.length;
    if (hit > best.hit || (hit === best.hit && /\d/.test(best.heard) && !/\d/.test(t))) best ={ missing, heard: t, hit, stars: !missing.length ? 3 : hit / E.length >= 0.5 ? 2 : 1 };
  }
  return best;
}

self.HEAR = { available, record, stop, recording, recognise, score, URL_HEAR };
})();
