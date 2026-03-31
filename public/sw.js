// ─── Service Worker — Mi Psicólogo PWA ────────────────────────────────────────
// Carga Firebase messaging para recibir push en background (app cerrada)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// La config se inyecta desde el build de Vite vía import.meta.env
// Como el SW no tiene acceso a env, usamos un archivo generado o variables inline
firebase.initializeApp({
  apiKey:            "AIzaSyBEGQkQ-0KOKVIeCieayUWZ-4yDiw3U8hQ",
  authDomain:        "mipsicologo-13044.firebaseapp.com",
  projectId:         "mipsicologo-13044",
  storageBucket:     "mipsicologo-13044.firebasestorage.app",
  messagingSenderId: "962020436801",
  appId:             "1:962020436801:web:18c5be88649a8d99e58fc0",
});

const messaging = firebase.messaging();

// ─── Push en BACKGROUND (app minimizada o cerrada) ───────────────────────────
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data         = payload.data         || {};

  const options = {
    body:              notification.body  || '',
    icon:              notification.icon  || '/icon-192.png',
    badge:                                   '/icon-192.png',
    tag:               data.tag           || data.citaId || String(Date.now()),
    data,
    vibrate:           [200, 100, 200],
    requireInteraction: data.requireInteraction === 'true',
    timestamp:         Date.now(),
    actions: data.link ? [
      { action: 'open',    title: 'Abrir'     },
      { action: 'dismiss', title: 'Descartar' },
    ] : [],
  };

  return self.registration.showNotification(
    notification.title || 'Mi Psicólogo',
    options
  );
});

// ─── Click en la notificación ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const data = event.notification.data || {};
  const url  = data.link || 'https://mipsicologo.vercel.app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta en alguna pestaña → enfocarla y mandar mensaje
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data });
          return client.focus();
        }
      }
      // Si no está abierta → abrir la URL
      if (clients.openWindow) {
        return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
      }
    })
  );
});

// ─── Instalación y activación del SW ─────────────────────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
