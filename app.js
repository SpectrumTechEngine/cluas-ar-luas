// Cluas ar Luas: the app. Words in content.js, pictures in pics.js, the speaking check in hear.js.
(() => {
'use strict';
const { PHRASES, UNITS, CHARS, ENGLISH, plain, words } = self.CONTENT;
const PH = Object.fromEntries(PHRASES.map((p) => [p.id, p]));
const $ = (id) => document.getElementById(id);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

// ---------- saved progress (this phone only) ----------
const KEY = 'cal2';
const S = Object.assign({
  voice: 'orla', showGa: true, showSay: true, showEn: false, speak: true, goal: 20,
  xp: {}, total: 0, done: {}, streak: 0, last: '', freezes: 0, ach: {}, miss: {}, seen: {}, told: {},
  outfit: '', outfits: [], muteUntil: 0, welcomed: false, lessons: 0,
}, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const track = (n) => { try { window.STE && STE.track && STE.track(n); } catch {} };
const day = (offset = 0) => { const d = new Date(Date.now() + offset * 864e5); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const todayXp = () => S.xp[day()] || 0;
const streakLive = () => (S.last === day() || S.last === day(-1) ? S.streak : 0);

// ---------- sound ----------
let cur = null, token = 0;
function stopAudio() {
  token++;
  if (cur) { try { cur.pause(); } catch {} cur = null; }
  try { speechSynthesis.cancel(); } catch {}
  document.querySelectorAll('.playing').forEach((b) => b.classList.remove('playing'));
}
function standIn(text, lang, rate) {
  return new Promise((res) => {
    if (!text || !('speechSynthesis' in self)) return res();
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate;
    const t = setTimeout(res, 8000);
    u.onend = u.onerror = () => { clearTimeout(t); res(); };
    speechSynthesis.speak(u);
  });
}
// a clip: 'id', 'id:slow' (teacher voice) or 'ch:who:id' (a character)
function clip(spec) {
  const my = token;
  let file, fallback;
  if (spec.startsWith('ch:')) { const [, who, id] = spec.split(':'); file = `audio/ch/${who}_${id}.mp3`; fallback = () => standIn(PH[id] && PH[id].say.toLowerCase().replace(/-/g, ' '), 'en-IE', 0.8); }
  else {
    const [id, slow] = spec.split(':');
    file = `audio/${S.voice}/${id}${slow ? '-slow' : ''}.mp3`;
    fallback = () => ENGLISH[id] ? standIn(ENGLISH[id], 'en-IE', 0.95) : standIn((PH[id] || {}).say && PH[id].say.toLowerCase().replace(/-/g, ' '), 'en-IE', slow ? 0.55 : 0.8);
  }
  return new Promise((res) => {
    const a = new Audio(file); cur = a;
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    a.onended = fin;
    a.onerror = () => { if (my === token) fallback().then(fin); else fin(); };
    a.play().catch((e) => { if (e && e.name === 'NotAllowedError') fin(); });
  });
}
async function seq(...parts) {
  stopAudio();
  const my = token;
  for (const p of parts) {
    if (my !== token) return false;
    if (typeof p === 'number') await sleep(p); else if (p) await clip(p);
  }
  return my === token;
}
function glow(btn, p) { if (btn) { btn.classList.add('playing'); p.then(() => btn.classList.remove('playing')); } return p; }

let ac = null;
function tone(notes, type = 'sine', vol = 0.16) {
  try {
    ac = ac || new (self.AudioContext || self.webkitAudioContext)();
    let t = ac.currentTime + 0.02;
    for (const [f, d] of notes) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + 0.05);
      t += d * 0.75;
    }
  } catch {}
}
const ding = () => tone([[784, 0.16], [1175, 0.32]]);
const boop = () => tone([[392, 0.16], [330, 0.28]], 'triangle', 0.12);
const pop = () => tone([[660, 0.08]], 'sine', 0.1);
const fanfare = () => tone([[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.5]]);

// ---------- little helpers for screens ----------
function show(id) { ['splash', 'home', 'lesson', 'end'].forEach((s) => $(s).classList.toggle('hide', s !== id)); window.scrollTo(0, 0); }
function sayHTML(s) {
  return s.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean).map((word) => word.split('-').map((syl, k) =>
    `<span class="syl c${k % 2}${/[A-Z]/.test(syl) && syl === syl.toUpperCase() ? ' st' : ''}">${syl.toLowerCase()}</span>`).join('<span class="dot">·</span>')).join('<span class="gap"></span>');
}
const textOf = (p) => `${S.showGa ? `<div class="ga">${p.ga}</div>` : ''}${S.showSay ? `<div class="sayit">${sayHTML(p.say)}</div>` : ''}`;
const enOf = (p) => (S.showEn ? `<div class="en">${p.en}</div>` : '');
const listen = (id) => `<div class="listen"><button data-play="${id}" aria-label="Play">🔊</button><button class="slow" data-play="${id}:slow" aria-label="Play slowly">🐢</button></div>`;
const starsHTML = (n) => [1, 2, 3].map((i) => `<span class="${i <= n ? '' : 'off'}">⭐</span>`).join('');
const SHAPES = ['🔵', '🔺', '🟧', '🟣'];
function foot(html) { $('foot').innerHTML = html; }
function title(t, mood = 'happy') { return `<div class="title">${HARE(mood, S.outfit)}<span>${t}</span></div>`; }

// ---------- the path ----------
// nodes in order: lessons, a chest after the 3rd lesson, the unit challenge at the end
const NODES = [];
UNITS.forEach((u, ui) => {
  u.lessons.forEach((l, li) => {
    NODES.push({ kind: 'lesson', id: l.id, unit: ui, lesson: l, icon: ['👋', '🙂', '🏷️', '🚪', '🙏', '☕', '🥪', '🗣️', '😋', '💶'][ui * 5 + li] || '⭐' });
    if (li === 2) NODES.push({ kind: 'chest', id: u.id + 'chest', unit: ui, icon: '🎁' });
  });
  NODES.push({ kind: 'challenge', id: u.id + 'ch', unit: ui, icon: '🏆' });
});
const isDone = (n) => !!S.done[n.id];
const isOpen = (i) => i === 0 || isDone(NODES[i - 1]) || isDone(NODES[i]);
const learned = () => { const ids = new Set(); for (const n of NODES) if (n.kind === 'lesson' && isDone(n)) n.lesson.phrases.forEach((p) => ids.add(p)); return ids; };

function renderHome() {
  const nowIdx = NODES.findIndex((n, i) => isOpen(i) && !isDone(n));
  const sx = [0, 56, 80, 56, 0, -56, -80, -56];
  const pct = Math.min(1, todayXp() / S.goal);
  let html = `<div class="top">
      <span class="chip ${S.last === day() ? '' : 'dim'}" title="Days in a row">🔥 ${streakLive()}</span>
      <span class="chip" title="Streak freezes">🧊 ${S.freezes}</span>
      <span class="grow"></span>
      <button class="round" data-act="ach" aria-label="Achievements">🏆</button>
      <div class="goal" title="Today's goal"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="25" cy="25" r="21" fill="none" stroke="var(--gold)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(pct * 132).toFixed(1)} 132"/></svg><b>⚡</b></div>
      <button class="round" data-act="settings" aria-label="Settings">⚙️</button></div>`;
  let k = 0;
  UNITS.forEach((u, ui) => {
    html += `<div class="unit" style="background:${u.colour}"><small>Unit ${ui + 1} · ${u.ga}</small><b>${u.name}</b></div><div class="path">`;
    NODES.forEach((n, i) => {
      if (n.unit !== ui) return;
      const open = isOpen(i), done = isDone(n), now = i === nowIdx;
      const off = sx[k++ % sx.length];
      const cls = `node${n.kind === 'chest' ? ' chest' : ''}${done ? ' done' : open ? ' open' : ''}${now ? ' now' : ''}`;
      const label = n.kind === 'lesson' ? n.lesson.name : n.kind === 'chest' ? '' : 'Challenge';
      html += `<div style="transform:translateX(${off}px);position:relative">
        <button class="${cls}" data-node="${i}" aria-label="${label || 'Chest'}">${open || done ? n.icon : '🔒'}<span class="cr">${done && n.kind !== 'chest' ? '⭐' : ''}</span></button>
        ${now ? `<div class="home-hare" style="top:-6px;${off > 0 ? 'right:96px' : 'left:96px'}">${HARE('happy', S.outfit)}</div>` : ''}
        ${label ? `<div class="lbl" style="margin-top:${done ? 22 : 8}px">${label}</div>` : ''}</div>`;
    });
    html += '</div>';
  });
  html += `<p class="note" style="margin:26px 0 8px">More units coming soon.</p>`;
  if (Object.keys(S.miss).length >= 3) html += `<button class="big fixbtn" data-act="fix">🔧 Fix my mistakes (${Object.keys(S.miss).length})</button>`;
  $('home').innerHTML = html;
  show('home');
  const nowEl = document.querySelector('.node.now');
  if (nowEl) nowEl.scrollIntoView({ block: 'center' });
}

// ---------- bottom sheets ----------
function sheet(html) { $('sheetBox').innerHTML = html; $('sheet').classList.remove('hide'); }
function closeSheet() { $('sheet').classList.add('hide'); }
const sheetOpen = () => !$('sheet').classList.contains('hide');
$('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet' && !L) closeSheet(); });

function nodeSheet(i) {
  const n = NODES[i];
  if (!isOpen(i)) { boop(); return; }
  if (n.kind === 'chest') return openChest(n);
  const name = n.kind === 'lesson' ? n.lesson.name : `${UNITS[n.unit].name}: challenge`;
  const sub = n.kind === 'lesson' ? `${n.lesson.phrases.length} new phrases` : 'Show what you know: no new phrases';
  sheet(`<div style="font-size:54px;text-align:center">${n.icon}</div><h2>${name}</h2><p class="note">${sub}${isDone(n) ? ' · done ⭐' : ''}</p>
    <button class="big" data-act="start" data-node="${i}">▶ ${isDone(n) ? 'Practise again' : 'Start'}</button>
    <button class="soft" data-act="close">Not now</button>`);
}
function openChest(n) {
  const fit = n.unit === 0 ? 'cap' : 'scarf';
  if (!S.outfits.includes(fit)) S.outfits.push(fit);
  S.done[n.id] = 1; S.outfit = fit; addXp(15); save();
  fanfare();
  sheet(`<div class="hare" style="width:140px;margin:0 auto">${HARE('cheer', fit)}</div><h2>🎁 You found a chest!</h2>
    <p class="note" style="font-size:17px">+15 XP, and a new outfit for Giorria: <b>${fit === 'cap' ? 'a flat cap' : 'a scarf'}</b>. Change outfits in ⚙️ Settings.</p>
    <button class="big" data-act="closehome">Brilliant!</button>`);
  seq(600, 'p_chest');
}

function settingsSheet() {
  const tg = (k, label) => `<button class="opt${S[k] ? ' on' : ''}" data-tog="${k}"><span>${label}</span><i class="sw"></i></button>`;
  const fits = [['', '🐇'], ['cap', 'Cap'], ['scarf', 'Scarf'], ['shades', 'Shades']];
  sheet(`<h2>Settings</h2>
    <div class="seg"><button data-voice="orla" class="${S.voice === 'orla' ? 'sel' : ''}">👩 Orla</button><button data-voice="colm" class="${S.voice === 'colm' ? 'sel' : ''}">👨 Colm</button></div>
    ${tg('showGa', '☘️ Irish spelling')}${tg('showSay', '🗣️ Sound-it-out spelling')}${tg('showEn', '🔤 English words')}${tg('speak', '🎤 Speaking practice')}
    <p class="note" style="text-align:left;margin-top:6px">🎯 Daily goal</p>
    <div class="seg">${[[10, 'Easy'], [20, 'Normal'], [30, 'Keen']].map(([g, n]) => `<button data-goal="${g}" class="${S.goal === g ? 'sel' : ''}">${n}<br><small>${g} XP</small></button>`).join('')}</div>
    <p class="note" style="text-align:left;margin-top:6px">🐇 Giorria's outfit</p>
    <div class="fits">${fits.map(([f]) => `<button data-fit="${f}" class="${S.outfit === f ? 'sel' : ''}" ${f && !S.outfits.includes(f) ? 'disabled' : ''}>${HARE('happy', f)}</button>`).join('')}</div>
    <button class="big" data-act="close">Done</button>
    <p class="note">Speaking practice sends your recording to Microsoft's Irish listener to check it. This app doesn't keep it. Your progress stays on this phone only.</p>
    <button class="link" data-act="reset">Start my progress again</button>`);
}
function achSheet() {
  sheet(`<h2>🏆 Achievements</h2>${ACH.map((a) => `<div class="ach${S.ach[a.id] ? '' : ' lock'}"><i>${a.icon}</i><div><b>${a.name}</b><small>${a.how}</small></div></div>`).join('')}
    <button class="big" data-act="close">Close</button>`);
}
function pauseSheet() {
  stopAudio(); HEAR.stop(true);
  sheet(`<div class="hare" style="width:110px;margin:0 auto">${HARE('sleepy', S.outfit)}</div><h2>Paused</h2>
    <button class="big" data-act="resume">▶ Keep going</button><button class="soft" data-act="leave">🏠 Leave this lesson</button>`);
}

// ---------- achievements + XP + streak ----------
const ACH = [
  { id: 'first', icon: '🌱', name: 'First steps', how: 'Finish your first lesson' },
  { id: 'perfect', icon: '💯', name: 'Spot on', how: 'Finish a lesson with no repeats' },
  { id: 'voice', icon: '🎤', name: 'Grand voice', how: 'Get 3 stars for speaking' },
  { id: 'u1', icon: '👋', name: 'Meeting people', how: 'Finish unit 1' },
  { id: 'u2', icon: '☕', name: 'Café regular', how: 'Finish unit 2' },
  { id: 's3', icon: '🔥', name: 'On a roll', how: '3 days in a row' },
  { id: 's7', icon: '🌟', name: 'A full week', how: '7 days in a row' },
  { id: 'p25', icon: '📚', name: '25 phrases', how: 'Learn 25 phrases' },
  { id: 'fix', icon: '🔧', name: 'Fixer', how: 'Do a "Fix my mistakes" lesson' },
];
let newAch = [];
function award(id) { if (!S.ach[id]) { S.ach[id] = Date.now(); newAch.push(ACH.find((a) => a.id === id)); } }
function addXp(n) { S.xp[day()] = todayXp() + n; S.total += n; const keep = {}; Object.keys(S.xp).slice(-30).forEach((k) => { keep[k] = S.xp[k]; }); S.xp = keep; }
function bumpStreak() {
  if (S.last === day()) return;
  if (S.last === day(-1)) S.streak++;
  else if (S.last === day(-2) && S.freezes > 0) { S.freezes--; S.streak++; }
  else S.streak = 1;
  S.last = day();
  if (S.streak % 7 === 0 && S.freezes < 2) S.freezes++;
  if (S.streak >= 3) award('s3');
  if (S.streak >= 7) award('s7');
}

// ---------- building a lesson ----------
let L = null;
function pool() { const s = learned(); if (L) L.phrases.forEach((p) => s.add(p)); return [...s]; }
// answer choices that look clearly different from p and from each other; learned phrases first
function others(p, n, prefer = pool()) {
  const looks = new Set([p.look]), out = [];
  for (const list of [shuffle(prefer), shuffle(PHRASES.map((x) => x.id))]) {
    for (const id of list) { const q = PH[id]; if (out.length >= n) break; if (id === p.id || looks.has(q.look)) continue; looks.add(q.look); out.push(id); }
  }
  return out;
}
function distinctLooks(ids, n) { const looks = new Set(), out = []; for (const id of ids) { if (looks.has(PH[id].look)) continue; looks.add(PH[id].look); out.push(id); if (out.length === n) break; } return out; }
const multi = (id) => words(PH[id]).length >= 2;
const speakOn = () => S.speak && Date.now() > S.muteUntil && HEAR.available();

function buildLesson(n) {
  const items = [];
  if (n.kind === 'lesson') {
    const ps = n.lesson.phrases;
    const old = [...learned()].filter((id) => !ps.includes(id)).sort((a, b) => (S.seen[a] || 0) - (S.seen[b] || 0));
    ps.forEach((id, i) => {
      items.push({ t: 'meet', p: id }, { t: 'pick', p: id });
      if (i % 2 === 0) items.push({ t: 'say', p: id }); // speak it straight after learning it
      if (i === 1) items.push({ t: 'sound', p: ps[0] });
      if (i === 2) items.push(multi(ps[1]) ? { t: 'build', p: ps[1] } : { t: 'sound', p: ps[1] });
    });
    const pairSet = distinctLooks(shuffle([...ps, ...old.slice(0, 4)]), 4);
    if (pairSet.length >= 3) items.push({ t: 'pairs', ps: pairSet });
    const extra = [];
    const bi = ps.filter(multi);
    if (bi.length) extra.push({ t: 'build', p: pickOne(bi.filter((x) => x !== ps[1]).concat(bi)) });
    extra.push({ t: 'sound', p: ps[ps.length - 1] });
    old.slice(0, 2).forEach((id, i) => extra.push({ t: i ? 'sound' : 'pick', p: id }));
    items.push(...shuffle(extra));
    (n.lesson.chat || []).forEach((c) => items.push({ t: 'chat', c }));
  } else if (n.kind === 'challenge') {
    const u = UNITS[n.unit], ps = u.lessons.flatMap((l) => l.phrases);
    const chats = u.challenge.map((c) => ({ t: 'chat', c }));
    const mid = [{ t: 'pairs', ps: distinctLooks(shuffle(ps), 4) }, ...shuffle(ps.filter(multi)).slice(0, 2).map((p) => ({ t: 'build', p })),
      ...shuffle(ps).slice(0, 2).map((p) => ({ t: 'say', p })), ...shuffle(ps).slice(0, 3).map((p) => ({ t: 'sound', p }))];
    chats.forEach((c, i) => { items.push(c); if (mid[i]) items.push(mid[i]); });
    items.push(...mid.slice(chats.length));
  } else if (n.kind === 'fix') {
    const ids = Object.keys(S.miss).sort((a, b) => S.miss[b] - S.miss[a]).slice(0, 6);
    ids.forEach((id) => items.push({ t: 'pick', p: id, fix: 1 }));
    shuffle(ids).slice(0, 3).forEach((id) => items.push({ t: multi(id) ? 'build' : 'sound', p: id, fix: 1 }));
    shuffle(ids).slice(0, 2).forEach((id) => items.push({ t: 'say', p: id, fix: 1 }));
  }
  return items.filter((it) => it.t !== 'say' || speakOn());
}

function start(n) {
  closeSheet();
  const phrases = n.kind === 'lesson' ? n.lesson.phrases : n.kind === 'challenge' ? UNITS[n.unit].lessons.flatMap((l) => l.phrases) : Object.keys(S.miss);
  L = { node: n, phrases, items: [], i: 0, firstTry: 0, asked: 0, mist: 0, combo: 0, again: new Set(), t0: Date.now(), heardIntro: {} };
  L.items = buildLesson(n);
  show('lesson');
  next();
}
function next() {
  stopAudio(); HEAR.stop(true);
  $('progBar').style.width = `${(L.i / L.items.length) * 100}%`;
  $('combo').textContent = L.combo >= 3 ? `🔥${L.combo}` : '';
  if (L.i >= L.items.length) return finish();
  const it = L.items[L.i];
  L.locked = false; L.sel = null; L.tries = 0;
  if (it.p) S.seen[it.p] = (S.seen[it.p] || 0) + 1;
  ({ meet, pick, sound, pairs, build, chat, say })[it.t](it);
}
// the spoken instruction plays the first 3 times you ever meet each kind of question
function intro(kind) { if (L.heardIntro[kind] || (S.told[kind] || 0) >= 3) return []; L.heardIntro[kind] = 1; S.told[kind] = (S.told[kind] || 0) + 1; return [kind, 250]; }

// ---------- question types ----------
function meet(it) {
  const p = PH[it.p];
  $('stage').innerHTML = `${title('New phrase')}<div class="pbig">${PIC(p.id)}</div>${textOf(p)}${enOf(p)}${listen(p.id)}
    <button class="soft" data-play="mean_${p.id}">❓ What does it mean?</button>${micBlock('Your turn: say it', 'meet')}`;
  foot(`<button class="big" data-act="next">Continue</button>`);
  glow($('stage').querySelector('.listen button'), seq(...intro('p_meet'), p.id, 400, 'mean_' + p.id, 400, p.id));
}
function pick(it) {
  const p = PH[it.p];
  const opts = shuffle([p.id, ...others(p, L.phrases.length >= 4 || learned().size >= 6 ? 3 : 2)]);
  $('stage').innerHTML = `${title('Tap what you hear')}${listen(p.id)}
    <div class="grid">${opts.map((o) => `<button class="card" data-pick="${o}" aria-label="picture">${PIC(o)}${S.showEn ? `<div class="en">${PH[o].en}</div>` : ''}</button>`).join('')}</div>`;
  foot('');
  glow($('stage').querySelector('.listen button'), seq(...intro('p_pick'), p.id));
}
function sound(it) {
  const p = PH[it.p];
  const opts = shuffle([p.id, ...others(p, 2)]);
  $('stage').innerHTML = `${title('Which sound matches?')}<div class="pbig" style="max-width:300px">${PIC(p.id)}</div>${enOf(p)}
    <div class="sounds">${opts.map((o, k) => `<button class="snd" data-snd="${o}" aria-label="Sound ${k + 1}">${SHAPES[k]}</button>`).join('')}</div>`;
  foot(`<button class="big" data-act="check" disabled>Check</button>`);
  seq(...intro('p_sound'));
}
function pairs(it) {
  const ids = it.ps;
  const sn = shuffle(ids), pc = shuffle(ids);
  L.pairsLeft = ids.length; L.pairSel = null;
  $('stage').innerHTML = `${title('Match the pairs')}<div class="pairs"><div class="col">${sn.map((id, k) => `<button class="snd" data-ps="${id}">${SHAPES[k]}</button>`).join('')}</div>
    <div class="col">${pc.map((id) => `<button class="card" data-pp="${id}">${PIC(id)}</button>`).join('')}</div></div>`;
  foot('');
  seq(...intro('p_pairs'));
}
function build(it) {
  const p = PH[it.p];
  const ws = words(p);
  let tiles = ws.map((w, k) => ({ ...w, k }));
  if (ws.length <= 4) {
    const used = new Set(ws.map((w) => plain(w.ga)));
    const spare = shuffle(pool().filter((id) => id !== p.id)).flatMap((id) => words(PH[id])).filter((w) => !used.has(plain(w.ga)) && (used.add(plain(w.ga)), true));
    tiles = tiles.concat(spare.slice(0, ws.length <= 2 ? 2 : 1).map((w, k) => ({ ...w, k: 100 + k })));
  }
  L.tiles = shuffle(tiles); L.slots = [];
  $('stage').innerHTML = `${title('Tap the sounds in order')}${listen(p.id)}<div class="slots" id="slots"></div><div class="bank" id="bank"></div>`;
  drawTiles();
  foot(`<button class="big" data-act="check" disabled>Check</button>`);
  glow($('stage').querySelector('.listen button'), seq(...intro('p_build'), p.id));
}
function tileHTML(w, where, i) {
  // lowercase so a capital letter doesn't give away the first word (names keep their capital)
  const ga = /^(Nóra|Peadar|Muire|Dia|Cian|Mamó)$/.test(w.ga) ? w.ga : w.ga.toLowerCase();
  const inner = S.showSay || S.showGa ? `${S.showSay ? `<span class="sayit">${sayHTML(w.say)}</span>` : ''}${S.showGa ? `<span class="ga">${ga}</span>` : ''}` : '🔊';
  return `<button class="tile${S.showSay || S.showGa ? '' : ' plain'}" data-${where}="${i}">${inner}</button>`;
}
function drawTiles() {
  $('slots').innerHTML = L.slots.map((ti, i) => tileHTML(L.tiles[ti], 'slot', i)).join('');
  $('bank').innerHTML = L.tiles.map((w, i) => (L.slots.includes(i) ? `<span class="tile gone">${S.showSay ? sayHTML(w.say) : w.ga}</span>` : tileHTML(w, 'tile', i))).join('');
  const b = $('foot').querySelector('[data-act=check]');
  if (b) b.disabled = L.slots.length < words(PH[L.items[L.i].p]).length;
}
function chat(it) {
  const c = it.c, a = PH[c.says];
  const opts = shuffle([c.reply, ...c.wrong]);
  $('stage').innerHTML = `${title('Finish the chat')}<div class="chat">
      <div class="line">${PERSON_ICON(c.a)}<button class="say-b" data-play="ch:${c.a}:${c.says}"><small>${CHARS[c.a].name}</small>🔊${S.showGa ? `<div class="ga" style="font-size:20px">${a.ga}</div>` : ''}</button></div>
      <div class="line me">${PERSON_ICON(c.b)}<div class="say-b" id="replyB"><small>${CHARS[c.b].name}</small>❓</div></div></div>
    <div class="opts">${opts.map((o, k) => `<button class="card" data-opt="${o}">${PIC(o)}<span>${SHAPES[k]}</span></button>`).join('')}</div>
    ${micBlock(`Or say ${CHARS[c.b].name}'s answer`, 'chat')}`;
  foot(`<button class="big" data-act="check" disabled>Check</button>`);
  glow($('stage').querySelector('.say-b'), seq(...intro('p_chat'), 'ch:' + c.a + ':' + c.says));
}
function say(it) {
  const p = PH[it.p];
  $('stage').innerHTML = `${title('Say it')}<div class="pbig" style="max-width:260px">${PIC(p.id)}</div>${textOf(p)}${listen(p.id)}
    ${micBlock('Tap 🎤 and say it', 'say')}
    <button class="link" data-act="mute">I can't speak right now</button>`;
  foot('');
  glow($('stage').querySelector('.listen button'), seq(...intro('p_say'), p.id));
}
// The microphone, used in three places (mode):
//   'say'  = a Say it question (3 stars = right answer)
//   'meet' = "Your turn" on a new phrase card (practice only, nothing is marked)
//   'chat' = saying the reply in Finish the chat (3 stars = right answer; otherwise just tap the picture)
async function micTap(mode = 'say') {
  if (HEAR.recording()) return HEAR.stop(false);
  if (L.busy || (mode !== 'meet' && L.locked)) return;
  const it = L.items[L.i], p = PH[mode === 'chat' ? it.c.reply : it.p], mic = $('mic');
  const sayFoot = (html) => { if (mode === 'say') foot(html); };
  stopAudio(); pop();
  let res;
  try {
    mic.classList.add('rec'); $('heard').textContent = 'Listening… tap 🎤 again when you finish';
    res = await HEAR.record({});
  } catch {
    mic.classList.remove('rec');
    $('heard').textContent = "The microphone isn't allowed. Check the browser's microphone permission (the icon by the web address).";
    sayFoot(`<button class="big" data-act="sayok">Continue</button>`); return;
  }
  if (!L || !$('mic')) return;
  mic.classList.remove('rec');
  if (!res) { $('heard').textContent = ''; return; }
  L.lastRec = res.url; L.tries++;
  if (!res.spoke) { $('heard').textContent = "I didn't hear anything. Try again a bit louder."; return; }
  mic.classList.add('busy'); L.busy = true; $('heard').textContent = 'Checking…';
  const r = await HEAR.recognise(res.wav);
  L.busy = false;
  if (!L || !$('mic')) return;
  mic.classList.remove('busy');
  const compare = `<button class="soft" data-act="me">▶ Me</button><button class="soft" data-play="${mode === 'chat' ? `ch:${it.c.b}:${p.id}` : p.id}">▶ Voice</button>`;
  if (!r.ok) { // can't reach the listener: compare by ear instead
    $('heard').innerHTML = "Couldn't reach the listener. Compare by ear:";
    $('after').innerHTML = compare;
    sayFoot(`<div class="row"><button class="soft" data-act="retry">🔁 Again</button><button class="big" data-act="sayok" style="flex:1">👍 Sounded close</button></div>`);
    playMe().then(() => seq(p.id)); return;
  }
  const sc = HEAR.score(p.ga, r.texts);
  const ws = words(p);
  $('heard').innerHTML = `<div class="stars">${starsHTML(sc.stars)}</div>${sc.heard ? `I heard: <b>${sc.heard}</b>` : "I didn't catch that."}`;
  $('after').innerHTML = compare;
  if (sc.stars === 3) {
    award('voice'); save();
    if (mode === 'say') { right(); seq(300, 'p_heard3'); }
    else if (mode === 'chat') { chatRight(); }
    else { ding(); seq(300, 'p_heard3'); }
    return;
  }
  if (sc.stars === 2) {
    const miss = sc.missing.map((i) => ws[i]);
    $('after').innerHTML += `<div class="row">${miss.map((w) => `<button class="tile" data-play="${w.id}">${S.showSay ? `<span class="sayit">${sayHTML(w.say)}</span>` : ''}${S.showGa ? `<span class="ga">${w.ga}</span>` : ''}</button>`).join('')}</div>`;
    sayFoot(`<div class="row"><button class="soft" data-act="retry">🔁 Try again</button><button class="big" data-act="sayok" style="flex:1">Continue</button></div>`);
    seq(200, 'p_heard2', 200, ...miss.map((w) => w.id));
    return;
  }
  sayFoot(`<div class="row"><button class="soft" data-act="retry">🔁 Try again</button><button class="big" data-act="sayok" style="flex:1">${L.tries >= 2 ? 'Skip for now' : 'I said it right ✓'}</button></div>`);
  seq(200, 'p_heard1', 300, p.id + ':slow');
}
const micBlock = (label, mode) => (speakOn() ? `<button class="mic${mode === 'say' ? '' : ' sm'}" id="mic" data-mode="${mode}" aria-label="Record">🎤</button>${label ? `<div class="note" style="margin-top:-6px">${label}</div>` : ''}<div id="heard" class="heard"></div><div class="row" id="after"></div>` : '');
function chatRight() {
  const it = L.items[L.i], want = it.c.reply;
  const card = document.querySelector(`[data-opt="${want}"]`); if (card) card.classList.add('ok');
  $('replyB').innerHTML = `<small>${CHARS[it.c.b].name}</small>${PIC(want).replace('class="pic-svg"', 'class="pic-svg" style="width:90px"')}`;
  right(true); seq('ch:' + it.c.b + ':' + want, 300, pickOne(PRAISE)[0]);
}
function playMe() {
  stopAudio();
  if (!L || !L.lastRec) return Promise.resolve();
  return new Promise((res) => { const a = new Audio(L.lastRec); cur = a; a.onended = a.onerror = res; a.play().catch(res); });
}

// ---------- right / nearly ----------
const PRAISE = [['praise1', 'Maith thú!'], ['praise2', 'An-mhaith!'], ['praise3', 'Ar fheabhas!'], ['praise4', 'Togha!']];
function right(silent) {
  L.locked = true;
  const it = L.items[L.i];
  L.asked++; if (!L.again.has(L.i)) L.firstTry++;
  L.combo++;
  if (it.fix && S.miss[it.p]) { S.miss[it.p]--; if (S.miss[it.p] <= 0) delete S.miss[it.p]; }
  ding();
  const [pid, word] = pickOne(PRAISE);
  const p = it.p ? PH[it.p] : it.c ? PH[it.c.reply] : null;
  foot(`<div class="fb ok"><h3>✅ ${word}</h3>${p ? `<div class="ans"><div><b>${p.ga}</b><br>${p.en}</div></div>` : ''}<button class="big" data-act="next">Continue</button></div>`);
  $('combo').textContent = L.combo >= 3 ? `🔥${L.combo}` : '';
  if (!silent) setTimeout(() => { if (L && L.locked) seq(pid); }, 350);
}
function nearly(correctId) {
  L.locked = true;
  const it = L.items[L.i];
  L.asked++; L.mist++; L.combo = 0;
  if (!L.again.has(L.i)) { L.again.add(L.i); L.items.push({ ...it, again: 1 }); }
  const p = PH[correctId];
  S.miss[p.id] = (S.miss[p.id] || 0) + 1;
  boop();
  foot(`<div class="fb near"><h3>💛 Nearly! Here it is:</h3><div class="ans">${PIC(p.id)}<div><b>${p.ga}</b><br>${S.showSay ? sayHTML(p.say) : ''}<br>${p.en}</div></div>
    <button class="big near" data-act="next">Got it</button></div>`);
  seq(500, it.c ? 'ch:' + it.c.b + ':' + p.id : p.id);
}

// ---------- end of lesson ----------
function finish() {
  const n = L.node;
  const xp = (n.kind === 'challenge' ? 20 : 10) + (L.mist === 0 ? 5 : 0);
  addXp(xp); bumpStreak();
  S.lessons++;
  const wasGoal = todayXp() - xp >= S.goal;
  if (n.kind !== 'fix') S.done[n.id] = 1; else award('fix');
  award('first');
  if (L.mist === 0 && L.items.length > 4) award('perfect');
  if (n.kind === 'challenge') { award('u' + (n.unit + 1)); if (n.unit === 1 && !S.outfits.includes('shades')) S.outfits.push('shades'); }
  if (learned().size >= 25) award('p25');
  save(); track(n.kind === 'challenge' ? 'unit_done' : 'lesson_done');
  const secs = Math.round((Date.now() - L.t0) / 1000), acc = L.asked ? Math.round((L.firstTry / L.asked) * 100) : 100;
  const goalNow = !wasGoal && todayXp() >= S.goal;
  const unitDone = n.kind === 'challenge';
  $('end').innerHTML = `${HARE('dance', S.outfit)}<h2>${unitDone ? 'Unit complete!' : 'Lesson done!'}</h2>
    <div class="statrow"><div class="stat"><small>XP</small><b>⚡ ${xp}</b></div><div class="stat"><small>First try</small><b>🎯 ${acc}%</b></div><div class="stat"><small>Time</small><b>⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div></div>
    <div class="chip">🔥 ${S.streak} ${S.streak === 1 ? 'day' : 'days in a row'}</div>
    ${goalNow ? `<div class="chip">🎯 Daily goal reached!</div>` : ''}
    ${newAch.map((a) => `<div class="ach"><i>${a.icon}</i><div><b>${a.name}</b><small>New achievement</small></div></div>`).join('')}
    <button class="big" data-act="home">Continue</button>`;
  newAch = [];
  L = null;
  show('end');
  fanfare();
  setTimeout(() => seq('praise3', 300, unitDone ? 'p_unit' : 'p_done'), 800);
}

// ---------- taps ----------
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const d = b.dataset;
  if (d.play) { const p = seq(d.play); if (b.closest('.listen') || b.classList.contains('say-b')) glow(b, p); return; }
  if (d.node !== undefined && !d.act) return nodeSheet(+d.node);
  if (b.id === 'mic') return void micTap(d.mode);
  if (b.id === 'pauseBtn') return pauseSheet();
  if (d.voice) { S.voice = d.voice; save(); settingsSheet(); seq('hello'); return; }
  if (d.tog) { S[d.tog] = !S[d.tog]; save(); b.classList.toggle('on', S[d.tog]); return; }
  if (d.goal) { S.goal = +d.goal; save(); settingsSheet(); return; }
  if (d.fit !== undefined) { S.outfit = d.fit; save(); settingsSheet(); return; }
  if (L && !L.locked) {
    const it = L.items[L.i];
    if (d.pick) { if (d.pick === it.p) { b.classList.add('ok'); right(); } else { b.classList.add('bad'); nearly(it.p); } return; }
    if (d.snd || d.opt) {
      const v = d.snd || d.opt;
      document.querySelectorAll('[data-snd],[data-opt]').forEach((x) => x.classList.toggle('sel', x === b));
      L.sel = b; $('foot').querySelector('[data-act=check]').disabled = false;
      glow(b, seq(d.opt ? `ch:${it.c.b}:${v}` : v)); return;
    }
    if (d.ps) { document.querySelectorAll('[data-ps]').forEach((x) => x.classList.toggle('sel', x === b)); L.pairSel = d.ps; glow(b, seq(d.ps)); return; }
    if (d.pp) {
      if (!L.pairSel) { b.animate([{ transform: 'scale(.95)' }, { transform: 'none' }], 200); return; }
      const s = document.querySelector(`[data-ps="${L.pairSel}"]`);
      if (d.pp === L.pairSel) {
        pop(); s.classList.remove('sel'); s.classList.add('ok', 'done'); b.classList.add('ok', 'done'); L.pairSel = null;
        if (--L.pairsLeft === 0) setTimeout(() => right(), 300);
      } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500); boop(); }
      return;
    }
    if (d.tile !== undefined) { L.slots.push(+d.tile); seq(L.tiles[+d.tile].id); drawTiles(); return; }
    if (d.slot !== undefined) { L.slots.splice(+d.slot, 1); drawTiles(); return; }
  }
  switch (d.act) {
    case 'start': return start(NODES[+d.node]);
    case 'fix': return start({ kind: 'fix', id: 'fix' });
    case 'close': stopAudio(); return closeSheet();
    case 'closehome': closeSheet(); return renderHome();
    case 'settings': return settingsSheet();
    case 'ach': return achSheet();
    case 'next': if (L) { L.i++; next(); } return;
    case 'check': {
      const it = L && L.items[L.i];
      if (!it || L.locked) return;
      if (it.t === 'build') {
        const ok = L.slots.map((i) => plain(L.tiles[i].ga)).join(' ') === words(PH[it.p]).map((w) => plain(w.ga)).join(' ');
        return ok ? right() : nearly(it.p);
      }
      if (!L.sel) return;
      const v = L.sel.dataset.snd || L.sel.dataset.opt;
      const want = it.t === 'chat' ? it.c.reply : it.p;
      L.sel.classList.remove('sel');
      if (v === want) {
        L.sel.classList.add('ok');
        if (it.t === 'chat') chatRight(); else right();
      } else { L.sel.classList.add('bad'); nearly(want); }
      return;
    }
    case 'sayok': if (L) { right(true); } return;
    case 'retry': $('after').innerHTML = ''; $('heard').innerHTML = ''; foot(''); return;
    case 'me': return void playMe();
    case 'mute': S.muteUntil = Date.now() + 15 * 60e3; save(); if (L) { L.items = L.items.filter((x, i) => i <= L.i || x.t !== 'say'); L.i++; next(); } return;
    case 'resume': return closeSheet();
    case 'leave': closeSheet(); L = null; stopAudio(); return renderHome();
    case 'home': stopAudio(); return renderHome();
    case 'begin':
      track('open');
      renderHome();
      if (!S.welcomed) { S.welcomed = true; save(); seq('appname', 300, 'p_welcome'); } else seq('appname');
      return;
    case 'reset':
      if (confirm('Start your progress again? Stars, streak and XP will be cleared.')) { localStorage.removeItem(KEY); location.reload(); }
      return;
  }
});

// pause when the phone is locked or the app is hidden; P or Esc also pauses
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAudio(); HEAR.stop(true); if (L && !sheetOpen()) pauseSheet(); } });
document.addEventListener('keydown', (e) => {
  if (!L || !['p', 'P', 'Escape'].includes(e.key)) return;
  if (!sheetOpen()) pauseSheet(); else closeSheet();
});

// splash
$('splash').innerHTML = `${HARE('cheer', S.outfit)}<h1>Cluas ar Luas</h1><p>Learn Irish by ear</p><button class="big" style="max-width:320px" data-act="begin">▶ ${S.lessons ? 'Continue' : 'Start'}</button>`;
show('splash');
if (LOCAL) window.__cal = { S, NODES, start, get L() { return L; }, next: () => { if (L) { L.i++; next(); } }, renderHome };
})();
