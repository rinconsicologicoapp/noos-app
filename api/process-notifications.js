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
    const ahora = new Date();
    const ahoraISO = ahora.toISOString();
    let enviadas = 0;

    // ── 1. NOTIFICACIONES PROGRAMADAS (puntuales) ──────────
    const snapProgramadas = await db.collection('notificaciones_programadas')
      .where('enviada', '==', false)
      .where('scheduledAt', '<=', ahoraISO)
      .limit(50)
      .get();

    for (const docSnap of snapProgramadas.docs) {
      const { token, title, body } = docSnap.data();
      try {
        await getMessaging().send({
          token,
          notification: { title, body },
          webpush: {
            notification: {
              title, body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              vibrate: [200, 100, 200]
            }
          }
        });
        await docSnap.ref.update({ enviada: true, enviadaEn: ahoraISO });
        enviadas++;
      } catch(e) {
        console.error('Error notif programada:', e.message);
      }
    }

    // ── 2. RECORDATORIOS RECURRENTES ───────────────────────
    const snapRecordatorios = await db.collection('recordatorios')
      .where('activo', '==', true)
      .get();

    const diaSemanaUTC = ahora.getUTCDay(); // 0=dom...6=sáb
    const horaUTC = ahora.getUTCHours();
    const minutoUTC = ahora.getUTCMinutes();

    for (const docSnap of snapRecordatorios.docs) {
      const rec = docSnap.data();
      const { token, titulo, mensaje, hora, diasSemana, pacienteTimezone, pacienteId } = rec;

      if (!hora || !diasSemana || !pacienteTimezone) continue;

      // Convertir la hora del recordatorio a UTC según timezone del paciente
      const [horaRec, minRec] = hora.split(':').map(Number);

      // Calcular offset del timezone del paciente
      const fechaEnTZ = new Date(ahora.toLocaleString('en-US', { timeZone: pacienteTimezone }));
      const offsetMs = ahora - fechaEnTZ;
      const offsetHoras = Math.round(offsetMs / (1000 * 60 * 60));

      // Hora en UTC equivalente a la hora local del paciente
      const horaRecUTC = (horaRec + offsetHoras + 24) % 24;

      // Día de semana en la timezone del paciente
      const fechaLocal = new Date(ahora.toLocaleString('en-US', { timeZone: pacienteTimezone }));
      const diaSemanaLocal = fechaLocal.getDay();

      // Verificar si toca enviar ahora (mismo día, misma hora, mismo minuto ±2)
      const mismodia = diasSemana.includes(diaSemanaLocal);
      const mismaHora = horaUTC === horaRecUTC;
      const mismoMinuto = Math.abs(minutoUTC - minRec) <= 4;

      if (!mismodia || !mismaHora || !mismoMinuto) continue;

      // Verificar que no se haya enviado ya hoy
      const hoy = fechaLocal.toISOString().split('T')[0];
      const yaEnviado = rec.ultimoEnvio === hoy;
      if (yaEnviado) continue;

      // Obtener token del paciente
      try {
        const pacienteDoc = await db.collection('usuarios').doc(pacienteId).get();
        const fcmToken = pacienteDoc.data()?.fcmToken;
        if (!fcmToken) continue;

        await getMessaging().send({
          token: fcmToken,
          notification: { title: titulo, body: mensaje },
          webpush: {
            notification: {
              title: titulo,
              body: mensaje,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              vibrate: [200, 100, 200]
            }
          }
        });

        await docSnap.ref.update({ ultimoEnvio: hoy });
        enviadas++;
      } catch(e) {
        console.error('Error recordatorio recurrente:', e.message);
      }
    }

    return res.status(200).json({ ok: true, enviadas });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};