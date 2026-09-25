// Panda Squad — service worker
// Cache-first: po pierwszym wejściu aplikacja działa offline
// (logo jest wbudowane w index.html jako base64, więc nie trzeba go
// cache'ować osobno; czcionki Google Fonts wymagają połączenia przy
// pierwszym uruchomieniu, potem są cache'owane przez przeglądarkę).

var CACHE_NAME = 'panda-squad-v1';
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(response){
        // nie cache'ujemy odpowiedzi spoza naszej domeny (np. Google Fonts) na sztywno,
        // przeglądarka i tak je cache'uje standardowym mechanizmem HTTP
        return response;
      }).catch(function(){
        // brak sieci i brak w cache — dla nawigacji zwróć stronę główną
        if(event.request.mode === 'navigate'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
