// Makes every sound file for Cluas ar Luas with Microsoft Azure's voices.
//   node tools/make-audio.mjs           -> makes only the files that are missing
//   node tools/make-audio.mjs --force   -> remakes all of them
//   node tools/make-audio.mjs --check   -> just checks content.js and counts files, makes nothing
//
// Needs Documents\SpectrumTechEngine-keys\azure-speech.txt with two lines:  key=...  and  region=...
// The key is never printed and never goes in the repo.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const CHECK = process.argv.includes('--check');

const sandbox = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'content.js'), 'utf8'), sandbox);
const { PHRASES, UNITS, CHARS, IRISH, ENGLISH, words } = sandbox.self.CONTENT;
const byId = Object.fromEntries(PHRASES.map((p) => [p.id, p]));

// ---- check content.js ----
let problems = 0;
for (const p of PHRASES) {
  const w = words(p);
  const n = p.say.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean).length;
  if (w.length !== n) { console.log(`  ! ${p.id}: ${w.length} Irish words but ${n} sound-it-out chunks`); problems++; }
}
const chats = UNITS.flatMap((u) => [...u.lessons.flatMap((l) => l.chat || []), ...u.challenge]);
for (const u of UNITS) for (const l of u.lessons) for (const id of l.phrases) if (!byId[id]) { console.log(`  ! lesson ${l.id}: unknown phrase ${id}`); problems++; }
for (const c of chats) for (const id of [c.says, c.reply, ...c.wrong]) if (!byId[id]) { console.log(`  ! chat: unknown phrase ${id}`); problems++; }
if (problems) { console.log(`${problems} problem(s) in content.js. Fix them first.`); process.exit(1); }

// ---- list every file ----
const TEACH = { orla: { ga: 'ga-IE-OrlaNeural', en: 'en-IE-EmilyNeural' }, colm: { ga: 'ga-IE-ColmNeural', en: 'en-IE-ConnorNeural' } };
const jobs = [];
const add = (file, voice, lang, text, rate = '0%', pitch = '+0%') => jobs.push({ file, voice, lang, text, rate, pitch });
const allWords = new Map();
for (const p of PHRASES) for (const w of words(p)) if (!allWords.has(w.id)) allWords.set(w.id, w.ga);
for (const [v, n] of Object.entries(TEACH)) {
  for (const p of [...PHRASES, ...IRISH]) {
    add(`audio/${v}/${p.id}.mp3`, n.ga, 'ga-IE', p.ga, '-5%');
    if (byId[p.id]) add(`audio/${v}/${p.id}-slow.mp3`, n.ga, 'ga-IE', p.ga, '-40%');
  }
  for (const [id, ga] of allWords) add(`audio/${v}/${id}.mp3`, n.ga, 'ga-IE', ga, '-15%');
  for (const [id, text] of Object.entries(ENGLISH)) add(`audio/${v}/${id}.mp3`, n.en, 'en-IE', text);
}
const lines = new Set();
for (const c of chats) { lines.add(`${c.a}|${c.says}`); lines.add(`${c.b}|${c.reply}`); for (const w of c.wrong) lines.add(`${c.b}|${w}`); }
for (const l of lines) {
  const [who, id] = l.split('|');
  const ch = CHARS[who];
  add(`audio/ch/${who}_${id}.mp3`, TEACH[ch.voice].ga, 'ga-IE', byId[id].ga, ch.rate, ch.pitch);
}

const todo = jobs.filter((j) => FORCE || !fs.existsSync(path.join(ROOT, j.file)));
console.log(`${jobs.length} sound files in total, ${todo.length} to make (about ${Math.ceil(todo.length * 3.2 / 60)} min).`);
if (CHECK) process.exit(0);

// ---- make them ----
const KEYFILE = path.join(os.homedir(), 'Documents', 'SpectrumTechEngine-keys', 'azure-speech.txt');
if (!fs.existsSync(KEYFILE)) { console.log('Could not find ' + KEYFILE); process.exit(1); }
const cfg = Object.fromEntries(fs.readFileSync(KEYFILE, 'utf8').replace(/^﻿/, '').split(/\r?\n/).map((l) => l.split('=').map((s) => s.trim())).filter((p) => p[0] && p[1]));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function make(j) {
  const ssml = `<speak version="1.0" xml:lang="${j.lang}"><voice name="${j.voice}"><prosody rate="${j.rate}" pitch="${j.pitch}">${esc(j.text)}</prosody></voice></speak>`;
  for (let tries = 0; tries < 6; tries++) {
    const res = await fetch(`https://${cfg.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': cfg.key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'cluas-ar-luas-audio-maker' },
      body: ssml,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) { console.log('  Azure says slow down, waiting 20 s...'); await sleep(20000); continue; }
    if (res.status === 401) throw new Error('Azure refused the key (401). Check azure-speech.txt.');
    throw new Error(`Azure error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('Gave up after 6 tries.');
}
let n = 0;
for (const j of todo) {
  n++;
  const out = path.join(ROOT, j.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await make(j));
  if (n % 10 === 0 || n === todo.length) console.log(`  ${n}/${todo.length}  ${j.file}`);
  await sleep(3100); // the free tier allows 20 a minute
}
fs.writeFileSync(path.join(ROOT, 'audio', 'list.json'), JSON.stringify(jobs.map((j) => j.file).filter((f) => fs.existsSync(path.join(ROOT, f)))));
console.log('Done. audio/list.json updated. Bump the cache name in sw.js before publishing.');
