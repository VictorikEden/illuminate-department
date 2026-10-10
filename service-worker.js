const CACHE_PREFIX='illuminate-dms-app-';
const CACHE=`${CACHE_PREFIX}v29`;
const CORE=['./','./index.html','./styles.css','./purple-theme.css','./mobile.css','./visual-icons.js','./app.js','./manifest.webmanifest','./public/dcc-logo.svg'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(CORE.map(path=>new Request(path,{cache:'reload'}))))
));

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key.startsWith('illuminate-dms-')&&key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:event.request.mode==='navigate'?'no-store':'no-cache'});
      if(response.ok)return response;
      throw new Error('Static asset unavailable');
    }catch{
      const cached=await caches.match(event.request);
      if(cached)return cached;
      if(event.request.mode==='navigate')return caches.match(new URL('./index.html',self.registration.scope));
      return Response.error();
    }
  })());
});
self.addEventListener('push',event=>{let data={};try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()}};event.waitUntil(self.registration.showNotification(data.title||'Illuminate Reminder',{body:data.body||'You have an upcoming department item.',tag:data.tag||'illuminate-reminder',data:{url:data.url||'./'},renotify:true}))});
self.addEventListener('notificationclick',event=>{event.notification.close();let target=new URL(event.notification.data?.url||'./',self.registration.scope).href;event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{for(let window of windows){if('focus' in window){window.navigate(target);return window.focus()}}return clients.openWindow(target)}))});
