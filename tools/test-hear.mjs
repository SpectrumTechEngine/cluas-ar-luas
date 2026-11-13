// Tests the speaking check without a person: Azure's Irish voice says each phrase, Azure's Irish listener hears it,
// and the app's own scoring decides the stars. Also tests a WRONG phrase for each, which should NOT get 3 stars.
//   node tools/test-hear.mjs [count]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { hear } from './dev-hear.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { self: {}, location: { hostname: 'localhost' }, navigator: {}, performance, URL, Blob, fetch, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'content.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'hear.js'), 'utf8'), ctx);
const { PHRASES } = ctx.self.CONTENT, { score } = ctx.self.HEAR;
const cfg = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), 'Documents', 'SpectrumTechEngine-keys', 'azure-speech.txt'), 'utf8').replace(/^﻿/, '').split(/\r?\n/).map((l) => l.split('=').map((s) => s.trim())).filter((p) => p[0] && p[1]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function speak(text, voice) {
  const r = await fetch(`https://${cfg.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': cfg.key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm', 'User-Agent': 'cluas-test' },
    body: `<speak version="1.0" xml:lang="ga-IE"><voice name="${voice}">${text}</voice></speak>`,
  });
  if (!r.ok) throw new Error('tts ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

const n = +process.argv[2] || 12;
const list = PHRASES.filter((_, i) => i % Math.max(1, Math.floor(PHRASES.length / n)) === 0).slice(0, n);
let good = 0, falsePass = 0;
for (const p of list) {
  const wav = await speak(p.ga.replace(/[<>&]/g, ''), Math.random() < 0.5 ? 'ga-IE-ColmNeural' : 'ga-IE-OrlaNeural');
  await sleep(3200);
  const h = await hear(wav);
  await sleep(3200);
  const s = score(p.ga, h.texts);
  const other = PHRASES.find((q) => q.look !== p.look && q.id !== p.id && Math.abs(q.ga.length - p.ga.length) < 8) || PHRASES[0];
  const s2 = score(other.ga, h.texts);
  if (s.stars === 3) good++;
  if (s2.stars === 3) falsePass++;
  console.log(`${s.stars}★  ${p.ga.padEnd(28)} heard: ${(h.texts[0] || '(nothing)').padEnd(30)} | vs "${other.ga}": ${s2.stars}★`);
}
console.log(`\nRight phrase got 3 stars: ${good}/${list.length}.  Wrong phrase wrongly got 3 stars: ${falsePass}/${list.length}.`);
