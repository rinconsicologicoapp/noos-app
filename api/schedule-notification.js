const { initializeApp, getApps, cert } = require('firebase-admin/app');
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

  const { pacienteId, token, title, body, scheduledAt, intervals } = req.body;

  if (!pacienteId || !title || !body || !scheduledAt) {
    return res.status(400).json({ error: 'Faltan campos: pacienteId, title, body, scheduledAt' });
  }

  try {
    const db = getFirestore();
    const batch = db.batch();
    const fechaPrincipal = new Date(scheduledAt);
    let programadas = 0;

    // ── Notificación principal ─────────────────────────────────────────────
    const mainRef = db.collection('notificaciones_programadas').doc();
    batch.set(mainRef, {
      pacienteId,
      token:       token || '',           // guardamos para referencia, pero el cron busca por uid
      title,
      body,
      scheduledAt: fechaPrincipal.toISOString(),
      enviada:     false,
      creadaEn:    new Date().toISOString(),
      tipo:        'principal',
    });
    programadas++;

    // ── Recordatorios previos (intervalos en minutos antes) ────────────────
    for (const minutos of (intervals || [])) {
      const mins = parseInt(minutos);
      if (isNaN(mins) || mins <= 0) continue;

      const fechaAntes = new Date(fechaPrincipal.getTime() - mins * 60 * 1000);
      const labelTiempo = mins >= 60
        ? `${mins / 60} hora${mins / 60 > 1 ? 's' : ''}`
        : `${mins} minutos`;

      const recRef = db.collection('notificaciones_programadas').doc();
      batch.set(recRef, {
        pacienteId,
        token:       token || '',
        title:       `Recordatorio: ${title}`,
        body:        `En ${labelTiempo}: ${body}`,
        scheduledAt: fechaAntes.toISOString(),
        enviada:     false,
        creadaEn:    new Date().toISOString(),
        tipo:        'recordatorio',
        minutosAntes: mins,
      });
      programadas++;
    }

    await batch.commit();
    return res.status(200).json({ ok: true, programadas });
  } catch (e) {
    console.error('Error schedule-notification:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
