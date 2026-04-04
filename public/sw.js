// ─── Service Worker — Mi Psicólogo PWA ────────────────────────────────────────
// Carga Firebase messaging para recibir push en background (app cerrada)

importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

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
  const tipo         = data.tipo            || 'general';

  // ─── Vibración según urgencia ────────────────────────────────────────────
  // 5min antes: vibración larga e insistente (como llamada entrante)
  // 1h antes:   vibración suave
  // demora:     doble pulso (señal de alerta)
  // resto:      patrón estándar
  const vibracion = {
    '5m':                   [400, 100, 400, 100, 600],
    'recordatorio_cita':    data.requireInteraction === 'true'
                              ? [400, 100, 400, 100, 600]
                              : [200, 100, 200],
    'demora':               [300, 80, 300, 80, 300],
    'tarea_completada':     [150, 50, 150],
    'notif_programada':     [200, 100, 400],
  }[tipo] || [200, 100, 200];

  // ─── Ícono según tipo ────────────────────────────────────────────────────
  const icono = {
    'cita_nueva':           '/icons/icon-calendar.png',
    'recordatorio_cita':    '/icons/icon-calendar.png',
    'cita_confirmada':      '/icons/icon-check.png',
    'cita_cancelada':       '/icons/icon-cancel.png',
    'tarea_completada':     '/icons/icon-task.png',
    'nueva_resena':         '/icons/icon-star.png',
    'demora':               '/icons/icon-clock.png',
    'notif_programada':     '/icons/icon-bell.png',
  }[tipo] || '/icon-192.png';

  // ─── Acciones según tipo ─────────────────────────────────────────────────
  const acciones = {
    'recordatorio_cita': data.link
      ? [
          { action: 'join',    title: '🔗 Unirse ahora' },
          { action: 'dismiss', title: 'Descartar'       },
        ]
      : [
          { action: 'open',    title: '📅 Ver cita'  },
          { action: 'dismiss', title: 'Descartar'    },
        ],
    'cita_nueva': [
      { action: 'open',    title: '📅 Ver cita'   },
      { action: 'dismiss', title: 'Más tarde'     },
    ],
    'tarea_completada': [
      { action: 'open',    title: '✅ Ver tarea'  },
      { action: 'dismiss', title: 'OK'            },
    ],
    'demora': [
      { action: 'open',    title: '⏱ Ver aviso'  },
      { action: 'dismiss', title: 'Entendido'     },
    ],
    'nueva_resena': [
      { action: 'open',    title: '⭐ Ver reseña' },
      { action: 'dismiss', title: 'Cerrar'        },
    ],
  }[tipo] || [
    { action: 'open',    title: 'Abrir'      },
    { action: 'dismiss', title: 'Descartar'  },
  ];

  // ─── requireInteraction: la notificación NO desaparece sola ─────────────
  // Solo para citas que empiezan en 5 minutos o avisos de demora
  const persistente = data.requireInteraction === 'true'
    || tipo === 'demora';

  const options = {
    body:               notification.body || '',
    icon:               icono,
    badge:              '/icon-192.png',
    tag:                data.tag || data.citaId || tipo + '_' + Date.now(),
    renotify:           true,
    data,
    vibrate:            vibracion,
    requireInteraction: persistente,
    silent:             false,
    timestamp:          Date.now(),
    dir:                'ltr',
    lang:               'es',
    actions:            acciones,
  };

  return self.registration.showNotification(
    notification.title || 'Mi Psicólogo',
    options
  );
});

// ─── Prevenir notificación OS cuando la app está en primer plano ──────────────
// Cuando la app está visible, el onMessage del cliente ya la maneja con toast.
// Esto evita la doble notificación (una del SW y otra del onMessage de la app).
self.addEventListener('push', (event) => {
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const appVisible = clientList.some(c => c.visibilityState === 'visible');
      if (appVisible) {
        // App en primer plano → NO mostrar notificación OS
        return Promise.resolve();
      }
      // App en background → onBackgroundMessage la maneja normalmente
    })
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
