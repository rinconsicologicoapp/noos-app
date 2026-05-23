// ─── Service Worker — Mi Psicólogo PWA ────────────────────────────────────────
// ARQUITECTURA: sw.js maneja el push event estándar (Android + fallback iOS).
// firebase-messaging-sw.js maneja onBackgroundMessage (iOS principal).
// NO se inicializa Firebase aquí para evitar competencia entre SWs.

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

// Tags que el app marcó como "ya mostré en foreground — no mostrar en SW"
const foregroundSuppressed = new Set();

// Tags ya mostrados recientemente (anti-duplicado)
const shownTags = new Set();

// ─── Badge nativo (iOS 16.4+ / Chrome Android) ───────────────────────────────
async function getBadgeCount() {
  try {
    const notifs = await self.registration.getNotifications();
    return notifs.length;
  } catch { return 0; }
}
async function actualizarBadge() {
  if (!self.navigator?.setAppBadge) return;
  const count = await getBadgeCount();
  if (count > 0) self.navigator.setAppBadge(count).catch(() => {});
  else self.navigator.clearAppBadge?.().catch(() => {});
}
function limpiarBadge() {
  if (self.navigator?.clearAppBadge) self.navigator.clearAppBadge().catch(() => {});
}

// ─── Función central — muestra notificación ───────────────────────────────────
function mostrarNotificacion(data) {
  const tipo   = data.tipo    || 'general';
  const titulo = data.titulo  || 'Mi Psicólogo';
  const cuerpo = data.mensaje || '';
  const tag    = data.tag     || data.citaId || tipo;
  const requireInteraction =
    data.requireInteraction === 'true' || TIPOS_PERSISTENTES.includes(tipo);

  if (shownTags.has(tag)) return Promise.resolve();
  shownTags.add(tag);
  setTimeout(() => shownTags.delete(tag), 5000); // 5s — más margen para iOS

  const vibracion = {
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
  }[tipo] || [0,350,100,350,100,550];

  const acciones = {
    'recordatorio_cita':     data.link
      ? [{action:'join', title:'Unirse a la sesión'},{action:'dismiss',title:'Más tarde'}]
      : [{action:'open', title:'Ver cita'          },{action:'dismiss',title:'Más tarde'}],
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
  }[tipo] || [{action:'open',title:'Abrir app'},{action:'dismiss',title:'Descartar'}];

  return self.registration.showNotification(titulo, {
    body:               cuerpo,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    tag,
    renotify:           true,
    data,
    vibrate:            vibracion,
    requireInteraction,
    silent:             false,
    timestamp:          Date.now(),
    dir:                'ltr',
    lang:               'es',
    actions:            acciones,
  }).then(() => actualizarBadge());
}

// ─── RUTA PRINCIPAL: push event (estándar Web Push — Android + iOS fallback) ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    const raw = event.data.json();
    // Normalizar: FCM puede enviar en raw.data (payload) o directamente en raw
    data = Object.assign(
      {},
      raw.data || raw,
      {
        titulo:  (raw.data && raw.data.titulo)  || (raw.notification && raw.notification.title) || 'Mi Psicólogo',
        mensaje: (raw.data && raw.data.mensaje) || (raw.notification && raw.notification.body)  || '',
      }
    );
  } catch { return; }

  const tipo = data.tipo || '';
  const tag  = data.tag  || data.citaId || tipo || 'general';

  event.waitUntil((async () => {
    // Si el app marcó esta tag como "ya mostré en foreground", suprimir
    if (foregroundSuppressed.has(tag)) {
      foregroundSuppressed.delete(tag);
      return;
    }

    // Verificar si la app está visible (primer plano)
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const appVisible = list.some(c => c.visibilityState === 'visible');

    // Si no es tipo crítico y la app está visible → suprimir (el onMessage del app lo maneja)
    if (appVisible && tipo && !TIPOS_CRITICOS.includes(tipo)) return;

    // Anti-duplicado: verificar si este tag ya fue mostrado recientemente
    if (shownTags.has(tag)) return;

    // Si hay una notif existente con el mismo tag Y el teléfono está suspendido:
    // SIEMPRE re-alertar (nunca silencioso) — el usuario debe ser notificado
    // No hacemos check de getNotifications para evitar race conditions en iOS
    return mostrarNotificacion(data);
  })());
});

// ─── Mensaje desde el app principal ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;
  // FCM_FOREGROUND: el app mostró la notif en primer plano — el SW no debe mostrarla
  if (event.data.type === 'FCM_FOREGROUND' && event.data.tag) {
    foregroundSuppressed.add(event.data.tag);
    setTimeout(() => foregroundSuppressed.delete(event.data.tag), 4000);
  }
});

// ─── Click en notificación ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  limpiarBadge();
  if (event.action === 'dismiss') return;
  const data = event.notification.data || {};
  const url  = data.link || 'https://mipsicologo.vercel.app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.postMessage({ type: 'NOTIFICATION_CLICK', data });
          return c.focus();
        }
      }
      return clients.openWindow(url.startsWith('http') ? url : 'https://mipsicologo.vercel.app');
    })
  );
});

// ─── Descarte de notificación ─────────────────────────────────────────────────
self.addEventListener('notificationclose', (event) => {
  actualizarBadge();
});

// ─── Ciclo de vida ────────────────────────────────────────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });
