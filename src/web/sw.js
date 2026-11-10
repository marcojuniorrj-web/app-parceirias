// Service worker: guarda a "casca" do app para abrir rápido e funcionar sem rede. Dados da API nunca são guardados aqui.
const VERSAO = 'v1';
const CACHE = `parceiros-${VERSAO}`;
const CASCA = ['/', '/index.html', '/app.css', '/manifest.webmanifest', '/icons/icone.svg', '/icons/icone-192.png',
  '/js/app.js', '/js/api.js', '/js/componentes.js', '/js/config.js', '/js/icones.js', '/js/menu.js', '/js/telas.js', '/js/util.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return; // API: sempre rede
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }
  // arquivos do app: mostra o que está guardado e atualiza em segundo plano
  e.respondWith(
    caches.match(req).then((guardado) => {
      const rede = fetch(req).then((r) => { if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone())); return r; }).catch(() => guardado);
      return guardado || rede;
    }),
  );
});
