// ─── Service Worker ÚNICO — Mi Psicólogo PWA ─────────────────────────────────
// Un solo SW que maneja Firebase Messaging + Web Push estándar + PWA lifecycle.
// iOS: usa onBackgroundMessage. Android: usa push event. Sin competencia entre SWs.
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyAMxJlSS7b4elSZea3NaSn7DfiE7G2d2xY',
  authDomain:        'mipsicologo-13044.firebaseapp.com',
  projectId:         'mipsicologo-13044',
  storageBucket:     'mipsicologo-13044.firebasestorage.app',
  messagingSenderId: '962020436801',
  appId:             '1:962020436801:web:18c5be88649a8d99e58fc0',
});

const messaging = firebase.messaging();

// ─── Constantes ───────────────────────────────────────────────────────────────
const TIPOS_CRITICOS = [
  'cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','tarea_completada','demora','nueva_resena',
  'notif_programada','recordatorio_recurrente','juego_turno',
  'sesion_clinica','habitos_actualizados','broadcast','recurso_nuevo',
  'corazon_tarea','juego_turno_inmediato','habito_recordatorio','recordatorio_pago',
];
const TIPOS_PERSISTENTES = [
  'cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','demora','sesion_clinica','corazon_tarea','juego_turno_inmediato',
];

// ─── Anti-duplicado (5s — margen amplio para iOS) ─────────────────────────────
const shownTags = {};
// Tags marcados por el app como "ya mostré en foreground"
const suppressedTags = {};

// ─── Badge dinámico ───────────────────────────────────────────────────────────
async function actualizarBadge() {
  if (!self.navigator || !self.navigator.setAppBadge) return;
  try {
    const notifs = await self.registration.getNotifications();
    if (notifs.length > 0) self.navigator.setAppBadge(notifs.length).catch(() => {});
    else self.navigator.clearAppBadge && self.navigator.clearAppBadge().catch(() => {});
  } catch (_) {}
}
function limpiarBadge() {
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => {});
  }
}

// ─── Normalizar payload FCM ────────────────────────────────────────────────────
function normalizar(raw) {
  const d = Object.assign({}, raw.data || {});
  d.titulo  = (raw.data && raw.data.titulo)  || (raw.notification && raw.notification.title) || 'Mi Psicólogo';
  d.mensaje = (raw.data && raw.data.mensaje) || (raw.notification && raw.notification.body)  || '';
  return d;
}

// ─── Función central de display ───────────────────────────────────────────────
function mostrar(data) {
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || 'Mi Psicólogo';
  const cuerpo = data.mensaje || '';
  const tag    = data.tag     || data.citaId || tipo;
  const reqInt = TIPOS_PERSISTENTES.indexOf(tipo) >= 0 || data.requireInteraction === 'true';

  // Anti-duplicado
  if (shownTags[tag]) return Promise.resolve();
  shownTags[tag] = 1;
  setTimeout(() => { delete shownTags[tag]; }, 5000);

  const vibraciones = {
    'cita_nueva':              [0,400,100,400,100,700],
    'recordatorio_cita':       [0,500,120,500,120,900],
    'cita_confirmada':         [0,200,80, 200,80, 400],
    'cita_cancelada':          [0,600,200,600],
    'tarea_nueva':             [0,300,100,300,100,500],
    'tarea_completada':        [0,200,80, 200,80, 400],
    'corazon_tarea':           [0,150,60, 150,60, 300],
    'demora':                  [0,600,150,600,150,900],
    'sesion_clinica':          [0,350,100,350,100,600],
    'habito_recordatorio':     [0,300,100,300],
    'habitos_actualizados':    [0,200,100,200,100,300],
    'juego_turno_inmediato':   [0,250,80, 250,80, 500,80,250],
    'juego_turno':             [0,200,100,200,100,400],
    'nueva_resena':            [0,200,100,200],
    'recurso_nuevo':           [0,200,100,200,100,350],
    'broadcast':               [0,300,100,300],
    'recordatorio_recurrente': [0,300,100,300,100,500],
    'recordatorio_pago':       [0,200,100,200],
  };
  const vibrate = vibraciones[tipo] || [0,350,100,350,100,550];

  const accionesMap = {
    'recordatorio_cita': data.link
      ? [{action:'join', title:'Unirse a la sesión'}, {action:'dismiss',title:'Más tarde'}]
      : [{action:'open', title:'Ver cita'},           {action:'dismiss',title:'Más tarde'}],
    'cita_nueva':            [{action:'open',title:'Ver cita'      },{action:'dismiss',title:'Más tarde' }],
    'cita_confirmada':       [{action:'open',title:'Ver cita'      },{action:'dismiss',title:'OK'        }],
    'cita_cancelada':        [{action:'open',title:'Ver detalles'  },{action:'dismiss',title:'Entendido' }],
    'tarea_nueva':           [{action:'open',title:'Ver tarea'     },{action:'dismiss',title:'Más tarde' }],
    'tarea_completada':      [{action:'open',title:'Ver respuesta' },{action:'dismiss',title:'Después'   }],
    'corazon_tarea':         [{action:'open',title:'Ver tarea'     },{action:'dismiss',title:'OK'        }],
    'demora':                [{action:'open',title:'Ver aviso'     },{action:'dismiss',title:'Entendido' }],
    'sesion_clinica':        [{action:'open',title:'Mi Proceso'    },{action:'dismiss',title:'Más tarde' }],
    'nueva_resena':          [{action:'open',title:'Ver reseña'    },{action:'dismiss',title:'Cerrar'    }],
    'recurso_nuevo':         [{action:'open',title:'Ver material'  },{action:'dismiss',title:'Más tarde' }],
    'juego_turno_inmediato': [{action:'open',title:'Jugar ahora'   },{action:'dismiss',title:'Más tarde' }],
    'juego_turno':           [{action:'open',title:'Jugar'         },{action:'dismiss',title:'Mañana'    }],
    'habito_recordatorio':   [{action:'open',title:'Registrar'     },{action:'dismiss',title:'Después'   }],
    'recordatorio_pago':     [{action:'open',title:'Abrir app'     },{action:'dismiss',title:'Gracias'   }],
    'broadcast':             [{action:'open',title:'Ver mensaje'   },{action:'dismiss',title:'Cerrar'    }],
  };
  const actions = accionesMap[tipo] || [{action:'open',title:'Abrir app'},{action:'dismiss',title:'Descartar'}];

  return self.registration.showNotification(titulo, {
    body: cuerpo, icon: '/icon-192.png', badge: '/icon-192.png',
    tag, renotify: true, data,
    vibrate, requireInteraction: reqInt,
    silent: false, timestamp: Date.now(), dir: 'ltr', lang: 'es',
    actions,
  }).then(() => actualizarBadge());
}

// ─── RUTA iOS: onBackgroundMessage (Firebase SDK — iOS usa este camino) ────────
messaging.onBackgroundMessage(function(payload) {
  const data = normalizar(payload);
  const tag  = data.tag || data.citaId || data.tipo || 'general';
  // Si la app notificó que ya mostró esto en foreground → suprimir
  if (suppressedTags[tag]) { delete suppressedTags[tag]; return Promise.resolve(); }
  return mostrar(data);
});

// ─── RUTA Android + fallback iOS: push event estándar ─────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data;
  try { data = normalizar(event.data.json()); } catch(e) { return; }
  var tipo = data.tipo || '';
  var tag  = data.tag  || data.citaId || tipo || 'general';

  event.waitUntil((async function() {
    // Suprimir si el app marcó este tag como "ya mostré en foreground"
    if (suppressedTags[tag]) { delete suppressedTags[tag]; return; }

    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visible = list.some(function(c) { return c.visibilityState === 'visible'; });

    // Si app visible y no es tipo crítico → el onMessage del app lo maneja
    if (visible && tipo && TIPOS_CRITICOS.indexOf(tipo) < 0) return;

    return mostrar(data);
  })());
});

// ─── Mensaje desde el app (FCM_FOREGROUND) ────────────────────────────────────
self.addEventListener('message', function(event) {
  if (!event.data || event.data.type !== 'FCM_FOREGROUND') return;
  var tag = event.data.tag;
  if (tag) {
    suppressedTags[tag] = 1;
    setTimeout(function() { delete suppressedTags[tag]; }, 4000);
  }
});

// ─── Click en notificación ────────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  limpiarBadge();
  if (event.action === 'dismiss') return;
  var nd  = event.notification.data || {};
  var url = nd.link || 'https://mipsicologo.vercel.app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) {
          list[i].postMessage({ type: 'NOTIFICATION_CLICK', data: nd });
          return list[i].focus();
        }
      }
      return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
    })
  );
});

// ─── Descarte ─────────────────────────────────────────────────────────────────
self.addEventListener('notificationclose', function() { actualizarBadge(); });

// ─── Ciclo de vida ────────────────────────────────────────────────────────────
self.addEventListener('install',  function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });
