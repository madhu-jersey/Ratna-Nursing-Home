// Keeps the app's own files on the phone so it opens instantly, then updates them in the background.
// Bookings are never stored here: they come from the booking service with the PIN.
const CACHE = 'rnh-reception-v1';
const SHELL = ['./', 'app.css', 'app.js', 'manifest.webmanifest', '/assets/img/favicon.svg', '/assets/img/logo-240.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // the booking service always goes to the network
  // Show the saved copy at once; fetch a fresh one for next time
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = e.request.mode === 'navigate' ? './' : e.request;
    const saved = await cache.match(key, { ignoreSearch: e.request.mode === 'navigate' });
    const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(key, res.clone()); return res; }).catch(() => saved);
    return saved || fresh;
  }));
});
