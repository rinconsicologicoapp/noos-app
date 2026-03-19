importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCw7ZE3qSztLvNRimAiIH4K2XkQrD1h8Uc",
  authDomain: "mipsicologo-13044.firebaseapp.com",
  projectId: "mipsicologo-13044",
  storageBucket: "mipsicologo-13044.firebasestorage.app",
  messagingSenderId: "962020436801",
  appId: "1:962020436801:web:18c5be88649a8d99e58fc0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
  });
});

const CACHE_NAME = `mi-psicologo-${new Date().toISOString().slice(0,10)}`;
const urlsToCache = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});