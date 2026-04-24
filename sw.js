const V='pl-v3';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(['./index.html','./manifest.json']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const isNav=e.request.mode==='navigate'||url.pathname.endsWith('index.html')||url.pathname.endsWith('/');
  if(isNav){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(ca=>ca.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(ca=>ca.put(e.request,c));}return r;}).catch(()=>new Response('Offline',{status:503}));}));
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
