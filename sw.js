/* Service worker : l'app fonctionne sans internet une fois ouverte une première fois.
   Fichiers du site : réseau d'abord (les modifications sont visibles tout de suite), cache si hors ligne.
   Polices Google : cache d'abord. Changer VERSION pour vider l'ancien cache. */
const VERSION = "boxes-v1";
const CORE = ["./", "./index.html", "./css/style.css", "./js/concours.js", "./js/app.js", "./icon.svg", "./manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  const put = res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(put).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./index.html"))));
  } else if (/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(put)));
  }
});
