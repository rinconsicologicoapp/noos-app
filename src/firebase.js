import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export { getToken, onMessage };

// ✅ Registrar SW y enviarle la config de forma segura
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    // Esperar a que el SW esté activo antes de enviar el mensaje
    const sw = registration.active || registration.installing || registration.waiting;
    if (sw) {
      sw.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig
      });
    } else {
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', function() {
          if (this.state === 'activated') {
            this.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });
          }
        });
      });
    }
  });
}