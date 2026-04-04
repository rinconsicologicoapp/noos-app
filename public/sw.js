// ─── Service Worker — Mi Psicólogo PWA ────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');
 
firebase.initializeApp({
  apiKey:            "AIzaSyBEGQkQ-0KOKVIeCieayUWZ-4yDiw3U8hQ",
  authDomain:        "mipsicologo-13044.firebaseapp.com",
  projectId:         "mipsicologo-13044",
  storageBucket:     "mipsicologo-13044.firebasestorage.app",
  messagingSenderId: "962020436801",
  appId:             "1:962020436801:web:18c5be88649a8d99e58fc0",
});
 
const messaging = firebase.messaging();
 
// ─── Push en BACKGROUND ───────────────────────────────────────────────────────
// titulo y mensaje vienen en data (no en notification payload)
// Sin notification payload = el navegador NO muestra nada automático
// Solo el SW controla el display → elimina la doble notificación
messaging.onBackgroundMessage((payload) => {
  const data   = payload.data || {};
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || payload.notification?.title || 'Mi Psicólogo';
  const cuerpo = data.mensaje || payload.notification?.body  || '';
 
  const vibracion = {
    'recordatorio_cita': data.requireInteraction === 'true'
                           ? [400, 100, 400, 100, 600]
                           : [200, 100, 200],
    'demora':            [300, 80, 300, 80, 300],
    'tarea_completada':  [150, 50, 150],
    'notif_programada':  [200, 100, 400],
  }[tipo] || [200, 100, 200];
 
  const icono = {
    'cita_nueva':        '/icons/icon-calendar.png',
    'recordatorio_cita': '/icons/icon-calendar.png',
    'cita_confirmada':   '/icons/icon-check.png',
    'cita_cancelada':    '/icons/icon-cancel.png',
    'tarea_completada':  '/icons/icon-task.png',
    'nueva_resena':      '/icons/icon-star.png',
    'demora':            '/icons/icon-clock.png',
    'notif_programada':  '/icons/icon-bell.png',
  }[tipo] || '/icon-192.png';
 
  const acciones = {
    'recordatorio_cita': data.link
      ? [{ action: 'join',    title: '🔗 Unirse ahora' }, { action: 'dismiss', title: 'Descartar' }]
      : [{ action: 'open',    title: '📅 Ver cita'     }, { action: 'dismiss', title: 'Descartar' }],
    'cita_nueva':       [{ action: 'open', title: '📅 Ver cita'   }, { action: 'dismiss', title: 'Más tarde' }],
    'tarea_completada': [{ action: 'open', title: '✅ Ver tarea'  }, { action: 'dismiss', title: 'OK'        }],
    'demora':           [{ action: 'open', title: '⏱ Ver aviso'   }, { action: 'dismiss', title: 'Entendido' }],
    'nueva_resena':     [{ action: 'open', title: '⭐ Ver reseña' }, { action: 'dismiss', title: 'Cerrar'    }],
  }[tipo] || [{ action: 'open', title: 'Abrir' }, { action: 'dismiss', title: 'Descartar' }];
 
  const options = {
    body:               cuerpo,
    icon:               icono,
    badge:              '/icon-192.png',
    tag:                data.tag || data.citaId || tipo,
    renotify:           false,
    data,
    vibrate:            vibracion,
    requireInteraction: data.requireInteraction === 'true' || tipo === 'demora',
    silent:             false,
    timestamp:          Date.now(),
    dir:                'ltr',
    lang:               'es',
    actions:            acciones,
  };
 
  return self.registration.showNotification(titulo, options);
});
 
// ─── Prevenir doble notif cuando app está en primer plano ────────────────────
self.addEventListener('push', (event) => {
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.some(c => c.visibilityState === 'visible')) return Promise.resolve();
    })
  );
});
 
// ─── Click en notificación ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const data = event.notification.data || {};
  const url  = data.link || 'https://mipsicologo.vercel.app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.postMessage({ type: 'NOTIFICATION_CLICK', data }); return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
    })
  );
});
 
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });
