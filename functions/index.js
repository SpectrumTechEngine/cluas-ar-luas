// Cluas ar Luas listener (Firebase project chopthecheck, region europe-west1).
// The app sends a short 16 kHz WAV recording; this asks Azure's Irish speech listener what it heard
// and sends back { texts: [...] }. The Azure key lives only here, as the secret AZURE_SPEECH_KEY.
// Recordings are passed straight through and never stored.
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const AZURE_KEY = defineSecret('AZURE_SPEECH_KEY');
const AZURE_REGION = 'francecentral';
const ORIGINS = ['https://thespectrumtechengine.com', 'https://spectrumtechengine.github.io', 'http://localhost:5331'];

// simple per-visitor limit: 20 checks a minute
const hits = new Map();
function tooMany(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60e3);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

exports.cluasHear = onRequest({ region: 'europe-west1', secrets: [AZURE_KEY], cors: ORIGINS, maxInstances: 3, memory: '256MiB', timeoutSeconds: 30 }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('POST only');
  const body = req.rawBody;
  if (!body || body.length < 1000 || body.length > 600000 || body.toString('ascii', 0, 4) !== 'RIFF') return res.status(400).send('Send a short WAV');
  if (tooMany(req.ip || 'x')) return res.status(429).send('Slow down');
  try {
    const r = await fetch(`https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=ga-IE&format=detailed&profanity=raw`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY.value(), 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
      body,
    });
    if (!r.ok) return res.status(502).json({ texts: [], why: 'azure ' + r.status });
    const j = await r.json();
    const texts = [...new Set([...(j.NBest || []).flatMap((n) => [n.Display, n.Lexical]), j.DisplayText].filter(Boolean))].slice(0, 8);
    res.json({ texts });
  } catch (e) {
    res.status(502).json({ texts: [], why: 'error' });
  }
});
