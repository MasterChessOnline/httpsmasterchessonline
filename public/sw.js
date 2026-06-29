// MasterChess service worker - lightweight offline shell + cache for static assets
const CACHE = "mc-shell-v11-entry-watchdog";
const SHELL = ["/manifest.json", "/favicon.ico", "/app-icon-192.png", "/app-icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Allow the page to trigger immediate activation of a newly installed worker.
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Don't cache API / supabase / dynamic
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.includes("supabase")) return;
  // Never cache SEO/crawler files — crawlers must always see the latest.
  if (
    url.pathname === "/robots.txt" ||
    url.pathname.startsWith("/sitemap") ||
    url.pathname.endsWith(".xml") ||
    url.pathname.startsWith("/.well-known/") ||
    url.pathname === "/ai.txt" ||
    url.pathname === "/llms.txt" ||
    url.pathname === "/humans.txt"
  ) return;

  // P0 entry safety: HTML navigations must never be served from an old cached
  // app shell. If the network is unavailable, return a tiny visible offline
  // page instead of a blank gradient/background-only shell.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          return res;
        })
        .catch(() => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MasterChess — Offline</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#071226;color:#f7ecd1;font-family:system-ui;text-align:center;padding:24px}a,button{display:inline-flex;align-items:center;justify-content:center;height:44px;border-radius:8px;border:1px solid #d4af37;background:#d4af37;color:#071226;font-weight:800;padding:0 16px;text-decoration:none}</style></head><body><main><h1>MasterChess</h1><p>You're offline. Reconnect and retry.</p><button onclick="location.reload()">Retry</button></main></body></html>`, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }))
    );
    return;
  }

  if (/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ico|json)$/.test(url.pathname)) {
    // Entry reliability: JS/CSS must be network-first so an old cached chunk
    // can never keep users stuck on the splash/loader after a new release.
    if (/\.(?:js|css)$/.test(url.pathname)) {
      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => caches.match(req))
      );
      return;
    }

    // Piece artwork: network-first so any broken cache heals on next load.
    const isPieceAsset = url.pathname.startsWith("/pieces/");
    if (isPieceAsset) {
      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => caches.match(req))
      );
      return;
    }
    e.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
      )
    );
  }
});

// Push notifications support
self.addEventListener("push", (event) => {
  let data = { title: "Master Chess", body: "You have a new notification", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/app-icon-192.png",
      badge: "/app-icon-192.png",
      data: { url: data.url },
      vibrate: [80, 40, 80],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
