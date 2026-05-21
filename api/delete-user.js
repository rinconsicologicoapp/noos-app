const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore }                 = require('firebase-admin/firestore');
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { uidToDelete, idToken } = req.body || {};
  if (!uidToDelete || !idToken) {
    return res.status(400).json({ error: 'Faltan campos: uidToDelete, idToken' });
  }

  try {
    // 1. Verificar que quien llama es un admin autenticado
    const decoded = await getAuth().verifyIdToken(idToken);
    const callerDoc = await getFirestore().collection('usuarios').doc(decoded.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.rol !== 'administrador') {
      return res.status(403).json({ error: 'Sin permisos de administrador' });
    }

    // 2. Eliminar cuenta de Firebase Auth del usuario
    await getAuth().deleteUser(uidToDelete);
    return res.status(200).json({ ok: true });

  } catch (e) {
    // auth/user-not-found → la cuenta de Auth ya no existe, pero está bien
    if (e.code === 'auth/user-not-found') {
      return res.status(200).json({ ok: true, note: 'auth-not-found' });
    }
    console.error('[delete-user]', e.code || e.message);
    return res.status(500).json({ error: e.message || 'Error interno' });
  }
};
