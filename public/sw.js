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

// ─── Flag: app abierta en primer plano ───────────────────────────────────────
// Cuando App.jsx recibe onMessage (app visible), le avisa al SW vía postMessage.
// El SW guarda el tag por 4 segundos — si llega onBackgroundMessage con ese mismo
// tag en ese ventana, lo suprime para no duplicar.
const foregroundTags = new Set();

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FCM_FOREGROUND') {
    const tag = event.data.tag || '__foreground__';
    foregroundTags.add(tag);
    setTimeout(() => foregroundTags.delete(tag), 4000);
  }
});

// ─── Push en BACKGROUND ───────────────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  const data   = payload.data || {};
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || payload.notification?.title || 'Mi Psicólogo';
  const cuerpo = data.mensaje || payload.notification?.body  || '';
  const tag    = data.tag || data.citaId || tipo;

  // Si la app está en primer plano y ya avisó → no duplicar
  // También verificamos si hay cliente visible directamente
  const TIPOS_CRITICOS = ['cita_nueva', 'recordatorio_cita', 'demora', 'cita_cancelada', 'notif_programada'];

  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const appVisible = list.some(c => c.visibilityState === 'visible');
    if (!TIPOS_CRITICOS.includes(tipo) && (appVisible || foregroundTags.has(tag) || foregroundTags.has('__foreground__'))) {
      return;
    }

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

    return self.registration.showNotification(titulo, {
      body:               cuerpo,
      icon:               icono,
      badge:              '/icon-192.png',
      tag,
      renotify:           false,
      data,
      vibrate:            vibracion,
      requireInteraction: data.requireInteraction === 'true' || tipo === 'demora',
      silent:             false,
      timestamp:          Date.now(),
      dir:                'ltr',
      lang:               'es',
      actions:            acciones,
    });
  });
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
