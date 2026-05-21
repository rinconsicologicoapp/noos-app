// ─── Service Worker — Mi Psicólogo PWA ────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyAMxJlSS7b4elSZea3NaSn7DfiE7G2d2xY",
  authDomain:        "mipsicologo-13044.firebaseapp.com",
  projectId:         "mipsicologo-13044",
  storageBucket:     "mipsicologo-13044.firebasestorage.app",
  messagingSenderId: "962020436801",
  appId:             "1:962020436801:web:18c5be88649a8d99e58fc0",
});

const messaging = firebase.messaging();

// ─── Tipos críticos — SIEMPRE muestran notificación aunque la app esté abierta ─
const TIPOS_CRITICOS = [
  'cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','tarea_completada','demora','nueva_resena',
  'notif_programada','recordatorio_recurrente','juego_turno',
  'sesion_clinica','habitos_actualizados','broadcast','recurso_nuevo', // nuevos tipos
];

// ─── Tipos que SIEMPRE requieren interacción (no desaparecen solos) ───────────
const TIPOS_PERSISTENTES = [
  'cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','demora','sesion_clinica',
];

// ─── Track para evitar doble notificación entre push y onBackgroundMessage ─────
const shownTags = new Set();

// ─── Función central que muestra la notificación ──────────────────────────────
function mostrarNotificacion(data) {
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || 'Mi Psicólogo';
  const cuerpo = data.mensaje || '';
  const tag    = data.tag || data.citaId || tipo;
  const requireInteraction =
    data.requireInteraction === 'true' || TIPOS_PERSISTENTES.includes(tipo);

  // Evitar duplicado si ya la mostró onBackgroundMessage o el push handler
  if (shownTags.has(tag)) return Promise.resolve();
  shownTags.add(tag);
  setTimeout(() => shownTags.delete(tag), 2500); // ventana corta — permite re-alertas

  // Patrones de vibración agresivos — se sienten incluso en bolsillo
  const vibracion = {
    'cita_nueva':           [0, 300, 100, 300, 100, 600, 200, 400],
    'recordatorio_cita':    [0, 400, 100, 400, 100, 800],
    'cita_confirmada':      [0, 200, 100, 200, 100, 400],
    'cita_cancelada':       [0, 500, 200, 500],
    'tarea_nueva':          [0, 250, 100, 250, 100, 500],
    'tarea_completada':     [0, 150, 80,  150, 80,  300],
    'demora':               [0, 500, 150, 500, 150, 800],
    'sesion_clinica':       [0, 300, 100, 300, 100, 600],
    'habito_recordatorio':  [0, 200, 100, 200],
    'habitos_actualizados': [0, 200, 100, 200, 100, 300],
    'broadcast':            [0, 250, 100, 250],
    'nueva_resena':         [0, 200, 100, 200],
    'recordatorio_recurrente': [0, 250, 100, 250, 100, 400],
  }[tipo] || [0, 300, 100, 300, 100, 500]; // patrón por defecto más agresivo

  const icono = {
    'cita_nueva':           '/icons/icon-calendar.png',
    'recordatorio_cita':    '/icons/icon-calendar.png',
    'cita_confirmada':      '/icons/icon-check.png',
    'cita_cancelada':       '/icons/icon-cancel.png',
    'tarea_nueva':          '/icons/icon-task.png',
    'tarea_completada':     '/icons/icon-task.png',
    'nueva_resena':         '/icons/icon-star.png',
    'demora':               '/icons/icon-clock.png',
    'notif_programada':     '/icons/icon-bell.png',
    'sesion_clinica':       '/icon-192.png',
    'habito_recordatorio':  '/icon-192.png',
    'broadcast':            '/icon-192.png',
  }[tipo] || '/icon-192.png';

  const acciones = {
    'recordatorio_cita': data.link
      ? [{ action:'join',    title:'Unirse ahora' }, { action:'dismiss', title:'Descartar' }]
      : [{ action:'open',    title:'Ver cita'     }, { action:'dismiss', title:'Descartar' }],
    'cita_nueva':        [{ action:'open',    title:'Ver cita'     }, { action:'dismiss', title:'Más tarde'  }],
    'cita_confirmada':   [{ action:'open',    title:'Ver cita'     }, { action:'dismiss', title:'OK'         }],
    'cita_cancelada':    [{ action:'open',    title:'Ver detalles' }, { action:'dismiss', title:'Entendido'  }],
    'tarea_nueva':       [{ action:'open',    title:'Ver tarea'    }, { action:'dismiss', title:'Más tarde'  }],
    'tarea_completada':  [{ action:'open',    title:'Ver tarea'    }, { action:'dismiss', title:'OK'         }],
    'demora':            [{ action:'open',    title:'Ver aviso'    }, { action:'dismiss', title:'Entendido'  }],
    'sesion_clinica':    [{ action:'open',    title:'Mi Proceso'   }, { action:'dismiss', title:'Más tarde'  }],
    'nueva_resena':      [{ action:'open',    title:'Ver reseña'   }, { action:'dismiss', title:'Cerrar'     }],
    'broadcast':         [{ action:'open',    title:'Abrir'        }, { action:'dismiss', title:'Descartar'  }],
  }[tipo] || [{ action:'open', title:'Abrir' }, { action:'dismiss', title:'Descartar' }];

  return self.registration.showNotification(titulo, {
    body:               cuerpo,
    icon:               icono,
    badge:              '/icon-192.png',
    tag,
    renotify:           true,            // siempre re-vibra aunque el tag ya exista
    data,
    vibrate:            vibracion,
    requireInteraction,                  // persiste hasta que el usuario la toca
    silent:             false,
    timestamp:          Date.now(),
    dir:                'ltr',
    lang:               'es',
    actions:            acciones,
  });
}

// ─── RUTA 1: push event directo (más confiable en todos los navegadores) ───────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  let tieneNotificationField = false;
  try {
    const raw = event.data.json();
    data = raw.data || raw;
    // Si el payload tiene notification field, Chrome ya mostró la notif automáticamente
    tieneNotificationField = !!(raw.notification);
  } catch {}

  const tipo = data.tipo || 'general';
  const tag  = data.tag || data.citaId || tipo;

  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(async (list) => {
      const appVisible = list.some(c => c.visibilityState === 'visible');
      if (!TIPOS_CRITICOS.includes(tipo) && appVisible) return;

      // Si Chrome ya mostró la notif via notification field, solo mostrar si app visible
      // para el caso foreground. En background Chrome la maneja sola.
      if (tieneNotificationField) {
        const existing = await self.registration.getNotifications({ tag });
        if (existing.length > 0) return; // ya está visible, no duplicar
      }
      return mostrarNotificacion(data);
    })
  );
});

// ─── RUTA 2: onBackgroundMessage de Firebase (respaldo para cuando push falla) ─
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const tipo = data.tipo || 'general';
  const tag  = data.tag || data.citaId || tipo;

  // Si ya lo manejó el push event handler, no duplicar
  if (shownTags.has(tag)) return Promise.resolve();

  return clients.matchAll({ type:'window', includeUncontrolled:true }).then((list) => {
    const appVisible = list.some(c => c.visibilityState === 'visible');
    if (!TIPOS_CRITICOS.includes(tipo) && appVisible) return;
    return mostrarNotificacion(data);
  });
});

// ─── Click en notificación ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const data = event.notification.data || {};
  const url  = data.link || 'https://mipsicologo.vercel.app';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.postMessage({ type:'NOTIFICATION_CLICK', data }); return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
    })
  );
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });