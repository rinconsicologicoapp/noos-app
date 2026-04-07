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

// ─── Tipos que SIEMPRE muestran notificación aunque la app esté abierta ────────
const TIPOS_CRITICOS = ['cita_nueva','recordatorio_cita','demora','cita_cancelada','notif_programada'];

// ─── Track para evitar doble notificación entre push y onBackgroundMessage ─────
const shownTags = new Set();

// ─── Función central que muestra la notificación ──────────────────────────────
function mostrarNotificacion(data) {
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || 'Mi Psicólogo';
  const cuerpo = data.mensaje || '';
  const tag    = data.tag || data.citaId || tipo;

  // Evitar duplicado si ya la mostró onBackgroundMessage o el push handler
  if (shownTags.has(tag)) return Promise.resolve();
  shownTags.add(tag);
  setTimeout(() => shownTags.delete(tag), 8000);

  const vibracion = {
    'recordatorio_cita': data.requireInteraction === 'true' ? [400,100,400,100,600] : [200,100,200],
    'demora':            [300,80,300,80,300],
    'tarea_completada':  [150,50,150],
    'notif_programada':  [200,100,400],
  }[tipo] || [200,100,200];

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
      ? [{ action:'join',    title:'🔗 Unirse ahora' }, { action:'dismiss', title:'Descartar' }]
      : [{ action:'open',    title:'📅 Ver cita'     }, { action:'dismiss', title:'Descartar' }],
    'cita_nueva':       [{ action:'open', title:'📅 Ver cita'   }, { action:'dismiss', title:'Más tarde' }],
    'tarea_completada': [{ action:'open', title:'✅ Ver tarea'  }, { action:'dismiss', title:'OK'        }],
    'demora':           [{ action:'open', title:'⏱ Ver aviso'   }, { action:'dismiss', title:'Entendido' }],
    'nueva_resena':     [{ action:'open', title:'⭐ Ver reseña' }, { action:'dismiss', title:'Cerrar'    }],
  }[tipo] || [{ action:'open', title:'Abrir' }, { action:'dismiss', title:'Descartar' }];

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
}

// ─── RUTA 1: push event directo (más confiable en todos los navegadores) ───────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json()?.data || {}; } catch {}

  const tipo = data.tipo || 'general';

  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then((list) => {
      const appVisible = list.some(c => c.visibilityState === 'visible');
      // Tipos críticos: siempre mostrar
      // Otros: solo si la app NO está visible
      if (!TIPOS_CRITICOS.includes(tipo) && appVisible) return;
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