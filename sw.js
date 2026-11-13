// Cluas ar Luas: keeps a copy of the app and all its sound files so it works without internet,
// and always fetches the newest version when online. Bump the cache name on every release.
const C = 'cluas-ar-luas-v2';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(async (c) => {
    await c.addAll(['./', 'app.js', 'content.js', 'pics.js', 'hear.js', 'icon-192.png', 'icon-512.png']);
    // audio/list.json is written by tools/make-audio.mjs and lists every sound file
    try { const list = await (await fetch('audio/list.json', { cache: 'no-store' })).json(); await c.addAll(list); } catch {}
  }).catch(() => {}));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  // sound files and fonts never change: saved copy first
  if (font || u.pathname.endsWith('.mp3')) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
    return;
  }
  // everything else: newest first, saved copy when offline
  e.respondWith(fetch(r).then((res) => { if (res && res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then((m) => m || (r.mode === 'navigate' ? caches.match('./') : undefined))));
});
