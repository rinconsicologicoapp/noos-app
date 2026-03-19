const { initializeApp, getApps, cert } = require('firebase-admin/app');
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { token, title, body, data } = req.body;
  if (!token || !title || !body) return res.status(400).json({ error: 'Faltan campos' });
  try {
    await getMessaging().send({
      token,
      notification: { title, body },
      webpush: { notification: { title, body, icon: '/icon-192.png', badge: '/icon-192.png', vibrate: [200, 100, 200] } },
      data: data || {}
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};