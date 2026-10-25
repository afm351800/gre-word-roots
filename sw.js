// Offline cache. Network first for the app files so updates arrive; cache as fallback.
const CACHE = "gre-roots-v6";
const CORE = ["./", "index.html", "app.css", "app.js", "words.js", "manifest.webmanifest", "icons/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !u.hostname.includes("fonts.g")) return; // never intercept api.github.com
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g"))) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
