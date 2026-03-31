const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Faltan campos: token, title, body' });
  }

  try {
    await getMessaging().send({
      token,
      notification: { title, body },
      data: data
        ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
        : {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'mi_psicologo',
          sound: 'default',
          color: '#C4845A',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1, 'content-available': 1 },
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: data?.requireInteraction === 'true',
        },
        fcmOptions: {
          link: data?.link || 'https://mipsicologo.vercel.app',
        },
      },
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    // Token inválido → intentar limpiar
    if (
      e.code === 'messaging/registration-token-not-registered' ||
      e.code === 'messaging/invalid-registration-token'
    ) {
      try {
        const db = getFirestore();
        const snap = await db.collection('usuarios')
          .where('fcmToken', '==', token).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({ fcmToken: '' });
        }
      } catch {}
      return res.status(410).json({ error: 'Token inválido, eliminado de la base de datos' });
    }

    console.error('send-notification error:', e.code || e.message);
    return res.status(500).json({ error: e.message });
  }
};
