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

// ─── Tipos críticos ───────────────────────────────────────────────────────────
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

function getVibracion(tipo) {
  const map = {
    'cita_nueva':            [0,400,100,400,100,700],
    'recordatorio_cita':     [0,500,120,500,120,900],
    'cita_confirmada':       [0,200,80, 200,80, 400],
    'cita_cancelada':        [0,600,200,600],
    'tarea_nueva':           [0,300,100,300,100,500],
    'tarea_completada':      [0,200,80, 200,80, 400],
    'corazon_tarea':         [0,150,60, 150,60, 300],
    'demora':                [0,600,150,600,150,900],
    'sesion_clinica':        [0,350,100,350,100,600],
    'habito_recordatorio':   [0,300,100,300],
    'juego_turno_inmediato': [0,250,80, 250,80, 500,80,250],
  };
  return map[tipo] || [0,350,100,350,100,550];
}

function getAcciones(tipo, link) {
  const map = {
    'recordatorio_cita':     link
      ? [{ action:'join',  title:'Unirse a la sesión' }, { action:'dismiss', title:'Más tarde' }]
      : [{ action:'open',  title:'Ver cita'           }, { action:'dismiss', title:'Más tarde' }],
    'cita_nueva':            [{ action:'open', title:'Ver cita'      }, { action:'dismiss', title:'Más tarde' }],
    'cita_confirmada':       [{ action:'open', title:'Ver cita'      }, { action:'dismiss', title:'OK'        }],
    'cita_cancelada':        [{ action:'open', title:'Ver detalles'  }, { action:'dismiss', title:'Entendido' }],
    'tarea_nueva':           [{ action:'open', title:'Ver tarea'     }, { action:'dismiss', title:'Más tarde' }],
    'tarea_completada':      [{ action:'open', title:'Ver respuesta' }, { action:'dismiss', title:'Después'   }],
    'corazon_tarea':         [{ action:'open', title:'Ver tarea'     }, { action:'dismiss', title:'OK'        }],
    'demora':                [{ action:'open', title:'Ver aviso'     }, { action:'dismiss', title:'Entendido' }],
    'sesion_clinica':        [{ action:'open', title:'Mi Proceso'    }, { action:'dismiss', title:'Más tarde' }],
    'juego_turno_inmediato': [{ action:'open', title:'Jugar ahora'   }, { action:'dismiss', title:'Más tarde' }],
    'habito_recordatorio':   [{ action:'open', title:'Registrar'     }, { action:'dismiss', title:'Después'   }],
    'recordatorio_pago':     [{ action:'open', title:'Abrir app'     }, { action:'dismiss', title:'Gracias'   }],
  };
  return map[tipo] || [{ action:'open', title:'Abrir app' }, { action:'dismiss', title:'Descartar' }];
}

function mostrarNotif(data) {
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || 'Mi Psicólogo';
  const cuerpo = data.mensaje || '';
  const tag    = data.tag     || data.citaId || tipo;
  const requireInteraction = TIPOS_PERSISTENTES.includes(tipo) || data.requireInteraction === 'true';

  return self.registration.showNotification(titulo, {
    body:               cuerpo,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    tag,
    renotify:           true,
    data,
    vibrate:            getVibracion(tipo),
    requireInteraction,
    silent:             false,
    timestamp:          Date.now(),
    actions:            getAcciones(tipo, data.link),
  });
}

// ─── RUTA 1: onBackgroundMessage (iOS usa este camino) ────────────────────────
messaging.onBackgroundMessage(payload => {
  // Extraer datos del payload (FCM puede enviarlos en data o en notification)
  const data = {
    ...(payload.data || {}),
    titulo:  payload.data?.titulo  || payload.notification?.title || 'Mi Psicólogo',
    mensaje: payload.data?.mensaje || payload.notification?.body  || '',
  };
  return mostrarNotif(data);
});

// ─── RUTA 2: push event estándar (fallback, también para Android) ─────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try {
    const raw = event.data.json();
    data = {
      ...(raw.data || {}),
      titulo:  raw.data?.titulo  || raw.notification?.title || 'Mi Psicólogo',
      mensaje: raw.data?.mensaje || raw.notification?.body  || '',
    };
  } catch { return; }

  if (!TIPOS_CRITICOS.includes(data.tipo || '') && data.tipo) return;

  event.waitUntil(mostrarNotif(data));
});

// ─── Click en notificación ────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = (event.notification.data && event.notification.data.link) || 'https://mipsicologo.vercel.app';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for (const c of list) {
        if ('focus' in c) {
          c.postMessage({ type:'NOTIFICATION_CLICK', data: event.notification.data || {} });
          return c.focus();
        }
      }
      return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
    })
  );
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });