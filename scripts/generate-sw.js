import { writeFileSync } from 'fs';

const cfg = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY            || 'AIzaSyAMxJlSS7b4elSZea3NaSn7DfiE7G2d2xY',
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN        || 'mipsicologo-13044.firebaseapp.com',
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID         || 'mipsicologo-13044',
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET     || 'mipsicologo-13044.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '962020436801',
  appId:             process.env.VITE_FIREBASE_APP_ID             || '1:962020436801:web:18c5be88649a8d99e58fc0',
};

const sw = `importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:'${cfg.apiKey}',authDomain:'${cfg.authDomain}',projectId:'${cfg.projectId}',
  storageBucket:'${cfg.storageBucket}',messagingSenderId:'${cfg.messagingSenderId}',appId:'${cfg.appId}',
});

var messaging = firebase.messaging();

var TIPOS_CRITICOS=['cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','tarea_completada','demora','nueva_resena','notif_programada',
  'recordatorio_recurrente','juego_turno','sesion_clinica','habitos_actualizados',
  'broadcast','recurso_nuevo','corazon_tarea','juego_turno_inmediato',
  'habito_recordatorio','recordatorio_pago'];

var TIPOS_PERSISTENTES=['cita_nueva','recordatorio_cita','cita_confirmada','cita_cancelada',
  'tarea_nueva','demora','sesion_clinica','corazon_tarea','juego_turno_inmediato'];

// Tags suprimidos por FCM_FOREGROUND (app mostró en primer plano)
var foregroundSuppressed = {};

async function getBadgeCount(){
  try{var n=await self.registration.getNotifications();return n.length;}catch(e){return 0;}
}
async function actualizarBadge(){
  if(!self.navigator||!self.navigator.setAppBadge)return;
  var c=await getBadgeCount();
  if(c>0)self.navigator.setAppBadge(c).catch(function(){});
  else if(self.navigator.clearAppBadge)self.navigator.clearAppBadge().catch(function(){});
}
function limpiarBadge(){
  if(self.navigator&&self.navigator.clearAppBadge)self.navigator.clearAppBadge().catch(function(){});
}

function getVibracion(tipo){
  var m={'cita_nueva':[0,400,100,400,100,700],'recordatorio_cita':[0,500,120,500,120,900],
    'cita_confirmada':[0,200,80,200,80,400],'cita_cancelada':[0,600,200,600],
    'tarea_nueva':[0,300,100,300,100,500],'tarea_completada':[0,200,80,200,80,400],
    'corazon_tarea':[0,150,60,150,60,300],'demora':[0,600,150,600,150,900],
    'sesion_clinica':[0,350,100,350,100,600],'habito_recordatorio':[0,300,100,300],
    'juego_turno_inmediato':[0,250,80,250,80,500,80,250],'recordatorio_pago':[0,200,100,200]};
  return m[tipo]||[0,350,100,350,100,550];
}
function getAcciones(tipo,link){
  var m={
    'recordatorio_cita':link?[{action:'join',title:'Unirse a la sesión'},{action:'dismiss',title:'Más tarde'}]:[{action:'open',title:'Ver cita'},{action:'dismiss',title:'Más tarde'}],
    'cita_nueva':[{action:'open',title:'Ver cita'},{action:'dismiss',title:'Más tarde'}],
    'cita_confirmada':[{action:'open',title:'Ver cita'},{action:'dismiss',title:'OK'}],
    'cita_cancelada':[{action:'open',title:'Ver detalles'},{action:'dismiss',title:'Entendido'}],
    'tarea_nueva':[{action:'open',title:'Ver tarea'},{action:'dismiss',title:'Más tarde'}],
    'tarea_completada':[{action:'open',title:'Ver respuesta'},{action:'dismiss',title:'Después'}],
    'corazon_tarea':[{action:'open',title:'Ver tarea'},{action:'dismiss',title:'OK'}],
    'demora':[{action:'open',title:'Ver aviso'},{action:'dismiss',title:'Entendido'}],
    'sesion_clinica':[{action:'open',title:'Mi Proceso'},{action:'dismiss',title:'Más tarde'}],
    'juego_turno_inmediato':[{action:'open',title:'Jugar ahora'},{action:'dismiss',title:'Más tarde'}],
    'habito_recordatorio':[{action:'open',title:'Registrar'},{action:'dismiss',title:'Después'}],
    'recordatorio_pago':[{action:'open',title:'Abrir app'},{action:'dismiss',title:'Gracias'}],
  };
  return m[tipo]||[{action:'open',title:'Abrir app'},{action:'dismiss',title:'Descartar'}];
}

function normalizarPayload(raw){
  var d=Object.assign({},raw.data||{});
  d.titulo=(raw.data&&raw.data.titulo)||(raw.notification&&raw.notification.title)||'Mi Psicólogo';
  d.mensaje=(raw.data&&raw.data.mensaje)||(raw.notification&&raw.notification.body)||'';
  return d;
}

var shownTags={};
function mostrarNotif(data){
  var tipo=data.tipo||'general';
  var titulo=data.titulo||'Mi Psicólogo';
  var cuerpo=data.mensaje||'';
  var tag=data.tag||data.citaId||tipo;
  var reqInteraction=TIPOS_PERSISTENTES.indexOf(tipo)>=0||data.requireInteraction==='true';
  if(shownTags[tag])return Promise.resolve();
  shownTags[tag]=1;
  setTimeout(function(){delete shownTags[tag];},5000);
  return self.registration.showNotification(titulo,{
    body:cuerpo,icon:'/icon-192.png',badge:'/icon-192.png',
    tag:tag,renotify:true,data:data,
    vibrate:getVibracion(tipo),requireInteraction:reqInteraction,
    silent:false,timestamp:Date.now(),
    actions:getAcciones(tipo,data.link),
  }).then(function(){return actualizarBadge();});
}

// RUTA 1: onBackgroundMessage — iOS usa principalmente este camino
messaging.onBackgroundMessage(function(payload){
  var data=normalizarPayload(payload);
  var tag=data.tag||data.citaId||data.tipo||'general';
  if(foregroundSuppressed[tag]){delete foregroundSuppressed[tag];return Promise.resolve();}
  return mostrarNotif(data);
});

// RUTA 2: push event — Android + fallback iOS
self.addEventListener('push',function(event){
  if(!event.data)return;
  var data;
  try{data=normalizarPayload(event.data.json());}catch(e){return;}
  var tipo=data.tipo||'';
  var tag=data.tag||data.citaId||tipo||'general';
  if(foregroundSuppressed[tag]){delete foregroundSuppressed[tag];return;}
  if(tipo&&TIPOS_CRITICOS.indexOf(tipo)<0)return;
  event.waitUntil(mostrarNotif(data));
});

// Mensaje desde el app: FCM_FOREGROUND → suprimir duplicado
self.addEventListener('message',function(event){
  if(!event.data)return;
  if(event.data.type==='FCM_FOREGROUND'&&event.data.tag){
    foregroundSuppressed[event.data.tag]=1;
    setTimeout(function(){delete foregroundSuppressed[event.data.tag];},4000);
  }
});

// Click: abrir app + badge
self.addEventListener('notificationclick',function(event){
  event.notification.close();
  limpiarBadge();
  if(event.action==='dismiss')return;
  var nd=event.notification.data||{};
  var url=nd.link||'https://mipsicologo.vercel.app';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      if('focus'in list[i]){list[i].postMessage({type:'NOTIFICATION_CLICK',data:nd});return list[i].focus();}
    }
    return clients.openWindow(url.startsWith('http')?url:'https://mipsicologo.vercel.app');
  }));
});

self.addEventListener('notificationclose',function(){actualizarBadge();});
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(clients.claim());});`;

writeFileSync('public/firebase-messaging-sw.js', sw);
console.log('✅ firebase-messaging-sw.js generado (iOS + Android + FCM_FOREGROUND + badge)');
