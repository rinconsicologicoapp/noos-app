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
 
async function getTokenDeUsuario(db, uid) {
  if (!uid) return null;
  try {
    const snap = await db.collection('usuarios').doc(uid).get();
    return snap.exists ? (snap.data()?.fcmToken || null) : null;
  } catch { return null; }
}
 
// ─── Envía SOLO data payload — sin notification payload ───────────────────────
// Esto evita la doble notificación: con notification+data, el navegador muestra
// la notif automáticamente Y el SW también la muestra = 2 notificaciones.
// Con solo data, el SW es el único que controla el display.
async function enviarFCM(db, token, titulo, mensaje, data = {}) {
  if (!token) return false;
  try {
    await getMessaging().send({
      token,
      // Sin notification payload — el SW lee titulo/mensaje desde data
      data: Object.fromEntries(
        Object.entries({
          ...data,
          titulo,
          mensaje,
          timestamp: String(Date.now()),
        }).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: undefined,
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1, 'content-available': 1 },
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        fcmOptions: {
          link: data.link || 'https://mipsicologo.vercel.app',
        },
      },
    });
    return true;
  } catch (e) {
    if (
      e.code === 'messaging/registration-token-not-registered' ||
      e.code === 'messaging/invalid-registration-token'
    ) {
      try {
        const snap = await db.collection('usuarios')
          .where('fcmToken', '==', token).limit(1).get();
        if (!snap.empty) await snap.docs[0].ref.update({ fcmToken: '' });
      } catch {}
    }
    console.error('FCM error:', e.code || e.message);
    return false;
  }
}
 
module.exports = async function handler(req, res) {
  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
 
  const db = getFirestore();
  const ahora = new Date();
  const ahoraISO = ahora.toISOString();
  const stats = { recordatoriosCita: 0, programadas: 0, generales: 0, recurrentes: 0, errores: 0 };
 
  // ── Lock global ───────────────────────────────────────────────────────────
  const lockRef = db.collection('_cronLock').doc('process-notifications');
  try {
    let lockAdquirido = false;
    await db.runTransaction(async (t) => {
      const lockDoc = await t.get(lockRef);
      const ahoraMs = Date.now();
      if (lockDoc.exists && (ahoraMs - (lockDoc.data().ts || 0)) < 2 * 60 * 1000) return;
      t.set(lockRef, { ts: ahoraMs, iso: ahoraISO });
      lockAdquirido = true;
    });
    if (!lockAdquirido) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'lock activo' });
    }
  } catch(lockErr) {
    console.error('Lock error:', lockErr.message);
  }
 
  try {
 
    // ── 1. RECORDATORIOS DE CITA ──────────────────────────────────────────
    const snapCita = await db.collection('recordatoriosCita')
      .where('enviado', '==', false)
      .where('enviarEn', '<=', ahoraISO)
      .limit(50).get();
 
    for (const docSnap of snapCita.docs) {
      const rec = docSnap.data();
      let debeEnviar = false;
      try {
        await db.runTransaction(async (t) => {
          const fresh = await t.get(docSnap.ref);
          if (!fresh.exists || fresh.data().enviado === true) return;
          t.update(docSnap.ref, { enviado: true, enviadoEn: ahoraISO });
          debeEnviar = true;
        });
      } catch(e) { stats.errores++; continue; }
      if (!debeEnviar) continue;
 
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
        await db.collection('notificaciones').doc(`rec_${docSnap.id}`).set({
          pacienteId: rec.pacienteId, titulo: rec.titulo, mensaje: rec.mensaje,
          icon: '🔔', tipo: 'recordatorio_cita', citaId: rec.citaId || '',
          link: rec.link || '', leida: false, pushEnviada: true, creadoEn: ahoraISO,
        });
      } else { stats.errores++; }
    }
 
    // ── 2. NOTIFICACIONES PROGRAMADAS ─────────────────────────────────────
    const snapProg = await db.collection('notificaciones_programadas')
      .where('enviada', '==', false)
      .where('scheduledAt', '<=', ahoraISO)
      .limit(50).get();
 
    for (const docSnap of snapProg.docs) {
      const notif = docSnap.data();
      let debeEnviar = false;
      try {
        await db.runTransaction(async (t) => {
          const fresh = await t.get(docSnap.ref);
          if (!fresh.exists || fresh.data().enviada === true) return;
          t.update(docSnap.ref, { enviada: true, enviadaEn: ahoraISO });
          debeEnviar = true;
        });
      } catch(e) { stats.errores++; continue; }
      if (!debeEnviar) continue;
 
      const token = await getTokenDeUsuario(db, notif.pacienteId);
      const ok = await enviarFCM(db, token, notif.title, notif.body, {
        tipo: notif.tipo || 'notif_programada',
        citaId: notif.citaId || '',
        link: notif.link || '',
        tag: `prog_${docSnap.id}`,
      });
      if (ok) stats.programadas++;
      else stats.errores++;
    }
 
    // ── 3. NOTIFICACIONES GENERALES ───────────────────────────────────────
    const hace2 = new Date(ahora.getTime() - 2.5 * 60 * 1000).toISOString();
    const snapGeneral = await db.collection('notificaciones')
      .where('pushEnviada', '==', false)
      .limit(50).get();
    const docsGenerales = snapGeneral.docs.filter(d => (d.data().creadoEn || '') >= hace2);
 
    for (const docSnap of docsGenerales) {
      const notif = docSnap.data();
      let yaEnviada = false;
      try {
        await db.runTransaction(async (t) => {
          const fresh = await t.get(docSnap.ref);
          if (!fresh.exists || fresh.data().pushEnviada === true) { yaEnviada = true; return; }
          if (fresh.data().cronEnviadoEn) {
            if (Date.now() - new Date(fresh.data().cronEnviadoEn).getTime() < 10000) { yaEnviada = true; return; }
          }
          t.update(docSnap.ref, { pushEnviada: true, cronEnviadoEn: ahoraISO });
        });
      } catch(e) { stats.errores++; continue; }
      if (yaEnviada) continue;
 
      const token = await getTokenDeUsuario(db, notif.pacienteId);
      const ok = await enviarFCM(db, token, notif.titulo, notif.mensaje, {
        tipo: notif.tipo || 'general',
        citaId: notif.citaId || '',
        link: notif.link || '',
        tag: docSnap.id,
        requireInteraction: notif.tipo === 'demora' ? 'true' : 'false',
      });
      if (ok) stats.generales++;
      else stats.errores++;
    }
 
    // ── 4. RECORDATORIOS RECURRENTES ──────────────────────────────────────
    const snapRec = await db.collection('recordatorios').where('activo', '==', true).get();
    for (const docSnap of snapRec.docs) {
      const rec = docSnap.data();
      const { titulo, mensaje, hora, diasSemana, pacienteTimezone, pacienteId } = rec;
      if (!hora || !diasSemana || !pacienteId) continue;
      const tz = pacienteTimezone || 'America/Bogota';
      try {
        const fechaLocal = new Date(ahora.toLocaleString('en-US', { timeZone: tz }));
        const [horaRec, minRec] = hora.split(':').map(Number);
        if (!diasSemana.includes(fechaLocal.getDay())) continue;
        if (fechaLocal.getHours() !== horaRec) continue;
        if (Math.abs(fechaLocal.getMinutes() - minRec) > 4) continue;
        const hoyKey = fechaLocal.toISOString().split('T')[0];
        if (rec.ultimoEnvio === hoyKey) continue;
        const token = await getTokenDeUsuario(db, pacienteId);
        const ok = await enviarFCM(db, token, titulo, mensaje, {
          tipo: 'recordatorio_recurrente', tag: `rec_${docSnap.id}_${hoyKey}`,
        });
        if (ok) { stats.recurrentes++; await docSnap.ref.update({ ultimoEnvio: hoyKey }); }
        else stats.errores++;
      } catch(e) { console.error('Error recurrente:', e.message); stats.errores++; }
    }
 
    // ── 5. LIMPIEZA 3AM ───────────────────────────────────────────────────
    if (ahora.getUTCHours() === 8 && ahora.getUTCMinutes() < 5) {
      const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const viejas = await db.collection('notificaciones')
        .where('creadoEn', '<', hace7.toISOString()).limit(200).get();
      if (!viejas.empty) {
        const batch = db.batch();
        viejas.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
 
  } catch(e) {
    console.error('Error general:', e.message);
    return res.status(500).json({ error: e.message });
  }
 
  return res.status(200).json({ ok: true, timestamp: ahoraISO, ...stats });
};
