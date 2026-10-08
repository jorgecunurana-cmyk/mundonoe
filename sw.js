// Mundo Noe: permite abrir la app sin internet
const CACHE='mundonoe-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // La base de datos de Firebase maneja su propia conexión: no se toca
  if(u.hostname.includes('firestore.googleapis.com')||u.hostname.includes('identitytoolkit')||u.hostname.includes('securetoken'))return;
  if(r.mode==='navigate'||u.origin===location.origin){
    // Primero internet (para recibir actualizaciones); si no hay, la copia guardada
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  if(/gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)){
    // Librerías y fuentes: se guardan la primera vez y luego abren sin internet
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
  }
});
