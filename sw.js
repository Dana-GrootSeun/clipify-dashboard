// ponytail: cache-first for the shell so the app opens offline; API calls always hit network.
const CACHE = "clipify-v4";
const SHELL = ["./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  // never cache API / video: always fresh, and they don't belong in the shell
  if (url.includes("googleapis.com") || url.endsWith(".mp4")) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
