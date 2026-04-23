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
async function enviarFCM(db, token, titulo, mensaje, data = {}, stats = null) {
  if (!token) { if (stats) stats.tokenNulo++; return false; }
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
          aps: {
            alert: { title: titulo, body: mensaje },
            sound: 'default',
            badge: 1,
            'content-available': 1,
            'mutable-content': 1,
          },
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        // notification field hace que Chrome en Android muestre la notif
        // incluso en Doze mode sin necesitar que el SW esté activo.
        // El SW usa shownTags para evitar el doble display.
        notification: {
          title: titulo,
          body:  mensaje,
          icon:  '/icon-192.png',
          badge: '/icon-192.png',
          tag:   data.tag || data.citaId || data.tipo || 'general',
          requireInteraction: data.requireInteraction === 'true',
          data,
        },
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
    if (stats) stats.errorFCM++;
    return false;
  }
}
 
// ─── Rate limiting por IP (max 30 req/min) ────────────────────────────────────
async function rateLimitOk(db, ip) {
  const key = `ip_${String(ip).replace(/[^a-z0-9]/gi, '_').slice(0, 60)}`;
  const ref  = db.collection('_security').doc(key);
  const now  = Date.now();
  const WIN  = 60_000;
  const MAX  = 30;
  try {
    let ok = true;
    await db.runTransaction(async t => {
      const snap = await t.get(ref);
      if (!snap.exists || now - (snap.data().ts || 0) >= WIN) {
        t.set(ref, { ts: now, n: 1 });
      } else {
        const n = (snap.data().n || 0) + 1;
        if (n > MAX) { ok = false; return; }
        t.update(ref, { n });
      }
    });
    return ok;
  } catch { return true; }
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).end();
  }

  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const db = getFirestore();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const allowed = await rateLimitOk(db, ip);
  if (!allowed) return res.status(429).end();
  const ahora = new Date();
  const ahoraISO = ahora.toISOString();
  const stats = { recordatoriosCita: 0, programadas: 0, generales: 0, recurrentes: 0, errores: 0, tokenNulo: 0, errorFCM: 0, errorStage2: null };
 
  // ── Lock global (TTL 90s para no bloquear cron de 2 min) ─────────────────
  const lockRef = db.collection('_cronLock').doc('process-notifications');
  try {
    let lockAdquirido = false;
    let lockAge = 0;
    await db.runTransaction(async (t) => {
      const lockDoc = await t.get(lockRef);
      const ahoraMs = Date.now();
      lockAge = lockDoc.exists ? ahoraMs - (lockDoc.data().ts || 0) : 999999;
      if (lockDoc.exists && lockAge < 90 * 1000) return; // TTL: 90s
      t.set(lockRef, { ts: ahoraMs, iso: ahoraISO });
      lockAdquirido = true;
    });
    if (!lockAdquirido) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'lock activo', lockAgeSeconds: Math.round(lockAge / 1000) });
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
        destinatarioId: rec.pacienteId || '',
      }, stats);
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
    let snapProg;
    try {
      snapProg = await db.collection('notificaciones_programadas')
        .where('enviada', '==', false)
        .where('scheduledAt', '<=', ahoraISO)
        .limit(50).get();
    } catch(indexErr) {
      // Falla si no existe el índice compuesto en Firestore:
      // Firebase Console → Firestore → Indexes → crear índice: enviada ASC + scheduledAt ASC
      console.error('Stage2 index error:', indexErr.message);
      stats.errorStage2 = indexErr.message;
      snapProg = { docs: [] };
    }
 
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

      // Para citas nuevas, formatear fecha en la zona horaria del paciente
      let bodyFinal = notif.body;
      if (notif.tipo === 'cita_nueva' && notif.fechaUTC && notif.pacienteId) {
        try {
          const pacSnap = await db.collection('usuarios').doc(notif.pacienteId).get();
          const tz = pacSnap.exists ? (pacSnap.data()?.timezone || 'America/Bogota') : 'America/Bogota';
          const fecha = new Date(notif.fechaUTC);
          const fechaStr = fecha.toLocaleDateString('es-CO', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' });
          const horaStr  = fecha.toLocaleTimeString('es-CO', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
          const modalidad = notif.modalidad === 'virtual' ? 'Virtual 💻' : 'Presencial 🏥';
          bodyFinal = `${fechaStr} a las ${horaStr} — ${modalidad}`;
        } catch(_) { /* usar body original si falla */ }
      }

      // destinatarioId existe cuando el writer ≠ recipient (ej. paciente → psicólogo)
      const recipientId = notif.destinatarioId || notif.pacienteId;
      const token = await getTokenDeUsuario(db, recipientId);
      const ok = await enviarFCM(db, token, notif.title, bodyFinal, {
        tipo: notif.tipo || 'notif_programada',
        citaId: notif.citaId || '',
        link: notif.link || '',
        tag: `prog_${docSnap.id}`,
        destinatarioId: recipientId || '',
      }, stats);
      if (ok) stats.programadas++;
      else stats.errores++;
    }
 
    // ── 3. NOTIFICACIONES GENERALES ───────────────────────────────────────
    const hace10 = new Date(ahora.getTime() - 10 * 60 * 1000).toISOString();
    const snapGeneral = await db.collection('notificaciones')
      .where('pushEnviada', '==', false)
      .limit(200).get();

    // Expirar docs atascados (>10 min sin procesar) para que no bloqueen slots del limit
    const stuckDocs = snapGeneral.docs.filter(d => (d.data().creadoEn || '') < hace10);
    if (stuckDocs.length > 0) {
      const batchExpire = db.batch();
      stuckDocs.forEach(d => batchExpire.update(d.ref, { pushEnviada: true, expirada: true }));
      await batchExpire.commit().catch(()=>{});
    }

    const docsGenerales = snapGeneral.docs.filter(d => (d.data().creadoEn || '') >= hace10);
 
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
        destinatarioId: notif.pacienteId || '',
      }, stats);
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
        const hoyKey = ahora.toLocaleDateString('en-CA', { timeZone: tz });
        if (rec.ultimoEnvio === hoyKey) continue;
        const notifId = `rec_recurrente_${docSnap.id}_${hoyKey}`;
        await db.collection('notificaciones_programadas').doc(notifId).set({
          pacienteId,
          title:       titulo,
          body:        mensaje,
          scheduledAt: new Date(Date.now() + 5000).toISOString(),
          enviada:     false,
          creadaEn:    ahoraISO,
          tipo:        'recordatorio_recurrente',
          tag:         `rec_${docSnap.id}_${hoyKey}`,
        });
        await docSnap.ref.update({ ultimoEnvio: hoyKey });
        stats.recurrentes++;
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
