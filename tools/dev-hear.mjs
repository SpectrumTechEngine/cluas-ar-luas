// Local stand-in for the cluasHear Cloud Function, for testing on this computer only.
//   node tools/dev-hear.mjs    -> listens on http://localhost:5332/hear
// Takes a 16 kHz WAV, asks Azure's Irish listener what it heard, returns { texts: [...] }.
// Reads the key from Documents\SpectrumTechEngine-keys\azure-speech.txt (never printed).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const KEYFILE = path.join(os.homedir(), 'Documents', 'SpectrumTechEngine-keys', 'azure-speech.txt');
const cfg = Object.fromEntries(fs.readFileSync(KEYFILE, 'utf8').replace(/^﻿/, '').split(/\r?\n/).map((l) => l.split('=').map((s) => s.trim())).filter((p) => p[0] && p[1]));

export async function hear(wav) {
  const r = await fetch(`https://${cfg.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=ga-IE&format=detailed&profanity=raw`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': cfg.key, 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
    body: wav,
  });
  if (!r.ok) throw new Error('Azure ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  const texts = [...new Set([...(j.NBest || []).flatMap((n) => [n.Display, n.Lexical]), j.DisplayText].filter(Boolean))];
  return { texts, status: j.RecognitionStatus };
}

if (process.argv[1] && process.argv[1].endsWith('dev-hear.mjs')) {
  http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.end();
    if (req.method !== 'POST' || !req.url.startsWith('/hear')) { res.statusCode = 404; return res.end(); }
    const chunks = []; for await (const c of req) chunks.push(c);
    try {
      const out = await hear(Buffer.concat(chunks));
      console.log('heard:', out.texts[0] || '(nothing)', out.status);
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(out));
    } catch (e) { console.log(e.message); res.statusCode = 502; res.end('{}'); }
  }).listen(5332, () => console.log('dev listener on http://localhost:5332/hear'));
}
