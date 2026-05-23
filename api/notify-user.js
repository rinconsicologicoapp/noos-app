// Envío directo de push — sin pasar por la cola notificaciones_programadas
// Garantiza entrega inmediata (no espera el cron de 2 min)
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore }                 = require('firebase-admin/firestore');
const { getMessaging }                 = require('firebase-admin/messaging');
const { getAuth }                      = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const PERSISTENT_TIPOS = [
  'cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','demora','sesion_clinica','recurso_nuevo',
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { recipientUid, title, body, tipo = 'general', idToken, tag: customTag, link } = req.body || {};

  if (!recipientUid || !title || !body || !idToken) {
    return res.status(400).json({ error: 'Faltan campos: recipientUid, title, body, idToken' });
  }

  try {
    // 1. Verificar que el llamante está autenticado
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!decoded.uid) return res.status(401).json({ error: 'Token inválido' });

    // 2. Obtener FCM token del destinatario
    const recipDoc = await getFirestore().collection('usuarios').doc(recipientUid).get();
    if (!recipDoc.exists) return res.status(200).json({ ok: false, reason: 'usuario-no-encontrado' });

    const fcmToken = recipDoc.data()?.fcmToken;
    if (!fcmToken) return res.status(200).json({ ok: false, reason: 'sin-token-fcm' });

    const requireInteraction = PERSISTENT_TIPOS.includes(tipo);
    const tag = customTag || `${tipo}_${Date.now()}`;
    const appLink = link || 'https://mipsicologo.vercel.app';

    // 3. Enviar FCM — data-only en webpush para que el SW controle el display
    // Si enviamos notification+data, el browser muestra la notif Y el SW también → duplicado
    await getMessaging().send({
      token: fcmToken,
      // data payload: el SW lee titulo/mensaje/tipo/tag para mostrar la notificación
      data: {
        titulo: title,
        mensaje: body,
        tipo,
        tag,                                    // tag explícito → anti-duplicado funciona
        requireInteraction: String(requireInteraction),
        timestamp: String(Date.now()),
        link: appLink,
      },
      android: {
        priority: 'high',
        ttl: 0,
        // notification en Android garantiza entrega en Doze mode vía sistema operativo
        notification: {
          title,
          body,
          color: '#162A1C',
          channelId: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          priority: 'high',
          visibility: 'private',
          tag,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',            // sonido del sistema iOS
            badge: 1,
            'content-available': 1,      // permite wakeup del SW en iOS
            'mutable-content': 1,
            'interruption-level': 'active', // iOS 15+: ignora Focus/DND
          },
        },
        headers: {
          'apns-priority':   '10',       // máxima prioridad APNS
          'apns-push-type':  'alert',
          'apns-expiration': '0',        // entrega inmediata o nunca
        },
      },
      webpush: {
        headers: {
          Urgency: 'high',  // RFC 8030: máxima urgencia
          TTL:     '0',     // sin cacheo en servidor de push
        },
        // SIN campo notification: el SW controla el display completamente
        // Esto evita el race condition browser-shows + SW-also-shows en iOS
        fcmOptions: { link: appLink },
      },
    });

    return res.status(200).json({ ok: true });

  } catch(e) {
    // Token caducado/inválido → limpiar en Firestore
    if (
      e.code === 'messaging/registration-token-not-registered' ||
      e.code === 'messaging/invalid-registration-token'
    ) {
      try {
        await getFirestore().collection('usuarios').doc(recipientUid).update({ fcmToken: '' });
      } catch {}
      return res.status(200).json({ ok: false, reason: 'token-inválido-limpiado' });
    }
    console.error('[notify-user]', e.code || e.message);
    return res.status(500).json({ error: e.message });
  }
};
