const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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
  const { pacienteId, token, title, body, scheduledAt, intervals } = req.body;
  if (!token || !title || !body || !scheduledAt) return res.status(400).json({ error: 'Faltan campos' });
  try {
    const db = getFirestore();
    const notificaciones = [];
    notificaciones.push({ token, title, body, scheduledAt, enviada: false, pacienteId, creadaEn: new Date().toISOString(), tipo: 'principal' });
    const fechaPrincipal = new Date(scheduledAt);
    for (const minutos of (intervals || [])) {
      const fechaRecordatorio = new Date(fechaPrincipal.getTime() - minutos * 60 * 1000);
      notificaciones.push({
        token,
        title: `⏰ Recordatorio: ${title}`,
        body: minutos >= 60 ? `En ${minutos / 60} hora${minutos / 60 > 1 ? 's' : ''}: ${body}` : `En ${minutos} minutos: ${body}`,
        scheduledAt: fechaRecordatorio.toISOString(),
        enviada: false, pacienteId, creadaEn: new Date().toISOString(), tipo: 'recordatorio', minutosAntes: minutos
      });
    }
    const batch = db.batch();
    for (const notif of notificaciones) {
      batch.set(db.collection('notificaciones_programadas').doc(), notif);
    }
    await batch.commit();
    return res.status(200).json({ ok: true, programadas: notificaciones.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};