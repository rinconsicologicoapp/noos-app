// generate-sw.js — firebase-messaging-sw.js redirige al SW único (sw.js)
// Mantener este archivo por compatibilidad con tokens existentes registrados con este nombre.
// Al activarse, reemplaza el SW activo por sw.js mediante importScripts-redirect pattern.
import { writeFileSync } from 'fs';

// firebase-messaging-sw.js es un stub que carga el SW real (sw.js)
// Esto garantiza que CUALQUIER token (registrado con sw.js o con firebase-messaging-sw.js)
// use exactamente el mismo código de notificaciones.
const stub = `// Stub de compatibilidad — delega todo a sw.js (el SW único real)
// Los tokens registrados con firebase-messaging-sw.js seguirán funcionando.
importScripts('/sw.js');
`;

writeFileSync('public/firebase-messaging-sw.js', stub);
console.log('✅ firebase-messaging-sw.js → stub que carga sw.js (SW único)');
