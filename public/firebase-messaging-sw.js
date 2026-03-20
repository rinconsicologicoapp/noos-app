importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3deMDFe1ukO5XWpIkOQAItV8Ba4GONMU",
  authDomain: "mipsicologo-13044.firebaseapp.com",
  projectId: "mipsicologo-13044",
  storageBucket: "mipsicologo-13044.firebasestorage.app",
  messagingSenderId: "962020436801",
  appId: "1:962020436801:web:18c5be88649a8d99e58fc0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
  });
});