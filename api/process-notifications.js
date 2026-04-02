const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

// ─── Helper: obtener fcmToken de un usuario por uid ───────────────────────────
async function getTokenDeUsuario(db, uid) {
  if (!uid) return null;
  try {
    const snap = await db.collection('usuarios').doc(uid).get();
    return snap.exists ? (snap.data()?.fcmToken || null) : null;
  } catch { return null; }
}

// ─── Helper: enviar FCM y manejar token inválido ──────────────────────────────
async function enviarFCM(db, token, titulo, mensaje, data = {}) {
  if (!token) return false;
  try {
    await getMessaging().send({
      token,
      notification: { title: titulo, body: mensaje },
      data: Object.fromEntries(
        Object.entries({ ...data, timestamp: String(Date.now()) })
          .map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: {
          channelId: 'mi_psicologo',
          sound: 'default',
          color: '#C4845A',
          priority: 'high',
          defaultVibrateTimings: true,
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
          requireInteraction: data.requireInteraction === 'true',
        },
        fcmOptions: {
          link: data.link || 'https://mipsicologo.vercel.app',
        },
      },
    });
    return true;
  } catch (e) {
    // Token caducado o inválido → limpiar de Firestore
    if (
      e.code === 'messaging/registration-token-not-registered' ||
      e.code === 'messaging/invalid-registration-token'
    ) {
      try {
        const snap = await db.collection('usuarios')
          .where('fcmToken', '==', token).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({ fcmToken: '' });
        }
      } catch {}
    }
    console.error('FCM error:', e.code || e.message);
    return false;
  }
}

module.exports = async function handler(req, res) {
  // Seguridad: validar header enviado por cron-job.org
  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = getFirestore();
  const ahora = new Date();
  const ahoraISO = ahora.toISOString();
  const stats = { recordatoriosCita: 0, programadas: 0, generales: 0, recurrentes: 0, errores: 0 };

  try {

    // ════════════════════════════════════════════════════════════════════════
    // 1. RECORDATORIOS DE CITA (1h y 5min antes)
    //    Colección: recordatoriosCita
    //    Campo clave: enviado == false, enviarEn <= ahora
    // ════════════════════════════════════════════════════════════════════════
    const snapCita = await db.collection('recordatoriosCita')
      .where('enviado', '==', false)
      .where('enviarEn', '<=', ahoraISO)
      .limit(50)
      .get();

    for (const docSnap of snapCita.docs) {
      const rec = docSnap.data();

      // Marcar enviado PRIMERO para evitar duplicados si el cron se solapa
      await docSnap.ref.update({ enviado: true, enviadoEn: ahoraISO });

      const token = await getTokenDeUsuario(db, rec.pacienteId);
      const ok = await enviarFCM(db, token, rec.titulo, rec.mensaje, {
        tipo: 'recordatorio_cita',
        citaId: rec.citaId || '',
        link: rec.link || '',
        tag: rec.citaId || docSnap.id,
        requireInteraction: rec.tipo === '5m' ? 'true' : 'false',
      });

      if (ok) {
        stats.recordatoriosCita++;
        // Guardar en panel de notificaciones del paciente
        await db.collection('notificaciones').doc(`rec_${docSnap.id}`).set({
          pacienteId: rec.pacienteId,
          titulo:     rec.titulo,
          mensaje:    rec.mensaje,
          icon:       rec.tipo === '5m' ? '⏰' : '🔔',
          tipo:       'recordatorio_cita',
          citaId:     rec.citaId || '',
          link:       rec.link || '',
          leida:      false,
          pushEnviada: true,
          creadoEn:   ahoraISO,
        });
      } else {
        stats.errores++;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. NOTIFICACIONES PROGRAMADAS por psicólogo (una sola vez)
    //    Colección: notificaciones_programadas
    //    Campo clave: enviada == false, scheduledAt <= ahora
    // ════════════════════════════════════════════════════════════════════════
    const snapProg = await db.collection('notificaciones_programadas')
      .where('enviada', '==', false)
      .where('scheduledAt', '<=', ahoraISO)
      .limit(50)
      .get();

    for (const docSnap of snapProg.docs) {
      const notif = docSnap.data();

      await docSnap.ref.update({ enviada: true, enviadaEn: ahoraISO });

      const token = await getTokenDeUsuario(db, notif.pacienteId);
      const ok = await enviarFCM(db, token, notif.title, notif.body, {
        tipo: 'notif_programada',
        tag: `prog_${docSnap.id}`,
      });

      if (ok) stats.programadas++;
      else stats.errores++;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. NOTIFICACIONES GENERALES pendientes de push
    //    Colección: notificaciones
    //    Tipos: cita_nueva, tarea_completada, nueva_resena, cita_confirmada,
    //           cita_cancelada, demora, racha
    //    Campo clave: pushEnviada == false, creadoEn últimos 10 min
    // ════════════════════════════════════════════════════════════════════════
    const hace10 = new Date(ahora.getTime() - 10 * 60 * 1000).toISOString();
    const snapGeneral = await db.collection('notificaciones')
      .where('pushEnviada', '==', false)
      .limit(50)
      .get();
    // Filtramos en memoria para evitar índice compuesto en Firestore
    const docsGenerales = snapGeneral.docs.filter(d => {
      const creadoEn = d.data().creadoEn || '';
      return creadoEn >= hace10;
    });

    for (const docSnap of docsGenerales) {
      const notif = docSnap.data();

      // Marcar antes de enviar
      await docSnap.ref.update({ pushEnviada: true });

      const token = await getTokenDeUsuario(db, notif.pacienteId);
      const ok = await enviarFCM(db, token, notif.titulo, notif.mensaje, {
        tipo:               notif.tipo || 'general',
        citaId:             notif.citaId || '',
        link:               notif.link || '',
        tag:                docSnap.id,
        requireInteraction: notif.tipo === 'demora' ? 'true' : 'false',
      });

      if (ok) stats.generales++;
      else stats.errores++;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. RECORDATORIOS RECURRENTES (días de la semana a hora fija)
    //    Colección: recordatorios
    //    Misma lógica que tenías — mejorada con ventana de 4 min
    // ════════════════════════════════════════════════════════════════════════
    const snapRec = await db.collection('recordatorios')
      .where('activo', '==', true)
      .get();

    for (const docSnap of snapRec.docs) {
      const rec = docSnap.data();
      const { titulo, mensaje, hora, diasSemana, pacienteTimezone, pacienteId } = rec;

      if (!hora || !diasSemana || !pacienteId) continue;
      const tz = pacienteTimezone || 'America/Bogota'; // fallback Colombia

      try {
        // Hora actual en el timezone del paciente
        const fechaLocal = new Date(ahora.toLocaleString('en-US', { timeZone: tz }));
        const diaLocal   = fechaLocal.getDay();
        const horaLocal  = fechaLocal.getHours();
        const minLocal   = fechaLocal.getMinutes();

        const [horaRec, minRec] = hora.split(':').map(Number);

        const mismodia    = diasSemana.includes(diaLocal);
        const mismaHora   = horaLocal === horaRec;
        const mismoMinuto = Math.abs(minLocal - minRec) <= 4;

        if (!mismodia || !mismaHora || !mismoMinuto) continue;

        // Evitar duplicado del mismo día
        const hoyKey = fechaLocal.toISOString().split('T')[0];
        if (rec.ultimoEnvio === hoyKey) continue;

        const token = await getTokenDeUsuario(db, pacienteId);
        const ok = await enviarFCM(db, token, titulo, mensaje, {
          tipo: 'recordatorio_recurrente',
          tag:  `rec_${docSnap.id}_${hoyKey}`,
        });

        if (ok) {
          stats.recurrentes++;
          await docSnap.ref.update({ ultimoEnvio: hoyKey });
        } else {
          stats.errores++;
        }
      } catch (e) {
        console.error('Error recordatorio recurrente:', e.message);
        stats.errores++;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. LIMPIEZA: notificaciones > 7 días (solo entre las 3:00-3:05 AM)
    // ════════════════════════════════════════════════════════════════════════
    if (ahora.getUTCHours() === 8 && ahora.getUTCMinutes() < 5) {
      // 8 UTC = 3 AM Bogotá
      const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const viejas = await db.collection('notificaciones')
        .where('creadoEn', '<', hace7.toISOString())
        .limit(200).get();

      if (!viejas.empty) {
        const batch = db.batch();
        viejas.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        console.log(`Limpiadas ${viejas.size} notificaciones`);
      }
    }

  } catch (e) {
    console.error('Error general en process-notifications:', e.message);
    return res.status(500).json({ error: e.message });
  }

  return res.status(200).json({
    ok: true,
    timestamp: ahoraISO,
    ...stats,
  });
};
