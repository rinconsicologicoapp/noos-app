const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const db = getFirestore();
    const ahora = new Date().toISOString();
    const snap = await db.collection('notificaciones_programadas')
      .where('enviada', '==', false)
      .where('scheduledAt', '<=', ahora)
      .limit(50)
      .get();
    let enviadas = 0;
    for (const docSnap of snap.docs) {
      const { token, title, body } = docSnap.data();
      try {
        await getMessaging().send({
          token,
          notification: { title, body },
          webpush: { notification: { title, body, icon: '/icon-192.png', badge: '/icon-192.png', vibrate: [200, 100, 200] } }
        });
        await docSnap.ref.update({ enviada: true, enviadaEn: new Date().toISOString() });
        enviadas++;
      } catch (e) {
        console.error('Error:', e.message);
      }
    }
    return res.status(200).json({ ok: true, enviadas });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};