/**
 * TEST DE NOTIFICACIONES PUSH
 * ────────────────────────────────────────────────────────────────────────────
 * Llama al endpoint /api/notify-user en producción (Vercel).
 * Envía una push REAL al dispositivo del usuario especificado.
 *
 * USO:
 *   node scripts/test-push.js
 *
 * CONFIGURACIÓN:
 *   1. Abre la app en el navegador
 *   2. DevTools → Console → escribe: await auth.currentUser.getIdToken()
 *   3. Copia el token JWT completo
 *   4. Ponlo en ID_TOKEN abajo
 *   5. Pon el UID del destinatario en RECIPIENT_UID
 *   6. Ejecuta: node scripts/test-push.js
 * ────────────────────────────────────────────────────────────────────────────
 */

const https = require('https');

// ── CONFIGURA ESTOS VALORES ──────────────────────────────────────────────────
const API_URL     = 'https://mipsicologo.vercel.app'; // URL de producción
const ID_TOKEN    = 'PEGA_AQUI_EL_ID_TOKEN';          // token JWT del admin logueado
const RECIPIENT_UID = 'PEGA_AQUI_EL_UID_DESTINATARIO'; // uid del que debe recibir la push
// ────────────────────────────────────────────────────────────────────────────

const TESTS = [
  {
    name: '1. Push tipo cita_nueva',
    payload: {
      recipientUid: RECIPIENT_UID,
      title: '📅 Test — Nueva cita agendada',
      body:  'Esta es una notificación de prueba de cita_nueva',
      tipo:  'cita_nueva',
      idToken: ID_TOKEN,
    }
  },
  {
    name: '2. Push tipo demora',
    payload: {
      recipientUid: RECIPIENT_UID,
      title: '⏱ Test — Demora 10 min',
      body:  'Esta es una notificación de prueba de demora',
      tipo:  'demora',
      idToken: ID_TOKEN,
    }
  },
  {
    name: '3. Push tipo sesion_clinica',
    payload: {
      recipientUid: RECIPIENT_UID,
      title: 'Mi Proceso — Test sesión',
      body:  'Tu psicólogo compartió el resumen de tu sesión (prueba)',
      tipo:  'sesion_clinica',
      idToken: ID_TOKEN,
    }
  },
  {
    name: '4. Push tipo tarea_nueva',
    payload: {
      recipientUid: RECIPIENT_UID,
      title: '📋 Test — Nueva tarea',
      body:  '"Tarea de prueba" — revísala en tu app',
      tipo:  'tarea_nueva',
      idToken: ID_TOKEN,
    }
  },
];

function callAPI(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(endpoint, API_URL);
    const options = {
      hostname: url.hostname,
      port:     443,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('\n🔔 TEST DE NOTIFICACIONES PUSH — Mi Psicólogo');
  console.log('─'.repeat(60));

  if (ID_TOKEN === 'PEGA_AQUI_EL_ID_TOKEN') {
    console.log('\n⚠️  CONFIGURA los valores al inicio del archivo:');
    console.log('   ID_TOKEN      → token JWT del admin');
    console.log('   RECIPIENT_UID → UID del destinatario');
    console.log('\n   Para obtener el ID_TOKEN:');
    console.log('   1. Abre la app → F12 → Console');
    console.log('   2. Escribe: copy(await auth.currentUser.getIdToken())');
    console.log('   3. Pega el resultado en este script');
    return;
  }

  for (const test of TESTS) {
    process.stdout.write(`\n${test.name}... `);
    try {
      const result = await callAPI('/api/notify-user', test.payload);
      if (result.status === 200 && result.body.ok) {
        console.log('✅ ENVIADA');
      } else if (result.status === 200 && !result.body.ok) {
        console.log(`⚠️  Sin token FCM: ${result.body.reason}`);
        console.log('   → El destinatario no tiene notificaciones activadas');
      } else {
        console.log(`❌ Error ${result.status}:`, result.body.error || result.body);
      }
    } catch(e) {
      console.log('❌ Error de red:', e.message);
    }
    // Esperar 1.5s entre pruebas para no saturar
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n' + '─'.repeat(60));
  console.log('✓ Tests completados');
  console.log('  Si todas dicen ✅, el sistema de push funciona correctamente');
  console.log('  Si dicen ⚠️ sin token, el destinatario debe activar notificaciones en la app\n');
}

runTests();
