import { useState, useEffect } from "react";
import { messaging, getToken, onMessage } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getDoc, doc, setDoc, collection, getDocs, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
// ─────────────────────────────────────────
// BANCO DE 100 FRASES MOTIVADORAS
// ─────────────────────────────────────────
const FRASES_COMPANERO = [
  "Si puedes. Lo estás logrando.",
  "Ya buscaste ayuda. Eso es valentía.",
  "Deberías sentirte orgullos@ de tu proceso.",
  "Cada sesión cuenta. Aquí estoy contigo.",
  "No tienes que ser perfecto/a para avanzar.",
  "Hoy estás aquí. Eso ya es un logro.",
  "Tu proceso es tuyo y va a tu ritmo.",
  "Está bien no estar bien. Sigues adelante.",
  "Lo que sientes es válido.",
  "Pequeños pasos también son avance.",
  "Eres más fuerte de lo que crees.",
  "Pedir ayuda requiere mucho valor.",
  "Estás invirtiendo en ti. Eso importa.",
  "Hoy es un buen día para seguir.",
  "Tu bienestar merece atención.",
  "Confía en el proceso, aunque sea difícil.",
  "No estás sol@ en esto.",
  "Has llegado lejos. No te rindas.",
  "Cada emoción tiene su mensaje. Escúchala.",
  "Mereces sentirte bien.",
  "Estás aprendiendo a conocerte. Eso es enorme.",
  "La terapia es un regalo que te estás dando.",
  "Un día a la vez. Hoy es suficiente.",
  "Está bien pedir más de una sesión.",
  "Tu historia importa y merece ser escuchada.",
  "Permitirte sentir ya es sanar.",
  "No hay prisa. Tu proceso tiene su tiempo.",
  "Hoy te elegiste a ti. Bien hecho.",
  "Cada crisis que superas te hace más resiliente.",
  "Tu mente está trabajando. Dale tiempo.",
  "Eres capaz de más de lo que imaginas.",
  "Hablar de lo que duele también sana.",
  "No tienes que cargar todo solo/a.",
  "Buscar apoyo es inteligente, no debilidad.",
  "Estás construyendo una mejor versión de ti.",
  "Hoy hiciste algo por tu salud mental. Gracias.",
  "Los cambios toman tiempo. Sé paciente contigo.",
  "Reconocer cómo te sientes ya es avanzar.",
  "Mereces paz interior.",
  "Tu proceso es válido aunque nadie más lo vea.",
  "Estar aquí ya es un acto de amor propio.",
  "Todo lo que sientes tiene sentido.",
  "No eres tus pensamientos más difíciles.",
  "Hoy puedes. Un paso a la vez.",
  "La terapia no te hace débil, te hace honesto/a.",
  "Estás aprendiendo a cuidarte. Eso es poderoso.",
  "Cada día que apareces aquí suma.",
  "No tienes que tenerlo todo resuelto hoy.",
  "Permitirse ayuda es señal de madurez.",
  "Lo que viviste fue difícil. Y lo estás procesando.",
  "Sigue. Lo estás haciendo muy bien.",
  "Tu salud mental es tan importante como la física.",
  "Hoy te ves diferente. El proceso funciona.",
  "Confiar en alguien con lo que sientes es valiente.",
  "Estás aprendiendo a soltar lo que no puedes controlar.",
  "Mereces apoyo, no solo en los momentos difíciles.",
  "Cada sesión es una semilla que plantas.",
  "Lo difícil de hoy es la fortaleza de mañana.",
  "Estás más cerca de lo que crees.",
  "No te compares. Tu camino es único.",
  "Lo que hoy te pesa, mañana puede pesar menos.",
  "Estás aprendiendo a vivir contigo mismo/a.",
  "Hoy fue un día más de tu proceso. Cuenta.",
  "Tus emociones no te definen, te informan.",
  "Seguir adelante también es un logro.",
  "Mereces un espacio seguro para sanar.",
  "Ya diste el paso más difícil: empezar.",
  "Hoy apareciste. Eso es suficiente.",
  "Tu bienestar no es un lujo, es una necesidad.",
  "Lo estás haciendo aunque no siempre se sienta así.",
  "Estás más entero/a que ayer.",
  "Cada conversación honesta te libera un poco.",
  "Permitirte ayuda también es fortaleza.",
  "Tu proceso importa, aunque nadie más lo entienda.",
  "Hoy elegiste cuidarte. Eso es todo.",
  "No tienes que explicarle tu proceso a nadie.",
  "Estás sanando a tu manera. Eso es válido.",
  "Ser vulnerable no es debilidad, es coraje.",
  "Cada semana que apareces cuenta doble.",
  "Estás construyendo herramientas para toda la vida.",
  "Reconocer que necesitas apoyo es lucidez.",
  "Hoy te elegiste. Sigue haciéndolo.",
  "No hay una forma incorrecta de sanar.",
  "Lo que sientes hoy no es permanente.",
  "Estás aprendiendo, no fallando.",
  "Tu proceso tiene un ritmo propio. Respétalo.",
  "Mereces estar bien, sin condiciones.",
  "Cada vez que hablas de lo que duele, sanas un poco.",
  "Hoy fue difícil. Y aquí sigues. Eso importa.",
  "No tienes que ser más fuerte. Solo seguir.",
  "Estás haciendo el trabajo más importante.",
  "Tu mente y tu corazón merecen atención.",
  "Hoy eres la versión más valiente de ti.",
  "No necesitas permiso para sanar.",
  "Cada esfuerzo que haces en terapia suma.",
  "Estás escribiendo una historia de resiliencia.",
  "Lo que hoy parece imposible, mañana será distinto.",
  "Mereces el mismo amor que le das a otros.",
  "Seguir es suficiente. Siempre.",
];

// Calcula qué frase mostrar hoy (cambia cada 2 días, cicla en 100)
function getFraseHoy() {
  const inicio = new Date("2024-01-01").getTime();
  const hoy = Date.now();
  const dias = Math.floor((hoy - inicio) / 86400000);
  return FRASES_COMPANERO[Math.floor(dias / 2) % FRASES_COMPANERO.length];
}

// ─────────────────────────────────────────
// AVATAR CHARMAN
// ─────────────────────────────────────────
function CharmanAvatar({ mini = false }) {
  return (
    <svg viewBox="0 0 400 450" width={mini ? 72 : 200} height={mini ? 81 : 225}
      xmlns="http://www.w3.org/2000/svg"
      style={{animation:"frailejFlotar 4s ease-in-out infinite"}}>
      <defs>
        <radialGradient id="cBodyG" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFB37B"/>
          <stop offset="70%" stopColor="#FF9A4B"/>
          <stop offset="100%" stopColor="#E67E22"/>
        </radialGradient>
        <radialGradient id="cBellyG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF9D7"/>
          <stop offset="100%" stopColor="#FDF5BB"/>
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="300" rx="85" ry="100" fill="url(#cBodyG)"/>
      <ellipse cx="200" cy="320" rx="55" ry="70" fill="url(#cBellyG)" opacity="0.9"/>
      <path d="M120,180 Q120,100 200,100 Q280,100 280,180 Q280,240 200,240 Q120,240 120,180" fill="url(#cBodyG)"/>
      <ellipse cx="165" cy="170" rx="18" ry="25" fill="#222"/>
      <ellipse cx="165" cy="162" rx="7" ry="10" fill="white"/>
      <ellipse cx="235" cy="170" rx="18" ry="25" fill="#222"/>
      <ellipse cx="235" cy="162" rx="7" ry="10" fill="white"/>
      <path d="M185,210 Q200,225 215,210" stroke="#8E441E" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="115" cy="280" rx="25" ry="15" fill="#FF9A4B" transform="rotate(-30,115,280)"/>
      <ellipse cx="285" cy="280" rx="25" ry="15" fill="#FF9A4B" transform="rotate(30,285,280)"/>
      <g style={{transformOrigin:"335px 255px",animation:"frailejMecerse 1.8s ease-in-out infinite"}}>
        <path d="M330,300 Q360,250 340,210 Q320,250 330,300" fill="#FF4D4D"/>
        <path d="M332,290 Q345,260 335,230 Q325,260 332,290" fill="#FFCC00"/>
      </g>
    </svg>
  );
}
// ─────────────────────────────────────────
// AVATAR CACAITO
// ─────────────────────────────────────────
function CacaitoAvatar({ mini = false }) {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:mini?0:"8px 0 0"}}>
      <svg width={mini?72:220} height={mini?85:260} viewBox="30 0 300 440" xmlns="http://www.w3.org/2000/svg"
        style={{animation:"frailejFlotar 4.2s ease-in-out infinite"}}>
        <defs>
          <radialGradient id="ccCuerpo" cx="42%" cy="38%" r="62%"><stop offset="0%" stopColor="#E8B890"/><stop offset="40%" stopColor="#B87848"/><stop offset="75%" stopColor="#8B5230"/><stop offset="100%" stopColor="#6B3818"/></radialGradient>
          <radialGradient id="ccPanza" cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#F8EDD8"/><stop offset="50%" stopColor="#EED8B8"/><stop offset="100%" stopColor="#D8C090"/></radialGradient>
          <radialGradient id="ccPie" cx="40%" cy="35%" r="65%"><stop offset="0%" stopColor="#C89060"/><stop offset="60%" stopColor="#8B5230"/><stop offset="100%" stopColor="#5B3018"/></radialGradient>
          <radialGradient id="ccOjo" cx="30%" cy="28%" r="65%"><stop offset="0%" stopColor="#C09858"/><stop offset="45%" stopColor="#7B5030"/><stop offset="100%" stopColor="#3B2010"/></radialGradient>
          <radialGradient id="ccGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#B87848" stopOpacity=".5"/><stop offset="100%" stopColor="#8B5230" stopOpacity="0"/></radialGradient>
          <clipPath id="ccScan"><ellipse cx="185" cy="398" rx="82" ry="11"/></clipPath>
        </defs>
        {/* Partículas */}
        <circle cx="95" cy="120" r="3.5" fill="#C89060" opacity=".5" style={{animation:"frailejDrift 3.5s ease-in-out infinite"}}/>
        <circle cx="88" cy="150" r="2.5" fill="#D0A870" opacity=".4" style={{animation:"frailejDrift 4s ease-in-out infinite 0.8s"}}/>
        <circle cx="275" cy="115" r="3.5" fill="#B87848" opacity=".5" style={{animation:"frailejDrift 3.2s ease-in-out infinite 1s"}}/>
        <circle cx="282" cy="148" r="2.5" fill="#C89060" opacity=".4" style={{animation:"frailejDrift 3.8s ease-in-out infinite 0.5s"}}/>
        <circle cx="100" cy="295" r="2.5" fill="#D4A870" opacity=".4" style={{animation:"frailejDrift 4.2s ease-in-out infinite 1.3s"}}/>
        <circle cx="272" cy="290" r="2.5" fill="#C09050" opacity=".4" style={{animation:"frailejDrift 3.6s ease-in-out infinite 0.3s"}}/>
        {/* Piernas */}
        <ellipse cx="158" cy="345" rx="18" ry="28" fill="url(#ccPie)" transform="rotate(-8,158,345)"/>
        <ellipse cx="148" cy="370" rx="24" ry="15" fill="url(#ccPie)"/>
        <ellipse cx="144" cy="372" rx="15" ry="9" fill="#7B4228" opacity=".4"/>
        <ellipse cx="212" cy="345" rx="18" ry="28" fill="url(#ccPie)" transform="rotate(8,212,345)"/>
        <ellipse cx="222" cy="370" rx="24" ry="15" fill="url(#ccPie)"/>
        <ellipse cx="226" cy="372" rx="15" ry="9" fill="#7B4228" opacity=".4"/>
        {/* Cuerpo */}
        <ellipse cx="185" cy="245" rx="88" ry="118" fill="url(#ccCuerpo)"/>
        <path d="M185,130 Q162,245 185,362" stroke="#5B3018" strokeWidth="10" fill="none" strokeLinecap="round" opacity=".7"/>
        <path d="M185,130 Q162,245 185,362" stroke="#C89060" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".3"/>
        <path d="M185,143 Q205,245 185,355" stroke="#5B3018" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".25"/>
        <path d="M155,153 Q140,245 158,348" stroke="#5B3018" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".18"/>
        <path d="M215,153 Q230,245 212,348" stroke="#5B3018" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".18"/>
        <ellipse cx="185" cy="265" rx="52" ry="72" fill="url(#ccPanza)" opacity=".75"/>
        {/* Bracitos simples sin dedos */}
        <ellipse cx="108" cy="245" rx="26" ry="16" fill="url(#ccCuerpo)" transform="rotate(-25,108,245)"/>
        <ellipse cx="262" cy="245" rx="26" ry="16" fill="url(#ccCuerpo)" transform="rotate(25,262,245)"/>
        {/* Pedúnculo y hojitas */}
        <rect x="179" y="116" width="12" height="22" rx="6" fill="#4B2C10"/>
        <ellipse cx="185" cy="116" rx="16" ry="8" fill="#5B3820"/>
        <ellipse cx="168" cy="112" rx="14" ry="7" fill="#6B8020" opacity=".85" transform="rotate(-30,168,112)"/>
        <ellipse cx="202" cy="112" rx="14" ry="7" fill="#7B9028" opacity=".85" transform="rotate(30,202,112)"/>
        <ellipse cx="185" cy="106" rx="10" ry="6" fill="#5B7018" opacity=".8"/>
        {/* Cabeza */}
        <ellipse cx="185" cy="186" rx="68" ry="62" fill="url(#ccCuerpo)"/>
        <ellipse cx="132" cy="198" rx="18" ry="11" fill="#E8A060" opacity=".32"/>
        <ellipse cx="238" cy="198" rx="18" ry="11" fill="#E8A060" opacity=".32"/>
        {/* Ojos izq */}
        <ellipse cx="158" cy="184" rx="20" ry="22" fill="#2B1808"/>
        <ellipse cx="158" cy="184" rx="18" ry="20" fill="white"/>
        <ellipse cx="159" cy="185" rx="13" ry="14" fill="url(#ccOjo)"/>
        <ellipse cx="159" cy="185" rx="8" ry="8" fill="#4B2C18"/>
        <ellipse cx="159" cy="185" rx="4" ry="4" fill="#1B0C04"/>
        <ellipse cx="152" cy="177" rx="5.5" ry="4.5" fill="white" opacity=".92"/>
        <circle cx="164" cy="190" r="3" fill="white" opacity=".5"/>
        {/* Ojos der */}
        <ellipse cx="212" cy="184" rx="20" ry="22" fill="#2B1808"/>
        <ellipse cx="212" cy="184" rx="18" ry="20" fill="white"/>
        <ellipse cx="213" cy="185" rx="13" ry="14" fill="url(#ccOjo)"/>
        <ellipse cx="213" cy="185" rx="8" ry="8" fill="#4B2C18"/>
        <ellipse cx="213" cy="185" rx="4" ry="4" fill="#1B0C04"/>
        <ellipse cx="206" cy="177" rx="5.5" ry="4.5" fill="white" opacity=".92"/>
        <circle cx="218" cy="190" r="3" fill="white" opacity=".5"/>
        {/* Nariz y boca */}
        <ellipse cx="185" cy="200" rx="5" ry="3.5" fill="#4B2C18"/>
        <path d="M172 210 Q185 222 198 210" fill="none" stroke="#3B1C08" strokeWidth="3" strokeLinecap="round"/>
        {/* Base hexágono futurista */}
        <ellipse cx="185" cy="408" rx="115" ry="28" fill="url(#ccGlow)"/>
        <polygon points="185,378 228,390 228,412 185,424 142,412 142,390" fill="#1E1408" stroke="#8B5230" strokeWidth="1" opacity=".92"/>
        <polygon points="185,382 224,393 224,409 185,420 146,409 146,393" fill="none" stroke="#C09050" strokeWidth=".5" opacity=".4"/>
        <circle cx="185" cy="401" r="4" fill="#8B5230" opacity=".6" style={{animation:"frailejBrillar 1.5s ease-in-out infinite"}}/>
        <circle cx="185" cy="401" r="2" fill="#E8B870" opacity=".9" style={{animation:"frailejBrillar 1.5s ease-in-out infinite 0.3s"}}/>
        <g style={{transformOrigin:"185px 401px",animation:"frailejMecerse 5s linear infinite"}}>
          <ellipse cx="185" cy="401" rx="100" ry="12" fill="none" stroke="#8B5230" strokeWidth=".8" strokeDasharray="5 7" opacity=".45" transform="rotate(-15,185,401)"/>
          <circle cx="285" cy="401" r="4" fill="#C89060" opacity=".9"/>
        </g>
        <g style={{transformOrigin:"185px 401px",animation:"frailejMecerseR 7s linear infinite"}}>
          <ellipse cx="185" cy="401" rx="72" ry="9" fill="none" stroke="#D0A060" strokeWidth=".6" strokeDasharray="3 9" opacity=".35" transform="rotate(20,185,401)"/>
          <circle cx="113" cy="401" r="3" fill="#E8C080" opacity=".8"/>
        </g>
        <g style={{transformOrigin:"185px 401px",animation:"frailejMecerse 9s linear infinite"}}>
          <ellipse cx="185" cy="401" rx="52" ry="6" fill="none" stroke="#B87848" strokeWidth=".5" strokeDasharray="2 8" opacity=".28" transform="rotate(45,185,401)"/>
          <circle cx="185" cy="395" r="2.5" fill="#F0C880" opacity=".7"/>
        </g>
        <circle cx="185" cy="378" r="2.5" fill="#C89060" opacity=".7" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        <circle cx="228" cy="390" r="2.5" fill="#C89060" opacity=".6" style={{animation:"frailejBrillar 2s ease-in-out infinite 0.4s"}}/>
        <circle cx="228" cy="412" r="2.5" fill="#C89060" opacity=".6" style={{animation:"frailejBrillar 2s ease-in-out infinite 0.8s"}}/>
        <circle cx="185" cy="424" r="2.5" fill="#C89060" opacity=".7" style={{animation:"frailejBrillar 2s ease-in-out infinite 1.2s"}}/>
        <circle cx="142" cy="412" r="2.5" fill="#C89060" opacity=".6" style={{animation:"frailejBrillar 2s ease-in-out infinite 1.6s"}}/>
        <circle cx="142" cy="390" r="2.5" fill="#C89060" opacity=".6" style={{animation:"frailejBrillar 2s ease-in-out infinite 2s"}}/>
        <line x1="185" y1="424" x2="185" y2="434" stroke="#8B5230" strokeWidth=".8" opacity=".35"/>
        <line x1="155" y1="418" x2="148" y2="428" stroke="#8B5230" strokeWidth=".6" opacity=".25"/>
        <line x1="215" y1="418" x2="222" y2="428" stroke="#8B5230" strokeWidth=".6" opacity=".25"/>
      </svg>
    </div>
  );
}
// ─────────────────────────────────────────
// AVATAR ABSTRACTIS
// ─────────────────────────────────────────
function AbstractisAvatar({ mini = false }) {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:mini?0:"8px 0 0"}}>
      <svg width={mini?72:200} height={mini?85:240} viewBox="30 -10 220 325" xmlns="http://www.w3.org/2000/svg"
        style={{animation:"frailejFlotar 4s ease-in-out infinite"}}>
        <defs>
          <radialGradient id="abCara" cx="45%" cy="40%" r="60%"><stop offset="0%" stopColor="#A8B8C8"/><stop offset="55%" stopColor="#7890A8"/><stop offset="100%" stopColor="#506078"/></radialGradient>
          <radialGradient id="abOjo" cx="35%" cy="30%" r="65%"><stop offset="0%" stopColor="#90E060"/><stop offset="50%" stopColor="#40A820"/><stop offset="100%" stopColor="#186008"/></radialGradient>
          <radialGradient id="abGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7890A8" stopOpacity=".5"/><stop offset="100%" stopColor="#506078" stopOpacity="0"/></radialGradient>
        </defs>
        {/* Partículas */}
        <circle cx="60" cy="90" r="3" fill="#E88020" opacity=".5" style={{animation:"frailejDrift 3.5s ease-in-out infinite"}}/>
        <circle cx="215" cy="110" r="3" fill="#F8C040" opacity=".45" style={{animation:"frailejDrift 3s ease-in-out infinite 0.8s"}}/>
        <circle cx="55" cy="140" r="2" fill="#F09030" opacity=".4" style={{animation:"frailejDrift 4s ease-in-out infinite 1.2s"}}/>
        <circle cx="218" cy="155" r="2" fill="#E88020" opacity=".35" style={{animation:"frailejDrift 3.6s ease-in-out infinite 0.4s"}}/>
        {/* Cabello mosaico naranja — tapa superior */}
        <ellipse cx="145" cy="55" rx="72" ry="42" fill="#E88020"/>
        <circle cx="105" cy="38" r="7" fill="#F8C040"/><circle cx="118" cy="28" r="6" fill="#E04800"/><circle cx="132" cy="22" r="7" fill="#F09030"/>
        <circle cx="147" cy="18" r="8" fill="#F8C040"/><circle cx="162" cy="22" r="6" fill="#D06010"/><circle cx="176" cy="30" r="7" fill="#F09030"/>
        <circle cx="188" cy="40" r="6" fill="#E88020"/><circle cx="196" cy="52" r="5" fill="#F8C040"/>
        <rect x="108" y="44" width="8" height="8" rx="2" fill="#F0A030"/><rect x="120" y="38" width="7" height="7" rx="2" fill="#F8C040"/>
        <rect x="133" y="34" width="9" height="9" rx="2" fill="#E04800"/><rect x="148" y="30" width="8" height="8" rx="2" fill="#F8D060"/>
        <rect x="162" y="35" width="7" height="7" rx="2" fill="#F09030"/><rect x="175" y="42" width="8" height="8" rx="2" fill="#E88020"/>
        {/* Cascada pelo izquierda */}
        <ellipse cx="95" cy="100" rx="22" ry="55" fill="#E88020" transform="rotate(-8,95,100)"/>
        <circle cx="86" cy="75" r="6" fill="#F8C040"/><circle cx="90" cy="90" r="5" fill="#E04800"/>
        <circle cx="84" cy="106" r="6" fill="#F09030"/><circle cx="88" cy="122" r="5" fill="#F8C040"/>
        <rect x="80" y="136" width="7" height="7" rx="2" fill="#E88020"/>
        {/* CARA cubista azul */}
        <path d="M110,68 Q88,75 84,120 Q80,165 100,200 Q120,230 145,228 Q170,226 185,200 Q200,172 198,130 Q196,88 178,70 Q162,55 145,58 Q128,60 110,68 Z" fill="url(#abCara)"/>
        {/* Zona marrón oscura superior derecha */}
        <path d="M158,68 Q178,72 192,92 Q198,112 190,130 Q178,118 168,100 Q160,84 158,68 Z" fill="#8B5A38" opacity=".85"/>
        {/* Zona morada con escamas */}
        <path d="M140,140 Q162,138 178,155 Q186,172 178,192 Q168,208 150,210 Q134,210 125,195 Q118,178 125,158 Q132,142 140,140 Z" fill="#6840A0" opacity=".88"/>
        <path d="M130,155 Q140,150 150,155 Q140,160 130,155Z" fill="none" stroke="#9060C8" strokeWidth=".8" opacity=".5"/>
        <path d="M148,155 Q158,150 168,155 Q158,160 148,155Z" fill="none" stroke="#9060C8" strokeWidth=".8" opacity=".5"/>
        <path d="M134,165 Q144,160 154,165 Q144,170 134,165Z" fill="none" stroke="#9060C8" strokeWidth=".8" opacity=".5"/>
        <path d="M152,165 Q162,160 172,165 Q162,170 152,165Z" fill="none" stroke="#9060C8" strokeWidth=".8" opacity=".5"/>
        <path d="M130,175 Q140,170 150,175 Q140,180 130,175Z" fill="none" stroke="#9060C8" strokeWidth=".8" opacity=".5"/>
        {/* OJO CENTRAL cubista — el más expresivo */}
        <path d="M122,100 Q138,88 155,90 Q170,92 178,102 Q168,118 152,120 Q134,120 122,108 Q118,104 122,100 Z" fill="white"/>
        <ellipse cx="150" cy="105" rx="16" ry="14" fill="url(#abOjo)"/>
        <ellipse cx="150" cy="105" rx="8" ry="9" fill="#1A0C08"/>
        <ellipse cx="145" cy="100" rx="5" ry="4" fill="white" opacity=".8"/>
        {/* Párpado */}
        <path d="M122,100 Q138,88 155,90 Q170,92 178,102" fill="none" stroke="#3A6828" strokeWidth="2" opacity=".6"/>
        {/* Cejas cubistas */}
        <path d="M118,94 Q138,84 162,86" fill="none" stroke="#3A2818" strokeWidth="3" strokeLinecap="round" opacity=".7"/>
        {/* Arête dorado derecho */}
        <path d="M185,140 Q196,142 200,152 Q196,162 185,162 Q182,152 185,140 Z" fill="#F0C020"/>
        <ellipse cx="188" cy="152" rx="10" ry="12" fill="none" stroke="#E8A800" strokeWidth="2.5" opacity=".8"/>
        {/* Labios rojos */}
        <path d="M118,192 Q135,183 150,186 Q165,183 175,192 Q165,205 150,208 Q135,205 118,192 Z" fill="#CC2020"/>
        <path d="M118,192 Q135,200 150,200 Q165,200 175,192" fill="#AA1818" opacity=".6"/>
        <path d="M120,192 Q135,186 150,188 Q165,186 174,192" fill="none" stroke="#FF4040" strokeWidth="1" opacity=".4"/>
        {/* Triángulo lateral izquierdo */}
        <path d="M84,118 L75,108 L78,132 Z" fill="#7890A8" stroke="#506078" strokeWidth="1" opacity=".7"/>
        {/* Puntitos decorativos laterales */}
        <circle cx="78" cy="122" r="4" fill="#CC2020" opacity=".7"/>
        <circle cx="78" cy="112" r="3" fill="#A8B8C8" opacity=".6"/>
        <circle cx="78" cy="133" r="3" fill="#A8B8C8" opacity=".5"/>
        {/* BASE futurista — arcos concéntricos tipo máscara ritual */}
        <ellipse cx="145" cy="258" rx="82" ry="14" fill="#38485A" opacity=".88"/>
        <ellipse cx="145" cy="256" rx="82" ry="14" fill="none" stroke="#7890A8" strokeWidth="1" opacity=".55"/>
        <ellipse cx="145" cy="244" rx="70" ry="8" fill="none" stroke="#7890A8" strokeWidth="1.2" strokeDasharray="4 6" opacity=".4"/>
        <ellipse cx="145" cy="234" rx="56" ry="6" fill="none" stroke="#A8B8C8" strokeWidth=".8" strokeDasharray="3 7" opacity=".3"/>
        <ellipse cx="145" cy="226" rx="40" ry="4" fill="none" stroke="#7890A8" strokeWidth=".6" strokeDasharray="2 8" opacity=".22"/>
        <circle cx="145" cy="257" r="4" fill="#506078" opacity=".8" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        <circle cx="145" cy="257" r="2" fill="#A8C8E0" opacity=".9"/>
        <g style={{transformOrigin:"145px 257px",animation:"frailejMecerse 5s linear infinite"}}>
          <ellipse cx="145" cy="257" rx="72" ry="10" fill="none" stroke="#7890A8" strokeWidth=".8" strokeDasharray="5 7" opacity=".45"/>
          <circle cx="217" cy="257" r="3.5" fill="#E88020" opacity=".85" style={{animation:"frailejBrillar 1.5s ease-in-out infinite"}}/>
        </g>
        <g style={{transformOrigin:"145px 257px",animation:"frailejMecerseR 7s linear infinite"}}>
          <ellipse cx="145" cy="257" rx="50" ry="7" fill="none" stroke="#A8B8C8" strokeWidth=".6" strokeDasharray="3 8" opacity=".35"/>
          <circle cx="95" cy="257" r="2.5" fill="#F8C040" opacity=".7"/>
        </g>
        <line x1="63" y1="257" x2="50" y2="257" stroke="#7890A8" strokeWidth="1.5" opacity=".55"/>
        <line x1="227" y1="257" x2="240" y2="257" stroke="#7890A8" strokeWidth="1.5" opacity=".55"/>
        <path d="M50 257 L38 252 L38 262 Z" fill="#38485A" stroke="#7890A8" strokeWidth=".8" opacity=".65"/>
        <path d="M240 257 L252 252 L252 262 Z" fill="#38485A" stroke="#7890A8" strokeWidth=".8" opacity=".65"/>
        <line x1="115" y1="268" x2="110" y2="278" stroke="#7890A8" strokeWidth=".7" opacity=".3"/>
        <line x1="145" y1="270" x2="145" y2="280" stroke="#A8B8C8" strokeWidth=".7" opacity=".3"/>
        <line x1="175" y1="268" x2="180" y2="278" stroke="#7890A8" strokeWidth=".7" opacity=".3"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// MAPA CENTRAL DE COMPAÑEROS
// ─────────────────────────────────────────
const COMPANEROS = {
  "frailejón": {
    Componente: FrailejonAvatar,
    nombre: "Frailejón",
    descripcion: "Espíritu del páramo colombiano",
    color: "#587018",
    colorClaro: "rgba(88,112,24,0.1)",
    colorBorde: "rgba(88,112,24,0.25)",
  },
  "charman": {
    Componente: CharmanAvatar,
    nombre: "Charman",
    descripcion: "Espíritu del fuego",
    color: "#C05010",
    colorClaro: "rgba(192,80,16,0.1)",
    colorBorde: "rgba(192,80,16,0.25)",
  },
  "cacaito": {
    Componente: CacaitoAvatar,
    nombre: "Cacaito",
    descripcion: "Espíritu del cacao",
    color: "#8B5230",
    colorClaro: "rgba(139,82,48,0.1)",
    colorBorde: "rgba(139,82,48,0.25)",
  },
  "abstractis": {
    Componente: AbstractisAvatar,
    nombre: "Abstractis",
    descripcion: "Espíritu del arte y la expresión",
    color: "#506078",
    colorClaro: "rgba(80,96,120,0.1)",
    colorBorde: "rgba(80,96,120,0.25)",
  },
  "robi": {
    Componente: RobiAvatar,
    nombre: "Robi",
    descripcion: "Espiritu IA",
    color: "#4060A0",
    colorClaro: "rgba(64,96,160,0.1)",
    colorBorde: "rgba(64,96,160,0.25)",
  },
};
// ─────────────────────────────────────────
// AVATAR ROBI
// ─────────────────────────────────────────
function RobiAvatar({ mini = false }) {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:mini?0:"8px 0 0"}}>
      <svg width={mini?72:200} height={mini?85:240} viewBox="0 10 300 400" xmlns="http://www.w3.org/2000/svg"
        style={{animation:"frailejFlotar 4s ease-in-out infinite"}}>
        <defs>
          <radialGradient id="rbCab" cx="35%" cy="25%" r="72%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="15%" stopColor="#F8FBFF"/><stop offset="40%" stopColor="#E8EEF8"/><stop offset="70%" stopColor="#CDD6EE"/><stop offset="100%" stopColor="#A4B2D0"/></radialGradient>
          <radialGradient id="rbCue" cx="38%" cy="28%" r="70%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="20%" stopColor="#F4F7FF"/><stop offset="50%" stopColor="#E0E8F4"/><stop offset="80%" stopColor="#C8D4EC"/><stop offset="100%" stopColor="#9AAAD0"/></radialGradient>
          <radialGradient id="rbCia" cx="50%" cy="100%" r="60%"><stop offset="0%" stopColor="#20F0E0" stopOpacity=".75"/><stop offset="50%" stopColor="#20F0E0" stopOpacity=".25"/><stop offset="100%" stopColor="#20F0E0" stopOpacity="0"/></radialGradient>
          <radialGradient id="rbScr" cx="48%" cy="42%" r="60%"><stop offset="0%" stopColor="#18202E"/><stop offset="55%" stopColor="#0C1220"/><stop offset="100%" stopColor="#06090F"/></radialGradient>
          <radialGradient id="rbEyL" cx="30%" cy="28%" r="70%"><stop offset="0%" stopColor="#C0FFF8"/><stop offset="35%" stopColor="#30E8E0"/><stop offset="70%" stopColor="#00A8A0"/><stop offset="100%" stopColor="#005858"/></radialGradient>
          <radialGradient id="rbEyR" cx="30%" cy="28%" r="70%"><stop offset="0%" stopColor="#EDD8FF"/><stop offset="35%" stopColor="#C070FF"/><stop offset="70%" stopColor="#7820D0"/><stop offset="100%" stopColor="#350890"/></radialGradient>
          <radialGradient id="rbArL" cx="30%" cy="22%" r="72%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="35%" stopColor="#E8EEF8"/><stop offset="70%" stopColor="#C8D4EC"/><stop offset="100%" stopColor="#98AACB"/></radialGradient>
          <radialGradient id="rbArR" cx="68%" cy="22%" r="72%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="35%" stopColor="#E8EEF8"/><stop offset="70%" stopColor="#C8D4EC"/><stop offset="100%" stopColor="#98AACB"/></radialGradient>
          <radialGradient id="rbLeg" cx="38%" cy="22%" r="70%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="40%" stopColor="#E4EAF6"/><stop offset="80%" stopColor="#C0CCEC"/><stop offset="100%" stopColor="#94A4CA"/></radialGradient>
          <radialGradient id="rbAnt" cx="36%" cy="24%" r="68%"><stop offset="0%" stopColor="#F4F8FF"/><stop offset="60%" stopColor="#D8E0F4"/><stop offset="100%" stopColor="#A8B8D8"/></radialGradient>
        </defs>
        {/* Partículas */}
        <circle cx="28" cy="135" r="3" fill="#20F0E0" opacity=".4" style={{animation:"frailejDrift 3.5s ease-in-out infinite"}}/>
        <circle cx="22" cy="168" r="2" fill="#C090FF" opacity=".35" style={{animation:"frailejDrift 4s ease-in-out infinite 0.9s"}}/>
        <circle cx="272" cy="130" r="3" fill="#20F0E0" opacity=".4" style={{animation:"frailejDrift 3.2s ease-in-out infinite 1.1s"}}/>
        <circle cx="276" cy="164" r="2" fill="#C090FF" opacity=".35" style={{animation:"frailejDrift 3.8s ease-in-out infinite 0.5s"}}/>
        {/* Antenas */}
        <g style={{transformOrigin:"122px 72px",animation:"frailejMecerse 3s ease-in-out infinite"}}>
          <path d="M120,95 C120,85 119,78 122,65" fill="none" stroke="url(#rbAnt)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M120,95 C120,85 119,78 122,65" fill="none" stroke="#C8D4F0" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="122" cy="62" r="9" fill="url(#rbAnt)"/>
          <circle cx="122" cy="62" r="9" fill="none" stroke="#C8D4F0" strokeWidth="1.5"/>
          <circle cx="119" cy="59" r="4" fill="white" opacity=".55"/>
          <circle cx="122" cy="62" r="3" fill="#20F0E0" opacity=".5" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        </g>
        <g style={{transformOrigin:"178px 72px",animation:"frailejMecerseR 3.5s ease-in-out infinite 0.5s"}}>
          <path d="M178,95 C178,85 179,78 178,65" fill="none" stroke="url(#rbAnt)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M178,95 C178,85 179,78 178,65" fill="none" stroke="#C8D4F0" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="178" cy="62" r="9" fill="url(#rbAnt)"/>
          <circle cx="178" cy="62" r="9" fill="none" stroke="#C8D4F0" strokeWidth="1.5"/>
          <circle cx="175" cy="59" r="4" fill="white" opacity=".55"/>
          <circle cx="178" cy="62" r="3" fill="#C090FF" opacity=".5" style={{animation:"frailejBrillar 2.4s ease-in-out infinite 0.5s"}}/>
        </g>
        {/* Brazo izq */}
        <path d="M76,218 C58,218 36,226 24,243 C14,258 18,278 32,288 C44,298 62,296 70,284 C58,270 54,254 58,240 C62,228 70,220 76,218 Z" fill="url(#rbArL)"/>
        <path d="M76,218 C58,218 36,226 24,243 C14,258 18,278 32,288 C44,298 62,296 70,284 C58,270 54,254 58,240 C62,228 70,220 76,218 Z" fill="none" stroke="#20F0E0" strokeWidth="1.5" opacity=".3"/>
        <path d="M48,232 C40,244 36,258 40,270" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity=".35"/>
        {/* Brazo der */}
        <path d="M224,218 C242,218 265,226 277,243 C287,258 283,278 268,288 C256,298 238,296 230,284 C242,270 246,254 242,240 C238,228 230,220 224,218 Z" fill="url(#rbArR)"/>
        <path d="M224,218 C242,218 265,226 277,243 C287,258 283,278 268,288 C256,298 238,296 230,284 C242,270 246,254 242,240 C238,228 230,220 224,218 Z" fill="none" stroke="#20F0E0" strokeWidth="1.5" opacity=".3"/>
        <path d="M252,232 C260,244 264,258 260,270" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity=".35"/>
        {/* Pierna izq */}
        <path d="M118,346 C112,352 106,366 108,381 C110,396 122,404 135,402 C148,400 154,389 152,376 C150,362 140,352 128,348 Z" fill="url(#rbLeg)"/>
        <path d="M118,346 C112,352 106,366 108,381 C110,396 122,404 135,402 C148,400 154,389 152,376 C150,362 140,352 128,348 Z" fill="none" stroke="#20F0E0" strokeWidth="1.2" opacity=".28"/>
        {/* Pierna der */}
        <path d="M182,346 C192,352 200,366 198,381 C196,396 184,404 170,402 C156,400 150,389 152,376 C154,362 164,352 175,348 Z" fill="url(#rbLeg)"/>
        <path d="M182,346 C192,352 200,366 198,381 C196,396 184,404 170,402 C156,400 150,389 152,376 C154,362 164,352 175,348 Z" fill="none" stroke="#20F0E0" strokeWidth="1.2" opacity=".28"/>
        {/* Cuerpo */}
        <path d="M150,238 C120,238 98,246 88,262 C78,278 80,302 90,318 C100,334 116,346 150,348 C184,346 200,334 210,318 C220,302 222,278 212,262 C202,246 180,238 150,238 Z" fill="url(#rbCue)"/>
        <path d="M150,238 C120,238 98,246 88,262 C78,278 80,302 90,318 C100,334 116,346 150,348 C184,346 200,334 210,318 C220,302 222,278 212,262 C202,246 180,238 150,238 Z" fill="url(#rbCia)" opacity=".6"/>
        <path d="M150,238 C120,238 98,246 88,262 C78,278 80,302 90,318 C100,334 116,346 150,348 C184,346 200,334 210,318 C220,302 222,278 212,262 C202,246 180,238 150,238 Z" fill="none" stroke="#20F0E0" strokeWidth="2" opacity=".4"/>
        <path d="M108,252 C96,264 92,282 96,298" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".32"/>
        <path d="M100,272 C118,264 150,260 200,272" fill="none" stroke="#20F0E0" strokeWidth="2.2" strokeLinecap="round" opacity=".55" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        <path d="M96,290 C116,282 150,278 204,290" fill="none" stroke="#20F0E0" strokeWidth="1.8" strokeLinecap="round" opacity=".4" style={{animation:"frailejBrillar 2.4s ease-in-out infinite 0.4s"}}/>
        <path d="M98,308 C117,300 150,296 202,308" fill="none" stroke="#20F0E0" strokeWidth="1.3" strokeLinecap="round" opacity=".28" style={{animation:"frailejBrillar 2.8s ease-in-out infinite 0.8s"}}/>
        <circle cx="150" cy="328" r="4" fill="#B0BCDC"/>
        <circle cx="150" cy="328" r="2" fill="#20F0E0" opacity=".6" style={{animation:"frailejBrillar 1.8s ease-in-out infinite"}}/>
        {/* Cabeza */}
        <path d="M150,86 C104,86 70,94 66,130 C62,164 66,190 74,210 C82,230 96,240 150,240 C204,240 218,230 226,210 C234,190 238,164 234,130 C230,94 196,86 150,86 Z" fill="url(#rbCab)"/>
        <path d="M150,86 C104,86 70,94 66,130 C62,164 66,190 74,210 C82,230 96,240 150,240 C204,240 218,230 226,210 C234,190 238,164 234,130 C230,94 196,86 150,86 Z" fill="url(#rbCia)" opacity=".45"/>
        <path d="M150,86 C104,86 70,94 66,130 C62,164 66,190 74,210 C82,230 96,240 150,240 C204,240 218,230 226,210 C234,190 238,164 234,130 C230,94 196,86 150,86 Z" fill="none" stroke="#20F0E0" strokeWidth="1.5" opacity=".2"/>
        {/* Brillo frente */}
        <path d="M150,90 C116,92 88,106 78,128 C72,140 74,154 82,158 C100,138 124,128 150,128 C176,128 200,138 218,158 C226,154 228,140 222,128 C212,106 184,92 150,90 Z" fill="white" opacity=".62"/>
        <path d="M150,92 C122,94 98,106 88,122 C84,130 86,140 92,146 C108,130 128,122 150,122 C172,122 192,130 208,146 C214,140 216,130 212,122 C202,106 178,94 150,92 Z" fill="white" opacity=".42"/>
        {/* Auriculares */}
        <path d="M68,148 C58,148 50,154 50,163 C50,172 58,178 68,178 C64,172 62,165 62,160 C62,155 64,150 68,148 Z" fill="url(#rbCab)"/>
        <path d="M68,148 C58,148 50,154 50,163 C50,172 58,178 68,178" fill="none" stroke="#C0CCE8" strokeWidth="1.5"/>
        <path d="M232,148 C242,148 250,154 250,163 C250,172 242,178 232,178 C236,172 238,165 238,160 C238,155 236,150 232,148 Z" fill="url(#rbCab)"/>
        <path d="M232,148 C242,148 250,154 250,163 C250,172 242,178 232,178" fill="none" stroke="#C0CCE8" strokeWidth="1.5"/>
        {/* Pantalla */}
        <path d="M96,116 C90,128 88,144 88,158 C88,176 92,194 100,206 C110,220 128,226 150,226 C172,226 190,220 200,206 C208,194 212,176 212,158 C212,144 210,128 204,116 C194,98 174,90 150,90 C126,90 106,98 96,116 Z" fill="#181E2C"/>
        <path d="M100,118 C94,130 92,146 92,160 C92,177 96,194 104,205 C114,218 130,224 150,224 C170,224 186,218 196,205 C204,194 208,177 208,160 C208,146 206,130 200,118 C190,102 172,95 150,95 C128,95 110,102 100,118 Z" fill="url(#rbScr)"/>
        {/* Ojo izq turquesa */}
        <circle cx="118" cy="162" r="24" fill="none" stroke="#20F0E0" strokeWidth="3.5" opacity=".8" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        <circle cx="118" cy="162" r="21" fill="#050E1C"/>
        <circle cx="118" cy="162" r="18" fill="url(#rbEyL)"/>
        <circle cx="118" cy="162" r="9" fill="#10A0A0" opacity=".85"/>
        <circle cx="118" cy="162" r="5" fill="#003838"/>
        <path d="M107,152 C110,149 116,149 119,152" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".9"/>
        <circle cx="124" cy="168" r="3" fill="white" opacity=".45"/>
        {/* Ojo der lila */}
        <circle cx="182" cy="162" r="24" fill="none" stroke="#C090FF" strokeWidth="3.5" opacity=".8" style={{animation:"frailejBrillar 2.3s ease-in-out infinite 0.4s"}}/>
        <circle cx="182" cy="162" r="21" fill="#050E1C"/>
        <circle cx="182" cy="162" r="18" fill="url(#rbEyR)"/>
        <circle cx="182" cy="162" r="9" fill="#7030C0" opacity=".85"/>
        <circle cx="182" cy="162" r="5" fill="#180038"/>
        <path d="M171,152 C174,149 180,149 183,152" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".9"/>
        <circle cx="188" cy="168" r="3" fill="white" opacity=".45"/>
        {/* Mejillas */}
        <circle cx="96" cy="190" r="18" fill="#FF80C8" opacity=".35"/>
        <circle cx="204" cy="190" r="18" fill="#FF80C8" opacity=".35"/>
        {/* Boca */}
        <path d="M134,200 C140,212 160,212 166,200" fill="none" stroke="#20F0E0" strokeWidth="3.5" strokeLinecap="round" opacity=".9"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// BASE FUTURISTA (anillos giratorios)
// ─────────────────────────────────────────
function BaseFlotante({ color }) {
  return (
    <svg width="260" height="70" viewBox="0 0 260 70"
      xmlns="http://www.w3.org/2000/svg"
      style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}}>
      <defs>
        <radialGradient id="bfg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity=".3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="55" rx="105" ry="20" fill="url(#bfg)" style={{animation:"frailejBrillar 2.8s ease-in-out infinite"}}/>
      <ellipse cx="130" cy="46" rx="84" ry="12" fill="#2A1E14" opacity=".88"/>
      <ellipse cx="130" cy="44" rx="84" ry="12" fill="none" stroke={color} strokeWidth="1" opacity=".5"/>
      <ellipse cx="130" cy="45" rx="66" ry="8" fill="none" stroke={color} strokeWidth=".5" opacity=".35"/>
      <line x1="52" y1="45" x2="44" y2="45" stroke={color} strokeWidth="1.5" opacity=".6"/>
      <line x1="208" y1="45" x2="216" y2="45" stroke={color} strokeWidth="1.5" opacity=".6"/>
      <rect x="48" y="42" width="4" height="6" rx="1" fill={color} opacity=".5"/>
      <rect x="208" y="42" width="4" height="6" rx="1" fill={color} opacity=".5"/>
      <g style={{transformOrigin:"130px 45px",animation:"frailejMecerse 5s linear infinite"}}>
        <ellipse cx="130" cy="45" rx="96" ry="15" fill="none" stroke={color} strokeWidth=".8" strokeDasharray="6 8" opacity=".4"/>
        <circle cx="226" cy="45" r="3" fill={color} opacity=".75"/>
      </g>
      <g style={{transformOrigin:"130px 45px",animation:"frailejMecerseR 7s linear infinite"}}>
        <ellipse cx="130" cy="45" rx="68" ry="9" fill="none" stroke={color} strokeWidth=".6" strokeDasharray="3 9" opacity=".3"/>
        <circle cx="62" cy="45" r="2.5" fill={color} opacity=".65"/>
      </g>
      <path d="M46 45 L32 40 L32 50 Z" fill="#3A2A1C" stroke={color} strokeWidth=".8" opacity=".7"/>
      <path d="M214 45 L228 40 L228 50 Z" fill="#3A2A1C" stroke={color} strokeWidth=".8" opacity=".7"/>
    </svg>
  );
}

// ─────────────────────────────────────────
// NUBE DE PENSAMIENTO con frase
// ─────────────────────────────────────────
function NubeFrase({ frase, color }) {
  return (
    <div style={{position:"relative",display:"flex",justifyContent:"center",marginBottom:4}}>
      <div style={{
        background:"white",
        border:`1.5px solid ${color}30`,
        borderRadius:20,
        padding:"10px 16px",
        maxWidth:260,
        position:"relative",
        boxShadow:`0 4px 20px ${color}18`,
      }}>
        <div style={{fontSize:12,color:"#3A2A1C",lineHeight:1.6,textAlign:"center",fontStyle:"italic"}}>
          "{frase}"
        </div>
        {/* Colita de nube apuntando hacia abajo al compañero */}
        <div style={{
          position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",
          width:0,height:0,
          borderLeft:"8px solid transparent",
          borderRight:"8px solid transparent",
          borderTop:`10px solid white`,
          filter:`drop-shadow(0 2px 1px ${color}20)`,
        }}/>
        <div style={{
          position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",
          width:0,height:0,
          borderLeft:"9px solid transparent",
          borderRight:"9px solid transparent",
          borderTop:`11px solid ${color}30`,
          zIndex:-1,
        }}/>
      </div>
      {/* Burbujitas estilo nube de pensamiento */}
      <div style={{position:"absolute",bottom:-18,left:"calc(50% - 6px)",width:8,height:8,borderRadius:"50%",background:"white",border:`1.5px solid ${color}30`}}/>
      <div style={{position:"absolute",bottom:-26,left:"calc(50% - 2px)",width:5,height:5,borderRadius:"50%",background:"white",border:`1.5px solid ${color}30`}}/>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPAÑERO EN HOME (nube + avatar + base)
// ─────────────────────────────────────────
function CompaneroHome({ id }) {
  const data = COMPANEROS[id];
  if (!data) return null;
  const { Componente, color } = data;
  const frase = getFraseHoy();
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 0 0"}}>
      <NubeFrase frase={frase} color={color}/>
      <div style={{position:"relative",display:"flex",justifyContent:"center",alignItems:"flex-end",minHeight:240,width:"100%",marginTop:8}}>
        <BaseFlotante color={color}/>
        <div style={{position:"relative",zIndex:2,marginBottom:16}}>
          <Componente/>
        </div>
      </div>
    </div>
  );
}
function FrailejonAvatar({ mini = false }) {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding: mini ? 0 : "8px 0 0"}}>
      <svg width={mini ? 72 : 220} height={mini ? 85 : 260} viewBox="20 10 280 340" xmlns="http://www.w3.org/2000/svg" style={{animation:"frailejFlotar 4.5s ease-in-out infinite"}}>
        <defs>
          <radialGradient id="frj1" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#E8F5B0"/><stop offset="35%" stopColor="#A8C840"/><stop offset="70%" stopColor="#6A9020"/><stop offset="100%" stopColor="#3A5808"/></radialGradient>
          <radialGradient id="frj2" cx="60%" cy="65%" r="70%"><stop offset="0%" stopColor="#C8E890"/><stop offset="40%" stopColor="#78B030"/><stop offset="80%" stopColor="#408018"/><stop offset="100%" stopColor="#204808"/></radialGradient>
          <radialGradient id="frj3" cx="45%" cy="35%" r="65%"><stop offset="0%" stopColor="#FFF8A0"/><stop offset="40%" stopColor="#F0D020"/><stop offset="75%" stopColor="#C09010"/><stop offset="100%" stopColor="#806008"/></radialGradient>
          <radialGradient id="frj4" cx="50%" cy="40%" r="65%"><stop offset="0%" stopColor="#F8E8B0"/><stop offset="45%" stopColor="#D0A840"/><stop offset="85%" stopColor="#907020"/><stop offset="100%" stopColor="#584008"/></radialGradient>
          <radialGradient id="frjC" cx="38%" cy="32%" r="65%"><stop offset="0%" stopColor="#D0E888"/><stop offset="50%" stopColor="#88B828"/><stop offset="100%" stopColor="#385008"/></radialGradient>
          <radialGradient id="frjO" cx="30%" cy="28%" r="65%"><stop offset="0%" stopColor="#F8F0A0"/><stop offset="50%" stopColor="#D0A820"/><stop offset="100%" stopColor="#806010"/></radialGradient>
          <radialGradient id="frjT" cx="40%" cy="30%" r="65%"><stop offset="0%" stopColor="#C8D880"/><stop offset="55%" stopColor="#789828"/><stop offset="100%" stopColor="#304808"/></radialGradient>
        </defs>
        <ellipse cx="160" cy="200" rx="120" ry="90" fill="#D8E8A0" opacity=".07"/>
        <g style={{transformOrigin:"145px 210px",animation:"frailejónMecerse 3.8s ease-in-out infinite"}}>
          <path d="M145 210 Q95 175 68 140 Q48 112 52 85 Q58 65 78 72 Q100 80 118 118 Q134 152 145 192Z" fill="url(#frj2)" opacity=".88"/>
          <ellipse cx="90" cy="128" rx="20" ry="13" fill="#B0E060" opacity=".3" transform="rotate(-28,90,128)"/>
          <ellipse cx="90" cy="128" rx="10" ry="7" fill="#E0F8A0" opacity=".38" transform="rotate(-28,90,128)"/>
          <path d="M143 200 Q108 160 82 120 Q65 95 60 75" fill="none" stroke="#C0F060" strokeWidth="1.2" opacity=".4"/>
        </g>
        <g style={{transformOrigin:"175px 210px",animation:"frailejMecerseR 3.8s ease-in-out infinite"}}>
          <path d="M175 210 Q225 175 252 140 Q272 112 268 85 Q262 65 242 72 Q220 80 202 118 Q186 152 175 192Z" fill="url(#frj1)" opacity=".88"/>
          <ellipse cx="230" cy="128" rx="20" ry="13" fill="#C8E870" opacity=".3" transform="rotate(28,230,128)"/>
          <path d="M177 200 Q212 160 238 120 Q255 95 260 75" fill="none" stroke="#D0F070" strokeWidth="1.2" opacity=".4"/>
        </g>
        <g style={{transformOrigin:"148px 220px",animation:"frailejónMecerse 3s ease-in-out infinite 0.3s"}}>
          <path d="M148 220 Q108 198 82 182 Q62 170 56 152 Q52 136 68 132 Q88 128 108 152 Q128 176 145 208Z" fill="url(#frj4)" opacity=".9"/>
          <ellipse cx="80" cy="164" rx="16" ry="10" fill="#F0D880" opacity=".35" transform="rotate(-15,80,164)"/>
        </g>
        <g style={{transformOrigin:"172px 220px",animation:"frailejMecerseR 3s ease-in-out infinite 0.3s"}}>
          <path d="M172 220 Q212 198 238 182 Q258 170 264 152 Q268 136 252 132 Q232 128 212 152 Q192 176 175 208Z" fill="url(#frj3)" opacity=".88"/>
          <ellipse cx="240" cy="164" rx="16" ry="10" fill="#F8F090" opacity=".32" transform="rotate(15,240,164)"/>
        </g>
        <g style={{transformOrigin:"150px 235px",animation:"frailejónMecerse 2.5s ease-in-out infinite 0.6s"}}>
          <path d="M150 235 Q122 225 100 230 Q82 235 80 252 Q80 268 98 272 Q122 276 148 255Z" fill="url(#frj2)" opacity=".92"/>
          <ellipse cx="100" cy="250" rx="15" ry="10" fill="#C0F070" opacity=".35" transform="rotate(12,100,250)"/>
        </g>
        <g style={{transformOrigin:"170px 235px",animation:"frailejMecerseR 2.5s ease-in-out infinite 0.6s"}}>
          <path d="M170 235 Q198 225 220 230 Q238 235 240 252 Q240 268 222 272 Q198 276 172 255Z" fill="url(#frj1)" opacity=".92"/>
        </g>
        <g style={{transformOrigin:"160px 190px",animation:"frailejónMecerse 2s ease-in-out infinite 0.1s"}}>
          <path d="M160 190 Q138 168 126 145 Q118 128 126 115 Q134 104 148 114 Q158 124 162 148Z" fill="url(#frj3)" opacity=".85"/>
        </g>
        <g style={{transformOrigin:"160px 190px",animation:"frailejMecerseR 2s ease-in-out infinite 0.1s"}}>
          <path d="M160 190 Q182 168 194 145 Q202 128 194 115 Q186 104 172 114 Q162 124 158 148Z" fill="url(#frj4)" opacity=".85"/>
        </g>
        <g style={{transformOrigin:"160px 185px",animation:"frailejMecerseSlow 2.8s ease-in-out infinite 0.4s"}}>
          <path d="M155 185 Q148 158 150 132 Q152 112 160 100 Q168 112 170 132 Q172 158 165 185Z" fill="url(#frj3)" opacity=".9"/>
        </g>
        <circle cx="45" cy="160" r="4" fill="#D0F070" opacity=".5" style={{animation:"frailejDrift 3.5s ease-in-out infinite"}}/>
        <circle cx="38" cy="188" r="3" fill="#F0E080" opacity=".45" style={{animation:"frailejDrift 4s ease-in-out infinite 0.8s"}}/>
        <circle cx="272" cy="155" r="4" fill="#C8F060" opacity=".5" style={{animation:"frailejDrift 3.2s ease-in-out infinite 1s"}}/>
        <circle cx="278" cy="182" r="3" fill="#F0D880" opacity=".45" style={{animation:"frailejDrift 3.8s ease-in-out infinite 0.5s"}}/>
        <circle cx="60" cy="230" r="2.5" fill="#E8F8A0" opacity=".4" style={{animation:"frailejDrift 4.2s ease-in-out infinite 1.3s"}}/>
        <circle cx="260" cy="225" r="2.5" fill="#F8F0A0" opacity=".4" style={{animation:"frailejDrift 3.6s ease-in-out infinite 0.3s"}}/>
        <ellipse cx="160" cy="295" rx="14" ry="36" fill="url(#frjT)"/>
        <ellipse cx="160" cy="295" rx="9" ry="28" fill="#90B830" opacity=".6"/>
        <ellipse cx="160" cy="278" rx="9" ry="6" fill="#B8D850" opacity=".5"/>
        <ellipse cx="160" cy="292" rx="10" ry="7" fill="#A8C840" opacity=".45"/>
        <ellipse cx="160" cy="308" rx="8" ry="6" fill="#90A830" opacity=".4"/>
        <ellipse cx="160" cy="288" rx="4" ry="5" fill="#E8F890" opacity=".4" style={{animation:"frailejBrillar 2.2s ease-in-out infinite"}}/>
        <ellipse cx="160" cy="332" rx="60" ry="9" fill="#88A020" opacity=".12"/>
        <path d="M152 198 Q138 178 130 158" fill="none" stroke="#90A830" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="128" cy="153" r="10" fill="#506010"/>
        <circle cx="128" cy="153" r="8" fill="#98C030"/>
        <circle cx="128" cy="153" r="5.5" fill="#D8F070"/>
        <circle cx="128" cy="153" r="3" fill="#F8FFB0"/>
        <circle cx="125" cy="149" r="2" fill="white" opacity=".85"/>
        <circle cx="128" cy="153" r="12" fill="none" stroke="#B8D840" strokeWidth="1" opacity=".35" style={{animation:"frailejBrillar 2s ease-in-out infinite"}}/>
        <path d="M168 198 Q182 178 190 158" fill="none" stroke="#90A830" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="192" cy="153" r="10" fill="#506010"/>
        <circle cx="192" cy="153" r="8" fill="#98C030"/>
        <circle cx="192" cy="153" r="5.5" fill="#D8F070"/>
        <circle cx="192" cy="153" r="3" fill="#F8FFB0"/>
        <circle cx="189" cy="149" r="2" fill="white" opacity=".85"/>
        <circle cx="192" cy="153" r="12" fill="none" stroke="#B8D840" strokeWidth="1" opacity=".35" style={{animation:"frailejBrillar 2s ease-in-out infinite 0.6s"}}/>
        <ellipse cx="160" cy="222" rx="44" ry="40" fill="#304808"/>
        <ellipse cx="160" cy="220" rx="40" ry="37" fill="url(#frjC)"/>
        <ellipse cx="144" cy="208" rx="18" ry="13" fill="white" opacity=".1" transform="rotate(-12,144,208)"/>
        <ellipse cx="120" cy="218" rx="14" ry="8" fill="#D8F080" opacity=".3"/>
        <ellipse cx="200" cy="218" rx="14" ry="8" fill="#D8F080" opacity=".3"/>
        <ellipse cx="135" cy="228" rx="13" ry="8" fill="#F0D840" opacity=".35"/>
        <ellipse cx="185" cy="228" rx="13" ry="8" fill="#F0D840" opacity=".35"/>
        <ellipse cx="135" cy="228" rx="8" ry="5" fill="#FFF090" opacity=".25"/>
        <ellipse cx="185" cy="228" rx="8" ry="5" fill="#FFF090" opacity=".25"/>
        <ellipse cx="144" cy="218" rx="17" ry="17" fill="#181E04"/>
        <ellipse cx="176" cy="218" rx="17" ry="17" fill="#181E04"/>
        <ellipse cx="144" cy="218" rx="15" ry="15" fill="white"/>
        <ellipse cx="176" cy="218" rx="15" ry="15" fill="white"/>
        <ellipse cx="144" cy="219" rx="11" ry="11" fill="url(#frjO)"/>
        <ellipse cx="176" cy="219" rx="11" ry="11" fill="url(#frjO)"/>
        <ellipse cx="144" cy="219" rx="6.5" ry="6.5" fill="#C09018"/>
        <ellipse cx="176" cy="219" rx="6.5" ry="6.5" fill="#C09018"/>
        <ellipse cx="144" cy="219" rx="3.5" ry="3.5" fill="#181004"/>
        <ellipse cx="176" cy="219" rx="3.5" ry="3.5" fill="#181004"/>
        <ellipse cx="138" cy="211" rx="5.5" ry="4.5" fill="white" opacity=".92"/>
        <ellipse cx="170" cy="211" rx="5.5" ry="4.5" fill="white" opacity=".92"/>
        <circle cx="149" cy="224" r="3" fill="white" opacity=".5"/>
        <circle cx="181" cy="224" r="3" fill="white" opacity=".5"/>
        <ellipse cx="160" cy="228" rx="4" ry="2.5" fill="#2A3A04"/>
        <path d="M149 235 Q160 244 171 235" fill="none" stroke="#486010" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
export default function NOOS() {
  const [screen, setScreen] = useState("login");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formNombre, setFormNombre] = useState("");
const [formEmail, setFormEmail] = useState("");
const [formPin, setFormPin] = useState("");
const [formTel, setFormTel] = useState("");
const [formFecha, setFormFecha] = useState("");
const [formRol, setFormRol] = useState("paciente");
const [formLoading, setFormLoading] = useState(false);
const [formPsicologoId, setFormPsicologoId] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
const [usuarioActual, setUsuarioActual] = useState(null);
  const [regNombre, setRegNombre] = useState("");
const [regEmail, setRegEmail] = useState("");
const [regPin, setRegPin] = useState("");
const [regRol, setRegRol] = useState("paciente");
  const [noteTab, setNoteTab] = useState("insights");
  const [avatar, setAvatar] = useState("🦋");
  const [modal, setModal] = useState(null);
  const [mood, setMood] = useState(2);
  const [tareas, setTareas] = useState([false, false]);
  const [xp, setXp] = useState(0);
  const [xpCargado, setXpCargado] = useState(false);
  const [citaStatus, setCitaStatus] = useState("pending");
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [citaFecha, setCitaFecha] = useState("");
  const [citaHora, setCitaHora] = useState("");
  const [citaModalidad, setCitaModalidad] = useState("presencial");
  const [citaLink, setCitaLink] = useState("");
  const [citaNotas, setCitaNotas] = useState("");
  const [citaPacienteId, setCitaPacienteId] = useState("");
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [notifTitulo, setNotifTitulo] = useState("");
const [notifMensaje, setNotifMensaje] = useState("");
const [notifFecha, setNotifFecha] = useState("");
const [notifHora, setNotifHora] = useState("");
const [notifIntervalos, setNotifIntervalos] = useState([]);
const [loadingNotif, setLoadingNotif] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [resenaRating, setResenaRating] = useState(0);
  const [resenaTexto, setResenaTexto] = useState("");
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [adminCitaStatus, setAdminCitaStatus] = useState("pending");
  const [toast, setToast] = useState(null);
  const [pinValue, setPinValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [insights, setInsights] = useState([]);
const [insightText, setInsightText] = useState("");
const [insightTitle, setInsightTitle] = useState("");
const [insightMood, setInsightMood] = useState(null);
const [insightShared, setInsightShared] = useState(false);
const [tareasTab, setTareasTab] = useState("autorregistros");
const [autorregistros, setAutorregistros] = useState([]);
const [arFecha, setArFecha] = useState("");
const [arHaciendo, setArHaciendo] = useState("");
const [arSucedio, setArSucedio] = useState("");
const [arDespues, setArDespues] = useState("");
const [editNombre, setEditNombre] = useState("");
const [pinAnterior, setPinAnterior] = useState("");
const [pinNuevo, setPinNuevo] = useState("");
const [pinNuevo2, setPinNuevo2] = useState("");
const [editTel, setEditTel] = useState("");
const [psicologoData, setPsicologoData] = useState(null);
const [editFoto, setEditFoto] = useState("");
const [editEspecialidad, setEditEspecialidad] = useState("");
const [editExperiencia, setEditExperiencia] = useState("");
const [editEnfoque, setEditEnfoque] = useState("");
const [darkMode, setDarkMode] = useState(() => {
  try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
});
const [installPrompt, setInstallPrompt] = useState(null);
const [showInstall, setShowInstall] = useState(false);

useEffect(() => {
  const handler = (e) => {
    e.preventDefault();
    setInstallPrompt(e);
    setShowInstall(true);
  };
  window.addEventListener("beforeinstallprompt", handler);
  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);

const handleInstall = async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;
  if (outcome === "accepted") setShowInstall(false);
  setInstallPrompt(null);
};
  const [navOpen, setNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}));
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, icon:"📅", title:"Cita mañana", msg:"Recuerda tu sesión con Dr. García mañana a las 10:00 AM", time:"Hace 1h", read:false },
    { id:2, icon:"🎯", title:"Nueva tarea asignada", msg:"Dr. García te asignó: Registro de pensamientos automáticos", time:"Hace 3h", read:false },
    { id:3, icon:"✨", title:"Frase de la semana", msg:'"El coraje no es la ausencia de miedo..." — Dr. García', time:"Hace 1 día", read:true },
    { id:4, icon:"🔥", title:"¡Racha de 5 días!", msg:"Llevas 5 días seguidos registrando. +100 XP bonus", time:"Hace 2 días", read:true },
  ]);
  const [recordatorios, setRecordatorios] = useState([]);
const [recTitulo, setRecTitulo] = useState("");
const [recMensaje, setRecMensaje] = useState("");
const [recHora, setRecHora] = useState("");
const [recDias, setRecDias] = useState([]);
const [loadingRec, setLoadingRec] = useState(false);
const [tareasPsicologo, setTareasPsicologo] = useState([]);
const [tareaTitulo, setTareaTitulo] = useState("");
const [tareaDescripcion, setTareaDescripcion] = useState("");
const [tareaXP, setTareaXP] = useState(80);
const [tareaVence, setTareaVence] = useState("");
const [tareaSinFecha, setTareaSinFecha] = useState(false);
const [recursos, setRecursos] = useState([]);
const [recursoNombre, setRecursoNombre] = useState("");
const [recursoUrl, setRecursoUrl] = useState("");
const [recursoTipo, setRecursoTipo] = useState("PDF");
const [loadingRecurso, setLoadingRecurso] = useState(false);
const [subiendoArchivo, setSubiendoArchivo] = useState(false);
const [progresoSubida, setProgresoSubida] = useState(0);
const [loadingTarea, setLoadingTarea] = useState(false);
const [recordatorioEditando, setRecordatorioEditando] = useState(null);
const [recursoAEliminar, setRecursoAEliminar] = useState(null);
const [notaClinicaTexto, setNotaClinicaTexto] = useState("");
const [notaClinicaTitulo, setNotaClinicaTitulo] = useState("");
const [loadingNotaClin, setLoadingNotaClin] = useState(false);
const [notasClinicas, setNotasClinicas] = useState([]);
const [respuestaTarea, setRespuestaTarea] = useState("");
const [tareaRespondiendo, setTareaRespondiendo] = useState(null);
const [fraseDelMes, setFraseDelMes] = useState("");
const [companero, setCompanero] = useState(null);
const [companeroSeleccionando, setCompaneroSeleccionando] = useState(null);
const [loadingFrase, setLoadingFrase] = useState(false);
const [checkInMood, setCheckInMood] = useState(null);
const [mostrarCheckIn, setMostrarCheckIn] = useState(false);
const [registrosAnimo, setRegistrosAnimo] = useState([]);
const [pullRefreshing, setPullRefreshing] = useState(false);
const [pullStartY, setPullStartY] = useState(null);
const [celebrando, setCelebrando] = useState(false);
const confettiItems = Array.from({length:20}, (_,i) => ({
  id:i, x:Math.random()*100, color:["#5C4D6E","#7DAA92","#E8A87C","#F0C040","#E57373"][Math.floor(Math.random()*5)],
  delay:Math.random()*0.5, size:Math.random()*8+4
}));

  const unread = notifs.filter(n => !n.read).length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailValue, pinValue + "**");
    const uid = userCredential.user.uid;
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const rol = docSnap.data().rol;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updateDoc(doc(db, "usuarios", uid), { timezone });
      if (rol === "paciente") {
         setUsuarioActual({ uid, ...docSnap.data() });
        cargarCitas(uid, "paciente");
          cargarRecursosPaciente(uid);
          cargarNotas(uid);
          cargarAutorregistros(uid);
          cargarTareasFirestore(uid);
          setTimeout(() => verificarCheckInHoy(), 800);
          if (docSnap.data().psicologoId) {
            getDoc(doc(db, "usuarios", docSnap.data().psicologoId)).then(snap => {
              if (snap.exists()) {
                const d = snap.data();
                const mesActual = new Date().toISOString().slice(0,7);
                if (d.fraseDelMesFecha === mesActual && d.fraseDelMes) {
                  setFraseDelMes(d.fraseDelMes);
                  setPsicologoData({ id: snap.id, ...d });
                }
              }
            });
          }
          setCompanero(docSnap.data().companero || null);
          if (!docSnap.data().companero) {
            showScreen("elegir-companero");
          } else {
            showScreen("home");
          }
      } else if (rol === "psicologo") {
        setUsuarioActual({ uid, ...docSnap.data() });
        cargarCitas(uid, "psicologo");
        cargarRecordatorios(uid);
        cargarResenas(uid);
        const pacientesSnap = await getDocs(query(collection(db, "usuarios"), where("psicologoId", "==", uid)));
        const listaPacientes = pacientesSnap.docs
          .filter(d => d.data().rol === "paciente")
          .map(d => ({ id: d.id, ...d.data() }));
        setPacientes(listaPacientes);
        showScreen("admin-perfil");
      } else if (rol === "administrador") {
        showScreen("admin-home");
      } else {
        showToast("Rol no reconocido ❌");
      }
    } else {
      showToast("Usuario no encontrado en base de datos ❌");
    }
  } catch (error) {
    showToast("Correo o PIN incorrecto ❌");
  }
};
const handleRegister = async () => {
  if (!regNombre || !regEmail || regPin.length < 4) {
    showToast("Completa todos los campos ❌");
    return;
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPin + "**");
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "usuarios", uid), {
      nombre: regNombre,
      email: regEmail,
      rol: regRol,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    showToast("¡Registro exitoso! ✅");
    showScreen("login");
  } catch (error) {
    showToast("Error al registrarse ❌");
  }
};
const cargarCitas = async (uid, rol) => {
  setLoadingCitas(true);
  try {
    const campo = rol === "paciente" ? "pacienteId" : "psicologoId";
    const q = query(collection(db, "citas"), where(campo, "==", uid));
    const snap = await getDocs(q);
    const filtradas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCitas(filtradas.sort((a,b) => new Date(a.fecha) - new Date(b.fecha)));
  } catch(e) { showToast("Error al cargar citas ❌"); }
  setLoadingCitas(false);
};
const crearCita = async () => {
  if (!citaFecha || !citaHora || !citaPacienteId) {
    showToast("Completa fecha, hora y paciente ❌"); return;
  }
  setLoadingCitas(true);
  try {
    const id = Date.now().toString();
    const paciente = pacientes.find(p => p.id === citaPacienteId);
    const nuevaCita = {
      id,
      psicologoId: usuarioActual.uid,
      psicologoNombre: usuarioActual.nombre,
      pacienteId: citaPacienteId,
      pacienteNombre: paciente?.nombre || "",
      fecha: citaFecha,
      hora: citaHora,
      modalidad: citaModalidad,
      link: citaLink,
      notas: citaNotas,
      status: "pendiente",
      creadaEn: new Date().toISOString(),
    };
    await setDoc(doc(db, "citas", id), nuevaCita);
    setCitas(prev => [...prev, nuevaCita].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)));
    showToast("¡Cita creada! El paciente fue notificado ✅");
    showNotif("Nueva cita agendada", `${paciente?.nombre} — ${citaFecha} a las ${citaHora}`, "📅");
    setCitaFecha(""); setCitaHora(""); setCitaLink(""); setCitaNotas("");
    setCitaModalidad("presencial"); setCitaPacienteId("");
    setModal(null);
  } catch(e) { showToast("Error al crear cita ❌"); }
  setLoadingCitas(false);
};
const actualizarStatusCita = async (citaId, nuevoStatus) => {
  try {
    await updateDoc(doc(db, "citas", citaId), { status: nuevoStatus });
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, status: nuevoStatus } : c));
    if (nuevoStatus === "confirmada") showNotif("Cita confirmada ✅", "Tu psicólogo fue notificado", "✅");
    if (nuevoStatus === "cancelada") showNotif("Cita cancelada", "Tu psicólogo fue notificado", "❌");
    setModal(null);
  } catch(e) { showToast("Error al actualizar cita ❌"); }
};
const activarNotificaciones = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      
      });
      if (token) {
        await updateDoc(doc(db, "usuarios", usuarioActual.uid), { fcmToken: token });
        setUsuarioActual(prev => ({ ...prev, fcmToken: token }));
        showToast("✅ Notificaciones activadas");
      }
    } else {
      showToast("❌ Permiso denegado — actívalas desde la configuración del navegador");
    }
  } catch(e) {
    console.log("Error FCM completo:", e.code, e.message, e);
    showToast("❌ " + e.message);
  }
};
const programarNotificacion = async () => {
  
  if (!notifTitulo || !notifMensaje || !notifFecha || !notifHora) {
    showToast("Completa todos los campos ❌"); return;
  }
  setLoadingNotif(true);
  try {
    const pacienteDoc = await getDoc(doc(db, "usuarios", pacienteSeleccionado.id));
    const fcmToken = pacienteDoc.data()?.fcmToken;
    if (!fcmToken) {
      showToast("El paciente no tiene notificaciones activadas ❌");
      setLoadingNotif(false); return;
    }
    const scheduledAt = new Date(`${notifFecha}T${notifHora}:00`).toISOString();
    await fetch('/api/schedule-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteId: pacienteSeleccionado.id,
        token: fcmToken,
        title: notifTitulo,
        body: notifMensaje,
        scheduledAt,
        intervals: notifIntervalos
      })
    });
    showToast(`✅ Notificación programada para ${notifFecha} a las ${notifHora}`);
    setNotifTitulo(""); setNotifMensaje("");
    setNotifFecha(""); setNotifHora("");
    setNotifIntervalos([]);
    setModal(null);
  } catch(e) { showToast("Error al programar ❌"); }
  setLoadingNotif(false);
};
const cargarRecordatorios = async (psicologoId) => {
  try {
    const q = query(collection(db, "recordatorios"), where("psicologoId", "==", psicologoId));
    const snap = await getDocs(q);
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setRecordatorios(lista);
  } catch(e) { showToast("Error al cargar recordatorios ❌"); }
};

const crearRecordatorio = async () => {
  console.log("pacienteSeleccionado:", pacienteSeleccionado);
  if (!recTitulo || !recMensaje || !recHora || recDias.length === 0 || !pacienteSeleccionado) {
    showToast("Completa todos los campos ❌"); return;
  }
  setLoadingRec(true);
  try {
    const pacienteDoc = await getDoc(doc(db, "usuarios", pacienteSeleccionado.id));
    const pacienteTimezone = pacienteDoc.data()?.timezone || "America/Bogota";
    const id = Date.now().toString();
    const nuevoRec = {
      psicologoId: usuarioActual.uid,
      pacienteId: pacienteSeleccionado.id,
      pacienteNombre: pacienteSeleccionado.nombre,
      titulo: recTitulo,
      mensaje: recMensaje,
      hora: recHora,
      diasSemana: recDias,
      activo: true,
      creadoEn: new Date().toISOString(),
      pacienteTimezone,
    };
    await setDoc(doc(db, "recordatorios", id), nuevoRec);
    setRecordatorios(prev => [...prev, { id, ...nuevoRec }]);
    showToast("✅ Recordatorio creado");
    setRecTitulo(""); setRecMensaje(""); setRecHora(""); setRecDias([]);
    setModal(null);
  } catch(e) { showToast("❌ " + e.message); console.log("Error completo:", e); }
  setLoadingRec(false);
};
const cargarNotas = async (pacienteId) => {
  try {
    const q = query(collection(db, "notas"), where("pacienteId", "==", pacienteId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setInsights(lista);
  } catch(e) { console.log("Error notas:", e); }
};

const cargarAutorregistros = async (pacienteId) => {
  try {
    const q = query(collection(db, "autorregistros"), where("pacienteId", "==", pacienteId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setAutorregistros(lista);
  } catch(e) { console.log("Error autorregistros:", e); }
};
const cargarRecursosPaciente = async (pacienteId) => {
  try {
    const q = query(collection(db, "recursos"), where("pacienteId", "==", pacienteId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadoEn) - new Date(a.creadoEn));
    setRecursos(lista);
  } catch(e) { console.log("Error recursos:", e); }
};

const cargarRecursosPsicologo = async (pacienteId, psicologoId) => {
  try {
    const q = query(collection(db, "recursos"), where("pacienteId", "==", pacienteId), where("psicologoId", "==", psicologoId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadoEn) - new Date(a.creadoEn));
    setRecursos(lista);
  } catch(e) { console.log("Error recursos psicologo:", e); }
};
const subirArchivoCloudinary = async (archivo) => {
  setSubiendoArchivo(true);
  setProgresoSubida(0);
  try {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "mipsicologo");
    formData.append("cloud_name", "dh0wutypb");
    const res = await fetch(`https://api.cloudinary.com/v1_1/dh0wutypb/raw/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      let url = data.secure_url;      
      setRecursoUrl(url);
      const ext = archivo.name.split(".").pop().toUpperCase();
      setRecursoTipo(
        ext === "PDF" ? "PDF" :
        ["JPG","JPEG","PNG","WEBP"].includes(ext) ? "Imagen" : "Otro"
      );
      if (!recursoNombre) setRecursoNombre(archivo.name.replace(/\.[^/.]+$/, ""));
      showToast("✅ Archivo subido correctamente");
    } else {
      showToast("Error al subir archivo ❌");
    }
  } catch(e) {
    showToast("Error de conexión ❌");
  }
  setSubiendoArchivo(false);
};
const enviarRecurso = async () => {
  if (!recursoNombre.trim()) { showToast("Escribe el nombre del material ❌"); return; }
  if (!recursoUrl.trim()) { showToast("Primero sube un archivo ❌"); return; }
  if (!pacienteSeleccionado) return;
  setLoadingRecurso(true);
  try {
    const id = Date.now().toString();
    const nuevoRecurso = {
      id,
      psicologoId: usuarioActual.uid,
      psicologoNombre: usuarioActual.nombre,
      pacienteId: pacienteSeleccionado.id,
      pacienteNombre: pacienteSeleccionado.nombre,
      nombre: recursoNombre,
      url: recursoUrl,
      tipo: recursoTipo,
      recibido: false,
      creadoEn: new Date().toISOString(),
    };
    await setDoc(doc(db, "recursos", id), nuevoRecurso);
    setRecursos(prev => [nuevoRecurso, ...prev]);
    setRecursoNombre("");
    setRecursoUrl("");
    setRecursoTipo("PDF");
    setModal(null);
    showToast("✅ Material enviado a " + pacienteSeleccionado.nombre);
  } catch(e) { showToast("Error al enviar material ❌"); }
  setLoadingRecurso(false);
};

const marcarRecursoRecibido = async (recursoId) => {
  try {
    await updateDoc(doc(db, "recursos", recursoId), { recibido: true });
    setRecursos(prev => prev.map(r => r.id === recursoId ? { ...r, recibido: true } : r));
    showToast("✅ Marcado como recibido");
  } catch(e) { showToast("Error ❌"); }
};
const cargarTareasPaciente = async (pacienteId) => {
  try {
    const q = query(collection(db, "tareas"), where("pacienteId", "==", pacienteId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setTareasPsicologo(lista);
  } catch(e) { showToast("Error al cargar tareas ❌"); }
};
const guardarAnimo = async (valor) => {
  if (!usuarioActual?.uid) return;
  const hoy = new Date().toISOString().split('T')[0];
  const id = `${usuarioActual.uid}_${hoy}`;
  const psicologoId = usuarioActual.psicologoId || psicologoData?.id || "";
  const registro = {
    id, pacienteId: usuarioActual.uid,
    psicologoId,
    valor, fecha: hoy,
    creadoEn: new Date().toISOString(),
    emoji: ["😞","😕","😐","🙂","😄"][valor],
    label: ["Mal","Regular","Neutro","Bien","Genial"][valor],
  };
  try {
    await setDoc(doc(db, "registrosAnimo", id), registro);
  } catch(e) { console.log("Error guardando ánimo:", e); }
};

const verificarCheckInHoy = () => {
  const hoy = new Date().toISOString().split('T')[0];
  const yaRegistro = localStorage.getItem(`checkin_${usuarioActual?.uid}_${hoy}`);
  if (!yaRegistro) setMostrarCheckIn(true);
};

const completarCheckIn = async (valor) => {
  const hoy = new Date().toISOString().split('T')[0];
  setCheckInMood(valor);
  await guardarAnimo(valor);
  localStorage.setItem(`checkin_${usuarioActual?.uid}_${hoy}`, '1');
  setTimeout(() => setMostrarCheckIn(false), 600);
};

const cargarRegistrosAnimo = async (pacienteId) => {
  try {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    const q = query(
      collection(db, "registrosAnimo"),
      where("pacienteId", "==", pacienteId),
    );
    const snap = await getDocs(q);
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    setRegistrosAnimo(lista);
  } catch(e) { console.log("Error cargando ánimo:", e); }
};
const cargarNotasClinicas = async (pacienteId) => {
  try {
    const q = query(collection(db, "notasClinicas"), where("pacienteId", "==", pacienteId), where("psicologoId", "==", usuarioActual.uid));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setNotasClinicas(lista);
  } catch(e) { console.log("Error notas clínicas:", e); }
};
const cargarTareasFirestore = async (pacienteId) => {
  try {
    const q = query(collection(db, "tareas"), where("pacienteId", "==", pacienteId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setTareasPsicologo(lista);
  } catch(e) { console.log("Error tareas paciente:", e); }
};
const cargarTareasPsicologo = async (pacienteId, psicologoId) => {
  try {
    const q = query(collection(db, "tareas"), where("pacienteId", "==", pacienteId), where("psicologoId", "==", psicologoId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setTareasPsicologo(lista);
  } catch(e) { showToast("Error al cargar tareas ❌"); }
};

const crearTarea = async () => {
  if (!tareaTitulo.trim()) { showToast("Escribe un título ❌"); return; }
  if (!pacienteSeleccionado) { showToast("No hay paciente seleccionado ❌"); return; }
  setLoadingTarea(true);
  try {
    const id = Date.now().toString();
    const nuevaTarea = {
      id,
      psicologoId: usuarioActual.uid,
      psicologoNombre: usuarioActual.nombre,
      pacienteId: pacienteSeleccionado.id,
      pacienteNombre: pacienteSeleccionado.nombre,
      titulo: tareaTitulo,
      descripcion: tareaDescripcion,
      xp: tareaXP,
      vence: tareaVence,
      completada: false,
      respuesta: "",
      creadaEn: new Date().toISOString(),
    };
    await setDoc(doc(db, "tareas", id), nuevaTarea);
    setTareasPsicologo(prev => [nuevaTarea, ...prev]);
    setTareaTitulo("");
    setTareaDescripcion("");
    setTareaXP(80);
    setTareaVence("");
    setTareaSinFecha(false);
    setModal(null);
    showToast("✅ Tarea asignada a " + pacienteSeleccionado.nombre);
  } catch(e) { showToast("Error al crear tarea ❌"); }
  setLoadingTarea(false);
};

const eliminarRecordatorio = async (recId) => {
  try {
    await deleteDoc(doc(db, "recordatorios", recId));
    setRecordatorios(prev => prev.filter(r => r.id !== recId));
    showToast("🗑️ Recordatorio eliminado");
  } catch(e) { showToast("Error al eliminar ❌"); }
};

const toggleRecordatorio = async (recId, estadoActual) => {
  try {
    await updateDoc(doc(db, "recordatorios", recId), { activo: !estadoActual });
    setRecordatorios(prev => prev.map(r => r.id === recId ? { ...r, activo: !estadoActual } : r));
    showToast(!estadoActual ? "✅ Recordatorio activado" : "⏸️ Recordatorio pausado");
  } catch(e) { showToast("Error ❌"); }
};
const cargarResenas = async (psicologoId) => {
  setLoadingResenas(true);
  try {
    const q = query(collection(db, "resenas"), where("psicologoId", "==", psicologoId));
    const snap = await getDocs(q);
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    setResenas(lista);
  } catch(e) { showToast("Error al cargar reseñas ❌"); }
  setLoadingResenas(false);
};

const enviarResena = async () => {
  if (resenaRating === 0) { showToast("Selecciona una calificación ⭐"); return; }
  if (!resenaTexto.trim()) { showToast("Escribe tu reseña ❌"); return; }
  if (!usuarioActual?.psicologoId) { showToast("No tienes psicólogo asignado ❌"); return; }
  setLoadingResenas(true);
  try {
    const id = Date.now().toString();
    await setDoc(doc(db, "resenas", id), {
      psicologoId: usuarioActual.psicologoId,
      rating: resenaRating,
      texto: resenaTexto,
      fecha: new Date().toISOString(),
      anonimo: true,
    });
    showToast("¡Reseña enviada! ✅");
    setResenaRating(0);
    setResenaTexto("");
    setModal(null);
    cargarResenas(usuarioActual.psicologoId);
  } catch(e) { showToast("Error al enviar reseña ❌"); }
  setLoadingResenas(false);
};
const cargarTodosUsuarios = async () => {
  setLoadingUsuarios(true);
  try {
    const snap = await getDocs(collection(db, "usuarios"));
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setTodosUsuarios(lista);
  } catch (error) {
    showToast("Error al cargar usuarios ❌");
  }
  setLoadingUsuarios(false);
};
const handleEliminarUsuarios = async () => {
  if (usuariosSeleccionados.length === 0) {
    showToast("Selecciona al menos un usuario ❌");
    return;
  }
  setLoadingUsuarios(true);
  try {
    for (const uid of usuariosSeleccionados) {
      await deleteDoc(doc(db, "usuarios", uid));
    }
    showToast(`${usuariosSeleccionados.length} usuario(s) eliminado(s) ✅`);
    setUsuariosSeleccionados([]);
    await cargarTodosUsuarios();
  } catch (error) {
    showToast("Error al eliminar ❌");
  }
  setLoadingUsuarios(false);
};
const handleToggleInactivo = async (uid, estadoActual) => {
  try {
    await updateDoc(doc(db, "usuarios", uid), {
      inactivo: !estadoActual
    });
    showToast(!estadoActual ? "Usuario desactivado 🔒" : "Usuario activado ✅");
    await cargarTodosUsuarios();
  } catch (error) {
    showToast("Error al actualizar ❌");
  }
};
const toggleSeleccion = (uid) => {
  setUsuariosSeleccionados(prev =>
    prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
  );
};
  const handleCrearUsuarioAdmin = async () => {
  if (!formNombre || !formEmail || !formTel || !formFecha || formPin.length < 4) {
    showToast("Completa todos los campos ❌");
    return;
  }
  setFormLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formEmail, formPin + "**");
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "usuarios", uid), {
      nombre: formNombre,
      email: formEmail,
      telefono: formTel,
      fechaNacimiento: formFecha,
      rol: formRol,
      creadoPor: "admin",
      fechaCreacion: new Date().toISOString(),
      psicologoId: formRol === "paciente" ? formPsicologoId : "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    showToast("¡Usuario creado exitosamente! ✅");
    setFormNombre(""); setFormEmail(""); setFormPin("");
    setFormTel(""); setFormFecha(""); setFormRol("paciente"); setFormPsicologoId("");
    setModal(null);
  } catch (error) {
    showToast("Error al crear usuario ❌");
  }
  setFormLoading(false);
};
const RANGOS = [
  { min:0,   max:49,  nombre:"Primigenio",    icono:"🪨" },
  { min:50,  max:99,  nombre:"Habilis",        icono:"🖐️" },
  { min:100, max:149, nombre:"Erectus",        icono:"🔥" },
  { min:150, max:199, nombre:"Sapiens",        icono:"👁️" },
  { min:200, max:Infinity, nombre:"Sapiens Sapiens", icono:"💎" },
];
const getRango = (puntos) => RANGOS.find(r => puntos >= r.min && puntos <= r.max) || RANGOS[0];
const sumarXP = async (puntos, motivo) => {
  if (!usuarioActual?.uid) return;
  const nuevoXp = xp + puntos;
  setXp(nuevoXp);
  try {
    await updateDoc(doc(db, "usuarios", usuarioActual.uid), { xp: nuevoXp });
    const rangoActual = getRango(xp);
    const rangoNuevo = getRango(nuevoXp);
    if (rangoNuevo.nombre !== rangoActual.nombre) {
      showNotif(`¡Subiste a ${rangoNuevo.nombre}! ${rangoNuevo.icono}`, `Nuevo rango desbloqueado`, "🎉");
    } else {
      showNotif(`+${puntos} XP`, motivo, "⭐");
    }
  } catch(e) {}
};
useEffect(() => {
  const unsub = auth.onAuthStateChanged(async (user) => {
    if (user) {
      const docSnap = await getDoc(doc(db, "usuarios", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsuarioActual({ uid: user.uid, ...data });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await updateDoc(doc(db, "usuarios", user.uid), { timezone });
        if (data.rol === "paciente") {
          cargarCitas(user.uid, "paciente");
          cargarRecursosPaciente(user.uid);
          cargarNotas(user.uid);
          cargarAutorregistros(user.uid);
          cargarTareasFirestore(user.uid);
          setTimeout(() => verificarCheckInHoy(), 800);
          if (data.psicologoId) {
            getDoc(doc(db, "usuarios", data.psicologoId)).then(snap => {
              if (snap.exists()) {
                const d = snap.data();
                const mesActual = new Date().toISOString().slice(0,7);
                if (d.fraseDelMesFecha === mesActual && d.fraseDelMes) {
                  setFraseDelMes(d.fraseDelMes);
                  setPsicologoData({ id: snap.id, ...d });
                }
              }
            });
          }
          setCompanero(data.companero || null);
          if (!data.companero) {
            showScreen("elegir-companero");
          } else {
            showScreen("home");
          }
        } else if (data.rol === "psicologo") {
          cargarCitas(user.uid, "psicologo");
          cargarRecordatorios(user.uid);
          cargarResenas(user.uid);
          const pacientesSnap = await getDocs(query(collection(db, "usuarios"), where("psicologoId", "==", user.uid)));
        const listaPacientes = pacientesSnap.docs
          .filter(d => d.data().rol === "paciente")
          .map(d => ({ id: d.id, ...d.data() }));
        setPacientes(listaPacientes);
        showScreen("admin-perfil");
        } else if (data.rol === "administrador") {
          showScreen("admin-home");
        }
      }
    }
    setCheckingAuth(false); // ← va aquí, siempre se ejecuta
  });
  return () => unsub();
}, []);
useEffect(() => {
  if (screen === "perfil-psicologo" && usuarioActual?.psicologoId && !psicologoData) {
    getDoc(doc(db, "usuarios", usuarioActual.psicologoId)).then(snap => {
      if (snap.exists()) setPsicologoData({ id: snap.id, ...snap.data() });
    });
    cargarResenas(usuarioActual.psicologoId);
  }
}, [screen]);
useEffect(() => {
  if (usuarioActual?.uid && !xpCargado) {
    getDoc(doc(db, "usuarios", usuarioActual.uid)).then(snap => {
      if (snap.exists()) {
        setXp(snap.data().xp || 0);
        setXpCargado(true);
      }
    });
  }
}, [usuarioActual]);
useEffect(() => {
  if (usuarioActual?.uid) {
    Notification.requestPermission().then(async permission => {
      if (permission === "granted") {
        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          if (token) {
            await updateDoc(doc(db, "usuarios", usuarioActual.uid), { fcmToken: token });
          }
        } catch(e) { console.log("Error FCM:", e); }
      }
    });

    const unsub = onMessage(messaging, payload => {
      const { title, body } = payload.notification || {};
      showNotif(title || "Nueva notificación", body || "", "🔔");
    });
    return () => unsub();
  }
}, [usuarioActual]);
useEffect(() => {
  
  const timer = setInterval(() => {
    setCurrentTime(new Date().toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}));
  }, 1000);
  return () => clearInterval(timer);
}, []);
  const showNotif = (title, msg, icon = "🔔") => {
    setNotifs(prev => [{ id: Date.now(), icon, title, msg, time: "Ahora", read: false }, ...prev]);
    showToast(`${icon} ${title}`);
  };

  const playSound = (type = "click") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    if (type === "click") {
      o.frequency.setValueAtTime(600, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    } else if (type === "success") {
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    } else if (type === "nav") {
      o.frequency.setValueAtTime(500, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    }
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.2);
  } catch(e) {}
};

const showScreen = (id) => {
  if (navigator.vibrate) navigator.vibrate(10);
  playSound("nav");
  setNotifPanel(false);
  setModal(null);
  setScreen(id);
};

const BACK_MAP = {
  "perfil":           "home",
  "calendario":       "home",
  "notas":            "home",
  "perfil-psicologo": "home",
  "psi-dashboard":    "admin-perfil",
  "admin-paciente":   "psi-dashboard",
  "admin-pagos":      "admin-perfil",
  "admin-psicologo":  "admin-perfil",
  "admin-pacientes":  "admin-perfil",
};

const goBack = () => {
  if (notifPanel) { setNotifPanel(false); return; }
  if (modal) { setModal(null); return; }
  const destino = BACK_MAP[screen];
  if (destino) showScreen(destino);
};

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const toggleTarea = (i) => {
    const next = [...tareas]; next[i] = !next[i]; setTareas(next);
    if (!tareas[i]) sumarXP(5, "Tarea completada ✅");
  };

  const pendientes = tareas.filter(t => !t).length;
const styles = `
  .safe-header {
    padding-top: max(20px, env(safe-area-inset-top, 20px)) !important;
  }
  @keyframes frailejMecerse { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes frailejMecerseR { 0%,100%{transform:rotate(3deg)} 50%{transform:rotate(-3deg)} }
  @keyframes frailejMecerseSlow { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
  @keyframes frailejFlotar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes frailejBrillar { 0%,100%{opacity:.25} 50%{opacity:.85} }
  @keyframes frailejDrift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(2px,-4px)} 66%{transform:translate(-2px,2px)} }
  @keyframes frailejParpadear { 0%,85%,100%{transform:scaleY(1)} 91%{transform:scaleY(.06)} }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .screen-enter { animation: fadeIn 0.25s ease; }
  @keyframes confettiFall {
    0% { transform: translateY(-20px) rotate(0deg); opacity:1; }
    100% { transform: translateY(400px) rotate(720deg); opacity:0; }
  }
  @keyframes checkInIn {
    from { opacity:0; transform:scale(0.92) translateY(20px); }
    to { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes pullSpin {
    to { transform: rotate(360deg); }
  }
  .confetti-piece {
    position:absolute; border-radius:2px;
    animation: confettiFall 1.2s ease-in forwards;
  }
  .pull-spinner {
    animation: pullSpin 0.8s linear infinite;
  }
  .dark-mode div[style*="background:white"],
  .dark-mode div[style*='background:"white"'] {
    background: #1E1D2E !important;
  }
  .dark-mode div[style*="background:#F8F7FA"] {
    background: #12111E !important;
  }
  .dark-mode div[style*="background:#F5F5F5"] {
    background: #252438 !important;
  }
  .dark-mode div[style*="color:#2D2D3E"],
  .dark-mode div[style*="color:C.text"] {
    color: #F2EEF9 !important;
  }
`;
  const C = darkMode ? {
  plum:"#E8A87C", sage:"#7DAA92", sageDark:"#4A8A72",
  amber:"#E8A87C", amberDark:"#C4845A", cream:"#1A1208",
  warm:"#2A1E10", text:"#F5E6D0", light:"#8A6A4A",
  red:"#E07070", green:"#6AAA72", blue:"#6A9AAA",
  dark:"#120E06", gold:"#E8A87C", bg:"#1A1208",
  cardBg:"#2A1E10", headerBg:"rgba(26,18,8,0.98)"
} : {
  plum:"#8B5A3A", sage:"#7DAA92", sageDark:"#4A8A72",
  amber:"#C4845A", amberDark:"#A06040", cream:"#F5EDE0",
  warm:"#EDE0D0", text:"#3A2A1C", light:"#A08060",
  red:"#C0524A", green:"#5A8A62", blue:"#5A7A9A",
  dark:"#2A1E14", gold:"#C4845A", bg:"#F5EDE0",
  cardBg:"#FEFAF5", headerBg:"#FEFAF5"
};

  const avatars = ["🦋","🦁","🐺","🦊","🐘","🦅","🐬","🦉","🐆","🦓","🐢","🦜"];

  const btn = (onClick, children, s = {}) => (
  <button onClick={() => { playSound("click"); if(navigator.vibrate) navigator.vibrate(8); onClick && onClick(); }} style={{ border:"none", cursor:"pointer", fontFamily:"inherit", ...s }}>{children}</button>
);

  const mitem = (icon, label, onClick, danger) => (
    <div onClick={onClick} style={{ background:"#FEFAF5", borderRadius:13, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:7, cursor:"pointer" }}>
      <div style={{ fontSize:18, width:34, height:34, background:C.warm, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:700, color:danger?C.red:C.text, flex:1 }}>{label}</div>
      <div style={{ color:C.light }}>›</div>
    </div>
  );

  const LucideIcon = ({ name, color, size=22 }) => {
  const icons = {
    home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    notes: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    tasks: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.88A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.88A2.5 2.5 0 0 0 14.5 2Z"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

  const bnav = (active) => {
  const tareasCount = tareasPsicologo.filter(t => !t.completada).length;
  const items = [
    { icon:"home", lb:"Inicio", id:"home" },
    { icon:"notes", lb:"Notas", id:"notas" },
    { icon:"calendar", lb:"Citas", id:"calendario" },
    { icon:"user", lb:"Perfil", id:"perfil" },
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:200, background:darkMode?"rgba(18,16,30,0.94)":"rgba(250,247,242,0.96)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderTop:`0.5px solid ${darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"}`, display:"flex", alignItems:"flex-end", paddingBottom:"env(safe-area-inset-bottom, 10px)", paddingTop:8, paddingLeft:4, paddingRight:4 }}>
      {items.map(({ icon, lb, id, isTareas }) => {
        const isActive = active === id || (isTareas && active === "notas" && lb==="Tareas") || (!isTareas && active === id);
        const iconColor = isActive ? "#E8A87C" : darkMode ? "rgba(255,255,255,0.3)" : "#9A9AB0";
        return (
          <div key={lb} onClick={() => { if(navigator.vibrate) navigator.vibrate([6,0,6]); isTareas ? (showScreen("notas"), setTimeout(()=>setNoteTab("tareas"),50)) : showScreen(id); }}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, paddingBottom:4, cursor:"pointer", position:"relative" }}>
            <div style={{ position:"relative" }}>
              <div style={{ width:38, height:34, borderRadius:11, background:isActive?(darkMode?"#2A1E10":"rgba(196,132,90,0.15)"):"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s" }}>
                <LucideIcon name={icon} color={isActive?(darkMode?"#E8A87C":"#A06040"):iconColor} size={20}/>
              </div>
              {isTareas && tareasCount > 0 && (
                <div style={{ position:"absolute", top:-3, right:-4, width:13, height:13, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, fontWeight:700, color:"white", border:`1.5px solid ${darkMode?"rgba(18,16,30,0.94)":"rgba(250,247,242,0.96)"}` }}>{tareasCount}</div>
              )}
            </div>
            <div style={{ fontSize:9.5, fontWeight:isActive?600:400, color:iconColor, transition:"all 0.2s" }}>{lb}</div>
          </div>
        );
      })}
    </div>
  );
};

  const anav = (active) => {
  const isAdmin = active === "admin-home" || active === "admin-psicologo" || active === "admin-pacientes" || active === "admin-pagos";
  const navItems = isAdmin
    ? [{ icon:"dashboard", lb:"Dashboard", id:"admin-home" }, { icon:"brain", lb:"Psicólogos", id:"admin-psicologo" }, { icon:"users", lb:"Pacientes", id:"admin-pacientes" }, { icon:"dollar", lb:"Pagos", id:"admin-pagos" }]
    : [{ icon:"user", lb:"Perfil", id:"admin-perfil" }, { icon:"users", lb:"Pacientes", id:"psi-dashboard" }, { icon:"calendar", lb:"Citas", id:"calendario" }];
  const accentColor = isAdmin ? C.amber : C.plum;
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:200, background:darkMode?"rgba(18,16,30,0.94)":"rgba(250,247,242,0.96)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderTop:`0.5px solid ${darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"}`, display:"flex", alignItems:"flex-end", paddingBottom:"env(safe-area-inset-bottom, 10px)", paddingTop:8, paddingLeft:4, paddingRight:4 }}>
      {navItems.map(({ icon, lb, id }) => {
        const isActive = active === id;
        const iconColor = isActive ? "#E8A87C" : darkMode ? "rgba(255,255,255,0.3)" : "#9A9AB0";
        return (
          <div key={id} onClick={() => { if(navigator.vibrate) navigator.vibrate([6,0,6]); showScreen(id); }}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, paddingBottom:4, cursor:"pointer", position:"relative" }}>
            <div style={{ width:38, height:34, borderRadius:11, background:isActive?(darkMode?"#2A1E10":"#3A2A1C"):"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s", boxShadow:isActive?`0 0 14px rgba(196,132,90,${darkMode?0.5:0.35}),0 0 28px rgba(196,132,90,${darkMode?0.2:0.12})`:"none" }}>
              <LucideIcon name={icon} color={iconColor} size={20}/>
            </div>
            <div style={{ fontSize:9.5, fontWeight:isActive?600:400, color:iconColor, transition:"all 0.2s" }}>{lb}</div>
          </div>
        );
      })}
    </div>
  );
};

  const mdl = (id, children) => modal === id ? (
    <div onClick={() => setModal(null)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"flex-end", borderRadius:44 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:"28px 28px 44px 44px", padding:"20px 20px 36px", width:"100%", maxHeight:"85%", overflowY:"auto" }}>
        <div style={{ width:40, height:4, background:"rgba(0,0,0,0.15)", borderRadius:2, margin:"0 auto 16px" }}/>
        {children}
      </div>
    </div>
  ) : null;
  if (checkingAuth) return (
  <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#2A2018 0%,#1E1610 60%,#181210 100%)", fontFamily:"system-ui", paddingTop:"env(safe-area-inset-top, 0px)", paddingBottom:"env(safe-area-inset-bottom, 0px)" }}>
    <style>{`
      @keyframes expandLine {
        0% { width:0; opacity:0; }
        30% { opacity:1; }
        70% { opacity:1; }
        100% { width:60px; opacity:0; }
      }
      .loading-line { animation: expandLine 1.6s ease-in-out infinite; }
    `}</style>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#F5E6D0", letterSpacing:"2.5px", opacity:0.9 }}>MI PSICÓLOGO</div>
      <div style={{ height:1.5, width:60, background:"rgba(232,168,124,0.15)", borderRadius:1, overflow:"hidden", position:"relative" }}>
        <div className="loading-line" style={{ position:"absolute", left:0, top:0, height:"100%", background:"#E8A87C", borderRadius:1 }}/>
      </div>
    </div>
  </div>
);

  return (
    <div className={darkMode ? "dark-mode" : ""} style={{ fontFamily:"system-ui,sans-serif", background:darkMode?"#0F0E17":"#E8EDF0", height:"100vh", width:"100vw", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", transition:"background 0.3s", paddingTop:"env(safe-area-inset-top, 0px)" }}><style>{styles}</style>
      
      {/* CONTENEDOR PRINCIPAL */}
      <div
        style={{ width:"100%", maxWidth:430, height:"100%", background:C.cream, overflow:"hidden", position:"relative", margin:"0 auto", transition:"background 0.3s" }}
        onTouchStart={e => {
          const t = e.touches[0];
          window._swipeStartX = t.clientX;
          window._swipeStartY = t.clientY;
          window._swipeStartTime = Date.now();
        }}
        onTouchEnd={e => {
          if (window._swipeStartX === undefined) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - window._swipeStartX;
          const dy = Math.abs(t.clientY - window._swipeStartY);
          const dt = Date.now() - window._swipeStartTime;
          // Swipe derecha: desde borde izquierdo (primeros 30px), rápido, más horizontal que vertical
          const desdeElBorde = window._swipeStartX < 30;
          const esRapido = dt < 400;
          const esDerecha = dx > 60;
          const esMasHorizontal = dx > dy;
          if (desdeElBorde && esRapido && esDerecha && esMasHorizontal) {
            if (navigator.vibrate) navigator.vibrate(8);
            goBack();
          }
          window._swipeStartX = undefined;
        }}
      >

        {/* CONTENIDO */}
        <div style={{ height:"100%", overflowY:"hidden", overflowX:"hidden", position:"relative" }}>
        {/* CONFETI CELEBRACIÓN */}
          {celebrando && (
            <div style={{ position:"absolute", inset:0, zIndex:600, pointerEvents:"none", overflow:"hidden" }}>
              {confettiItems.map(c => (
                <div key={c.id} className="confetti-piece" style={{ left:`${c.x}%`, top:0, width:c.size, height:c.size*1.5, background:c.color, animationDelay:`${c.delay}s` }}/>
              ))}
              <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", animation:"checkInIn 0.3s ease" }}>
                <div style={{ fontSize:60 }}>🎉</div>
                <div style={{ fontSize:18, fontWeight:900, color:"white", textShadow:"0 2px 10px rgba(0,0,0,0.5)", marginTop:8 }}>¡Tarea completada!</div>
              </div>
            </div>
          )}
        {/* CHECK-IN DIARIO ÁNIMO */}
          {mostrarCheckIn && usuarioActual?.rol === "paciente" && screen === "home" && (
            <div style={{ position:"absolute", inset:0, zIndex:500, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
              <div style={{ background:C.cardBg, borderRadius:28, padding:"28px 24px", width:"100%", animation:"checkInIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                <div style={{ fontSize:40, textAlign:"center", marginBottom:8 }}>🌅</div>
                <div style={{ fontSize:20, fontWeight:900, color:C.text, textAlign:"center", marginBottom:4 }}>¿Cómo llegaste hoy?</div>
                <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:24 }}>Tu psicólogo podrá ver tu evolución</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
                  {[["😞","Mal",0],["😕","Regular",1],["😐","Neutro",2],["🙂","Bien",3],["😄","Genial",4]].map(([e,l,v]) => (
                    <div key={v} onClick={() => completarCheckIn(v)}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", padding:"12px 8px", borderRadius:16, background:checkInMood===v?`${C.plum}20`:"transparent", border:`2px solid ${checkInMood===v?C.plum:"transparent"}`, transition:"all 0.2s", flex:1 }}>
                      <span style={{ fontSize:30 }}>{e}</span>
                      <span style={{ fontSize:10, color:checkInMood===v?C.plum:C.light, fontWeight:700 }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div onClick={() => setMostrarCheckIn(false)} style={{ textAlign:"center", fontSize:12, color:C.light, cursor:"pointer", padding:8 }}>
                  Saltar por hoy
                </div>
              </div>
            </div>
          )}

          {/* PANEL NOTIFICACIONES */}
          {notifPanel && (
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <div style={{ background:"#FEFAF5", padding:"14px 20px", borderBottom:"0.5px solid rgba(196,132,90,0.12)", display:"flex", alignItems:"center", gap:10 }}>
                <div onClick={() => setNotifPanel(false)} style={{ fontSize:20, cursor:"pointer", color:C.light }}>←</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:18, fontWeight:900, color:C.text }}>Notificaciones 🔔</div>
                  {unread > 0 && <div style={{ fontSize:11, color:C.light }}>{unread} sin leer</div>}
                </div>
                {unread > 0 && btn(markAllRead, "Marcar todas ✓", { fontSize:11, fontWeight:800, color:C.plum, background:C.warm, padding:"5px 10px", borderRadius:9 })}
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:14 }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{ background:n.read?"white":"#F5F0FB", borderRadius:16, padding:"12px 14px", marginBottom:9, border:"0.5px solid rgba(196,132,90,0.12)", display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer", borderLeft:`3px solid ${n.read?"transparent":C.plum}` }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:n.read?C.warm:"#EDE8F5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{n.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:n.read?C.text:C.plum }}>{n.title}</div>
                        {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:C.plum, flexShrink:0, marginTop:3 }}/>}
                      </div>
                      <div style={{ fontSize:11, color:C.light, lineHeight:1.5 }}>{n.msg}</div>
                      <div style={{ fontSize:10, color:C.light, marginTop:4, fontWeight:600 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGIN */}
{!notifPanel && screen === "login" && (
  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 28px", background:"linear-gradient(160deg, #2A2018 0%, #1E1610 60%, #181210 100%)", position:"relative", overflow:"hidden" }}>

    {/* PILL TOP */}
    <div style={{ width:40, height:3, borderRadius:2, background:"rgba(232,168,124,0.25)", marginBottom:28 }}/>

    {/* SOFÁ */}
    <div style={{ marginBottom:12, animation:"fadeIn 0.8s ease" }}>
      <svg width="160" height="96" viewBox="180 140 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="195" y="240" width="60" height="52" rx="10" fill="#5A3820"/>
        <rect x="425" y="240" width="60" height="52" rx="10" fill="#5A3820"/>
        <rect x="170" y="185" width="340" height="40" rx="20" fill="#7A5030"/>
        <rect x="185" y="200" width="310" height="95" rx="18" fill="#C4845A"/>
        <rect x="170" y="195" width="72" height="115" rx="22" fill="#A06040"/>
        <rect x="438" y="195" width="72" height="115" rx="22" fill="#A06040"/>
        <rect x="215" y="155" width="50" height="52" rx="14" fill="#E8A87C"/>
        <rect x="415" y="155" width="50" height="52" rx="14" fill="#E8A87C"/>
        <rect x="180" y="280" width="320" height="16" rx="8" fill="#5A3820" opacity="0.4"/>
      </svg>
    </div>

    {/* TÍTULO */}
    <div style={{ fontSize:28, fontWeight:800, color:"#F5E6D0", letterSpacing:0.2, marginBottom:8 }}>Mi Psicólogo</div>

    {/* BADGE SUBTÍTULO */}
    <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(232,168,124,0.10)", border:"0.8px solid rgba(232,168,124,0.18)", borderRadius:20, padding:"5px 14px", marginBottom:28 }}>
      <span style={{ fontSize:10, color:"rgba(232,168,124,0.55)" }}>✦ Un espacio seguro</span>
    </div>

    {/* CARD GLASS */}
    <div style={{ width:"100%", background:"rgba(255,255,255,0.045)", border:"1px solid rgba(232,168,124,0.09)", borderRadius:24, overflow:"hidden", backdropFilter:"blur(10px)" }}>

      {/* ACENTO SUPERIOR */}
      <div style={{ height:3, background:"linear-gradient(90deg, transparent, #C4845A, transparent)", opacity:0.5 }}/>

      <div style={{ padding:"24px 20px 20px" }}>

        {/* CAMPO CORREO */}
        <div style={{ position:"relative", marginBottom:1 }}>
          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(232,168,124,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={emailValue}
            onChange={e => setEmailValue(e.target.value)}
            style={{ width:"100%", padding:"14px 16px 14px 40px", background:"rgba(255,255,255,0.055)", border:"0.8px solid rgba(232,168,124,0.10)", borderRadius:12, fontSize:13, outline:"none", color:"#F5E6D0", fontFamily:"inherit", boxSizing:"border-box" }}
          />
        </div>

        {/* DIVISOR */}
        <div style={{ height:1, background:"rgba(232,168,124,0.07)", margin:"12px 0" }}/>

        {/* CAMPO PIN */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(232,168,124,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14, padding:"14px 16px 14px 40px", background:"rgba(255,255,255,0.055)", border:"0.8px solid rgba(232,168,124,0.10)", borderRadius:14 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:"50%", background: pinValue && pinValue.length > i ? "#E8A87C" : "transparent", border:`1.5px solid ${pinValue && pinValue.length > i ? "#E8A87C" : "rgba(245,230,208,0.2)"}`, transition:"all 0.2s ease" }}/>
            ))}
          </div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinValue || ""}
            onChange={e => setPinValue(e.target.value)}
            style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%" }}
          />
        </div>

        {/* BOTÓN */}
        <button
          onClick={e => {
            if (navigator.vibrate) navigator.vibrate(10);
            const b = e.currentTarget;
            const circle = document.createElement("span");
            const diameter = Math.max(b.clientWidth, b.clientHeight);
            circle.style.cssText = `width:${diameter}px;height:${diameter}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);transform:scale(0);animation:ripple 0.5s linear;left:${e.clientX - b.getBoundingClientRect().left - diameter/2}px;top:${e.clientY - b.getBoundingClientRect().top - diameter/2}px;pointer-events:none;`;
            b.appendChild(circle);
            setTimeout(() => circle.remove(), 500);
            handleLogin();
          }}
          style={{ width:"100%", padding:"11px 0", background:"#C4845A", color:"white", borderRadius:21, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", position:"relative", overflow:"hidden", letterSpacing:0.3 }}
        >
          Entrar a mi espacio →
        </button>

      </div>
    </div>

    {/* FOOTER */}
    <div style={{ marginTop:20, textAlign:"center" }}>
      <span style={{ fontSize:11, color:"rgba(245,230,208,0.25)" }}>¿Problemas para entrar? </span>
      <span style={{ fontSize:11, color:"#E8A87C", fontWeight:700, cursor:"pointer" }}>Contacta a tu psicólogo</span>
    </div>

    {showInstall && (
      <button onClick={handleInstall} style={{ marginTop:14, padding:"8px 20px", background:"rgba(232,168,124,0.08)", color:"rgba(232,168,124,0.4)", borderRadius:20, fontSize:11, fontWeight:600, border:"0.8px solid rgba(232,168,124,0.12)", cursor:"pointer", fontFamily:"inherit" }}>
        ⬇ Descargar App
      </button>
    )}

  </div>
)}
{/* REGISTRO */}
{!notifPanel && screen === "registro" && (
  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:`linear-gradient(160deg,${C.cream} 0%,#EDE8F5 100%)` }}>
    
    {/* LOGO */}
    <div style={{ fontSize:48, marginBottom:8 }}>🧠</div>
    <div style={{ fontSize:20, fontWeight:700, color:C.plum, marginBottom:4 }}>Crear cuenta</div>
    <div style={{ fontSize:13, color:C.light, marginBottom:32 }}>Únete a Mi Psicólogo</div>

    {/* FORMULARIO */}
    <div style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(232,168,124,0.1)", borderRadius:22, padding:24 }}>

      {/* NOMBRE */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Nombre completo</div>
      <input
        type="text"
        placeholder="Tu nombre"
        value={regNombre}
        onChange={e => setRegNombre(e.target.value)}
        style={{ width:"100%", padding:"11px 14px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:12, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
      />

      {/* CORREO */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Correo electrónico</div>
      <input
        type="email"
        placeholder="Tu correo"
        value={regEmail}
        onChange={e => setRegEmail(e.target.value)}
        style={{ width:"100%", padding:"11px 14px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:12, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
      />

      {/* PIN */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>PIN de acceso</div>
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:18, height:18, borderRadius:"50%", background: regPin && regPin.length > i ? C.plum : "transparent", border:`2.5px solid ${C.plum}` }}/>
        ))}
      </div>
      <input
        type="password"
        placeholder="PIN"
        inputMode="numeric"
        maxLength={4}
        value={regPin}
        onChange={e => setRegPin(e.target.value)}
        style={{ width:"100%", padding:"11px 14px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:12, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
      />

      {/* ROL */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:10 }}>Soy...</div>
      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        {[["paciente","👤","Paciente"],["psicologo","🧠","Psicólogo"]].map(([val,ic,lb]) => (
          <div key={val} onClick={() => setRegRol(val)} style={{ flex:1, padding:"12px 0", borderRadius:14, textAlign:"center", cursor:"pointer", border:`2px solid ${regRol===val ? C.plum : "rgba(0,0,0,0.08)"}`, background:regRol===val ? `${C.plum}15` : "white" }}>
            <div style={{ fontSize:24 }}>{ic}</div>
            <div style={{ fontSize:12, fontWeight:800, color:regRol===val ? C.plum : C.light }}>{lb}</div>
          </div>
        ))}
      </div>

      {/* BOTÓN */}
      <button
        onClick={handleRegister}
        style={{ width:"100%", padding:11, background:C.plum, color:"white", borderRadius:12, fontSize:13, fontWeight:700, border:"none", cursor:"pointer" }}
      >
        Crear cuenta
      </button>
    </div>

    {/* LINK LOGIN */}
    <div style={{ marginTop:24, fontSize:12, color:C.light, textAlign:"center" }}>
      ¿Ya tienes cuenta?{" "}
      <span onClick={() => showScreen("login")} style={{ color:C.plum, fontWeight:700, cursor:"pointer" }}>
        Inicia sesión
      </span>
    </div>

  </div>
)}

          {/* HOME */}
          {!notifPanel && screen === "home" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(120px + env(safe-area-inset-bottom, 0px))", background:darkMode?"#0F0E17":"#F5F0EB" }}>

              {/* HEADER */}
              <div style={{ background:"linear-gradient(160deg,#3A2A1C,#2A1E14)", padding:"20px 20px 44px", paddingTop:"max(20px, env(safe-area-inset-top, 20px))", position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"inline-flex", background:"rgba(232,168,124,0.12)", border:"0.5px solid rgba(232,168,124,0.2)", borderRadius:20, padding:"3px 10px", marginBottom:8 }}>
                      <span style={{ fontSize:10, color:"rgba(232,168,124,0.65)" }}>{new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</span>
                    </div>
                    <div style={{ fontSize:13, color:"rgba(245,230,208,0.55)", fontWeight:400, lineHeight:1 }}>Buenos días,</div>
                    <div style={{ fontSize:20, color:"#E8A87C", fontWeight:700, marginTop:1 }}>
                      {usuarioActual?.nombre?.split(" ")[0] || "Bienvenido"}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer", width:36, height:36, background:"rgba(232,168,124,0.1)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,208,0.7)" strokeWidth="1.75" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      {unread > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:14, height:14, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:"white" }}>{unread}</div>}
                    </div>
                    <div onClick={() => showScreen("perfil")} style={{ width:36, height:36, background:"rgba(196,132,90,0.25)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border:"1px solid rgba(232,168,124,0.3)", cursor:"pointer" }}>{avatar}</div>
                  </div>
                </div>

                {/* BARRA XP */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14 }}>
                  <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((xp % 50) / 50 * 100, 100)}%`, background:"linear-gradient(90deg,#C4845A,#E8A87C)", borderRadius:2, transition:"width 0.5s ease" }}/>
                  </div>
                  <span style={{ fontSize:10, color:"#E8A87C", fontWeight:600, whiteSpace:"nowrap" }}>{getRango(xp).icono} {xp} XP</span>
                </div>
              </div>

              {/* PRÓXIMA CITA */}
              <div style={{ padding:"0 14px", marginTop:-24, position:"relative", zIndex:10 }}>
                {citas.length === 0 ? (
                  <div style={{ background:darkMode?"#2A2018":"#2A2018", border:"0.5px solid rgba(232,168,124,0.12)", borderRadius:16, padding:14, textAlign:"center", marginBottom:12 }}>
                    <div style={{ width:36, height:36, background:"rgba(196,132,90,0.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#F5E6D0" }}>Sin citas agendadas</div>
                    <div style={{ fontSize:11, color:"rgba(245,230,208,0.4)", marginTop:3 }}>Tu psicólogo agendará tu próxima sesión</div>
                  </div>
                ) : (
                  (() => {
                    const proxima = citas.filter(c => c.status !== "cancelada").sort((a,b) => new Date(a.fecha) - new Date(b.fecha))[0];
                    if (!proxima) return null;
                    return (
                      <div style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.15)", borderRadius:16, padding:14, marginBottom:12, overflow:"hidden", position:"relative" }}>
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#C4845A,transparent)", opacity:0.6 }}/>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ fontSize:10, fontWeight:600, color:"rgba(232,168,124,0.55)", letterSpacing:0.8, textTransform:"uppercase" }}>Próxima cita</span>
                          <div style={{ background:proxima.status==="confirmada"?"rgba(125,170,146,0.18)":"rgba(232,168,124,0.15)", color:proxima.status==="confirmada"?"#7DAA92":"#E8A87C", fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:20 }}>
                            {proxima.status==="confirmada"?"Confirmada":"Pendiente"}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <div style={{ background:"#C4845A", borderRadius:10, padding:"8px 10px", textAlign:"center", minWidth:44 }}>
                            <div style={{ fontSize:16, fontWeight:700, color:"white", lineHeight:1 }}>
                              {new Date(proxima.fecha).getDate()}
                            </div>
                            <div style={{ fontSize:8, color:"rgba(255,255,255,0.75)", fontWeight:600, textTransform:"uppercase" }}>
                              {new Date(proxima.fecha).toLocaleDateString('es-CO', { month:'short' })}
                            </div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:"#F5E6D0" }}>Sesión con {proxima.psicologoNombre}</div>
                            <div style={{ fontSize:11, color:"rgba(245,230,208,0.45)", marginTop:3 }}>{proxima.hora} · {proxima.modalidad==="virtual"?"Virtual":"Presencial"}</div>
                          </div>
                        </div>
                        {proxima.modalidad==="virtual" && proxima.link && (
                          <a href={proxima.link} target="_blank" rel="noreferrer"
                            style={{ display:"block", padding:"10px 0", background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:12, fontSize:12, fontWeight:800, textAlign:"center", textDecoration:"none", marginBottom:10 }}>
                            🎥 Unirse a la sesión
                          </a>
                        )}
                        {proxima.status === "pendiente" && (
                          <div style={{ display:"flex", gap:8 }}>
                            {btn(() => { setCitaSeleccionada(proxima); setModal("confirmar-cita"); }, "✓ Confirmar asistencia", { flex:1, padding:"9px 0", borderRadius:10, background:C.green, color:"white", fontWeight:800, fontSize:12 })}
                          </div>
                        )}
                        {btn(() => showScreen("calendario"), "Ver todas mis citas →", { width:"100%", padding:"9px 0", borderRadius:10, background:C.warm, color:C.plum, fontWeight:800, fontSize:12, marginTop:proxima.status==="pendiente"?8:0 })}
                      </div>
                    );
                  })()
                )}
                {/* ACCESOS RÁPIDOS GRID */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  <div onClick={() => { showScreen("notas"); setTimeout(()=>{ setNoteTab("tareas"); setTareasTab("autorregistros"); }, 50); }}
                    style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.1)", borderRadius:14, padding:"12px 12px", cursor:"pointer" }}>
                    <div style={{ width:30, height:30, background:"rgba(196,132,90,0.15)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#F5E6D0" }}>Autorregistro</div>
                    <div style={{ fontSize:10, color:"rgba(245,230,208,0.4)", marginTop:2 }}>Registra hoy</div>
                  </div>
                  <div onClick={() => { showScreen("notas"); setTimeout(()=>setNoteTab("insights"), 50); }}
                    style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.1)", borderRadius:14, padding:"12px 12px", cursor:"pointer" }}>
                    <div style={{ width:30, height:30, background:"rgba(196,132,90,0.15)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#F5E6D0" }}>Nueva nota</div>
                    <div style={{ fontSize:10, color:"rgba(245,230,208,0.4)", marginTop:2 }}>Para no olvidar</div>
                  </div>
                </div>

                {/* FRASE MES */}
                {fraseDelMes ? (
                  <div style={{ background:"rgba(196,132,90,0.08)", border:"0.5px solid rgba(232,168,124,0.15)", borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
                    <div style={{ fontSize:10, color:"rgba(232,168,124,0.55)", fontWeight:600, marginBottom:6, letterSpacing:0.5 }}>FRASE DEL MES</div>
                    <div style={{ fontSize:13, color:"#F5E6D0", lineHeight:1.6, fontStyle:"italic" }}>"{fraseDelMes}"</div>
                    <div style={{ fontSize:10, color:"rgba(245,230,208,0.4)", marginTop:6 }}>— {psicologoData?.nombre || "Tu psicólogo"}</div>
                  </div>
                ) : null}
              </div>

              {/* Compañero de terapia */}
              <CompaneroHome id={companero || "frailejón"}/>

              {mdl("confirmar-cita", citaSeleccionada && (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>✅</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Confirmar cita</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>
                    ¿Confirmas tu asistencia el <strong>{new Date(citaSeleccionada.fecha).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</strong> a las <strong>{citaSeleccionada.hora}</strong>?
                  </div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "No aún", { flex:1, padding:9, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => actualizarStatusCita(citaSeleccionada.id, "confirmada"), "✓ Confirmar", { flex:1, padding:9, background:C.green, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {bnav("home")}
            </div>
          )}

          {/* PANTALLA ELEGIR COMPAÑERO */}
{screen === "elegir-companero" && (
  <div style={{position:"absolute",inset:0,background:"#F5EDE0",display:"flex",flexDirection:"column",overflowY:"auto",zIndex:10}}>

    {/* Header */}
    <div style={{background:"linear-gradient(160deg,#3A2A1C,#2A1E14)",padding:"32px 20px 32px",borderRadius:"0 0 28px 28px",flexShrink:0,position:"relative",overflow:"hidden"}}>
      {[...Array(18)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:3,height:3,borderRadius:"50%",background:"rgba(232,168,124,0.15)",left:`${(i*67)%100}%`,top:`${(i*43)%100}%`}}/>
      ))}
      <div style={{fontSize:10,color:"rgba(232,168,124,0.5)",letterSpacing:2,marginBottom:8,fontWeight:700}}>PRIMER INGRESO</div>
      <div style={{fontSize:23,fontWeight:800,color:"#F5EDE0",lineHeight:1.25}}>
        Elige tu compañero{" "}
        <span style={{color:"#E8A87C"}}>de terapia</span>
      </div>
      <div style={{fontSize:12,color:"rgba(245,237,224,0.45)",marginTop:10,lineHeight:1.6}}>
        Este será tu aliado en el camino.{" "}
        <span style={{color:"rgba(232,168,124,0.6)"}}>Tómate el tiempo que necesites.</span>
      </div>
      <div style={{marginTop:16,height:2,width:40,background:"linear-gradient(90deg,#E8A87C,transparent)",borderRadius:2}}/>
    </div>

    {/* Área cards */}
    <div style={{padding:"20px 16px 40px",position:"relative"}}>

      {/* Patrón puntitos tenue */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.018}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#3A2A1C"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>

      {/* Cards */}
      {Object.entries(COMPANEROS).map(([id, data]) => (
        <div key={id}
          onClick={() => setCompaneroSeleccionando(id)}
          style={{
            background: companeroSeleccionando === id ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.65)",
            backdropFilter:"blur(16px)",
            WebkitBackdropFilter:"blur(16px)",
            border:`${companeroSeleccionando === id ? "1.5px" : "0.5px"} solid ${companeroSeleccionando === id ? data.color : "rgba(196,132,90,0.15)"}`,
            borderLeft:`3px solid ${companeroSeleccionando === id ? data.color : "transparent"}`,
            borderRadius:20,
            padding:"14px 16px",
            marginBottom:12,
            cursor:"pointer",
            transition:"all 0.22s ease",
            display:"flex",
            alignItems:"center",
            gap:14,
            transform: companeroSeleccionando === id ? "translateY(-2px)" : "translateY(0)",
            boxShadow: companeroSeleccionando === id
              ? `0 8px 28px ${data.color}22, 0 2px 8px rgba(0,0,0,0.06)`
              : "0 1px 4px rgba(0,0,0,0.04)",
          }}>
          {/* Avatar miniatura */}
          <div style={{width:78,height:78,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:data.colorClaro,borderRadius:14,overflow:"hidden"}}>
            <data.Componente mini={true}/>
          </div>
          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:800,color:"#3A2A1C",letterSpacing:.2}}>{data.nombre}</div>
            <div style={{fontSize:11,color:"#A08060",marginTop:4,lineHeight:1.4}}>{data.descripcion}</div>
            {companeroSeleccionando === id && (
              <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:7,background:data.color,borderRadius:20,padding:"3px 12px"}}>
                <span style={{fontSize:10,color:"white",fontWeight:700}}>✓ Seleccionado</span>
              </div>
            )}
          </div>
          {/* Check círculo */}
          <div style={{width:24,height:24,borderRadius:12,border:`1.5px solid ${companeroSeleccionando===id ? data.color : "rgba(196,132,90,0.2)"}`,background:companeroSeleccionando===id ? data.color : "transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
            {companeroSeleccionando === id && <span style={{fontSize:12,color:"white"}}>✓</span>}
          </div>
        </div>
      ))}

      {/* Botón o hint */}
      <div style={{marginTop:10,paddingBottom:20}}>
        {companeroSeleccionando ? (
          <div style={{animation:"checkInIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
            {btn(async () => {
              try {
                await updateDoc(doc(db,"usuarios",usuarioActual.uid),{
                  companero: companeroSeleccionando,
                  companeroDesde: new Date().toISOString().split("T")[0],
                  companeroUltimoCambio: new Date().toISOString().split("T")[0],
                });
                setCompanero(companeroSeleccionando);
                setUsuarioActual(p=>({...p, companero: companeroSeleccionando}));
                showScreen("home");
              } catch(e){ console.error(e); }
            }, `Comenzar con ${COMPANEROS[companeroSeleccionando].nombre} →`, {
              width:"100%", padding:"15px 0", borderRadius:16,
              background:`linear-gradient(135deg,${COMPANEROS[companeroSeleccionando].color},${COMPANEROS[companeroSeleccionando].color}CC)`,
              color:"white", fontSize:15, fontWeight:800,
            })}
            <div style={{textAlign:"center",fontSize:11,color:"rgba(58,42,28,0.35)",marginTop:10}}>
              Podrás cambiarlo en 30 días
            </div>
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"14px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{fontSize:20,opacity:.25}}>☝️</div>
            <div style={{fontSize:12,color:"rgba(58,42,28,0.3)"}}>Toca un compañero para seleccionarlo</div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
{!notifPanel && screen === "notas" && (
  <div style={{ height:"100%", display:"flex", flexDirection:"column", background:darkMode?"#1A1208":"#F5EDE0" }}>
    
    {/* HEADER */}
    <div style={{ background:darkMode?"#2A1E10":"#FEFAF5", padding:"14px 18px 0", borderBottom:"0.5px solid rgba(196,132,90,0.12)" }}>
      <div style={{ fontSize:17, fontWeight:700, color:C.text }}>Notas & Tareas</div>
      <div style={{ fontSize:11, color:C.light, fontWeight:600, marginBottom:10 }}>Tu espacio personal de registro</div>
      <div style={{ display:"flex", borderBottom:"0.5px solid rgba(196,132,90,0.12)" }}>
        {[["Para no olvidar","insights"],["Tareas","tareas"]].map(([lb,id]) => (
          <button key={id} onClick={() => setNoteTab(id)} style={{ flex:1, padding:"10px 0", fontSize:11, fontWeight:600, color:noteTab===id?C.amber:C.light, border:"none", background:"transparent", borderBottom:`2px solid ${noteTab===id?C.amber:"transparent"}`, marginBottom:-1, cursor:"pointer", fontFamily:"inherit" }}>
            {lb}{id==="tareas" && pendientes > 0 && <span style={{ background:C.amber, color:"white", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20, marginLeft:6 }}>{pendientes}</span>}
          </button>
        ))}
      </div>
    </div>

    <div style={{ flex:1, overflowY:"auto", padding:14, paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))" }}>
      
      {/* PESTAÑA INSIGHTS */}
      {noteTab === "insights" && (
        <>
          {/* FORMULARIO NUEVA NOTA */}
          <div style={{ background:"#FEFAF5", borderRadius:16, padding:16, marginBottom:16, border:"0.5px solid rgba(196,132,90,0.12)" }}>
            <div style={{ fontSize:14, fontWeight:900, color:C.plum, marginBottom:12 }}>💡 Nueva nota</div>
            
            {/* SELECTOR ÁNIMO */}
            <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:8 }}>¿Cómo te sientes?</div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              {[["😞","Mal"],["😕","Regular"],["😐","Neutro"],["🙂","Bien"],["😄","Genial"]].map(([e,l],i) => (
                <div key={i} onClick={() => setInsightMood(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"7px 9px", borderRadius:11, background:insightMood===i?`${C.plum}15`:"transparent", border:`2px solid ${insightMood===i?C.plum:"transparent"}`, transition:"all 0.2s" }}>
                  <span style={{ fontSize:22 }}>{e}</span>
                  <span style={{ fontSize:9, color:C.light, fontWeight:700 }}>{l}</span>
                </div>
              ))}
            </div>

            {/* TÍTULO */}
            <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Título</div>
            <input
              type="text"
              placeholder="Para no olvidar..."
              value={insightTitle}
              onChange={e => setInsightTitle(e.target.value)}
              style={{ width:"100%", padding:"12px 14px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:12, fontSize:13, marginBottom:12, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#FEFAF5" }}
            />

            {/* TEXTO */}
            <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Nota</div>
            <textarea
              placeholder="Escribe aquí lo que no quieres olvidar para tu próxima sesión..."
              value={insightText}
              onChange={e => setInsightText(e.target.value)}
              style={{ width:"100%", minHeight:90, padding:"12px 14px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:12, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box", background:"#FEFAF5", lineHeight:1.5 }}
            />

            {/* CASILLA COMPARTIR */}
            <div onClick={() => setInsightShared(!insightShared)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, background:insightShared?`${C.sage}20`:"#F5F5F5", cursor:"pointer", marginBottom:14, transition:"all 0.2s" }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${insightShared?C.sageDark:C.light}`, background:insightShared?C.sageDark:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"white", transition:"all 0.2s" }}>
                {insightShared ? "✓" : ""}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:800, color:insightShared?C.sageDark:C.text }}>Compartir con mi psicólogo</div>
                <div style={{ fontSize:10, color:C.light }}>Tu psicólogo podrá ver esta nota</div>
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            {btn(async () => {
              if (!insightText.trim()) return;
              const id = Date.now().toString();
              const nueva = {
                id,
                pacienteId: usuarioActual.uid,
                title: insightTitle || "Para no olvidar",
                text: insightText,
                mood: insightMood,
                shared: insightShared,
                creadaEn: new Date().toISOString(),
                date: new Date().toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
              };
              try {
                await setDoc(doc(db, "notas", id), nueva);
                setInsights(prev => [nueva, ...prev]);
                setInsightText("");
                setInsightTitle("");
                setInsightMood(null);
                setInsightShared(false);
                showNotif("Nota guardada", "Tu insight quedó registrado 💡", "✅");
                sumarXP(2, "Nota guardada 💡");
              } catch(e) { showToast("Error al guardar nota ❌"); }
            }, "💾 Guardar nota", { width:"100%", padding:14, background:C.plum, color:"white", borderRadius:13, fontSize:13, fontWeight:700 })}
          </div>

          {/* LISTA DE INSIGHTS */}
          {insights.length === 0 && (
            <div style={{ textAlign:"center", padding:40, color:C.light }}>
              <div style={{ fontSize:40, marginBottom:12 }}>💡</div>
              <div style={{ fontSize:14, fontWeight:700 }}>Aún no tienes notas</div>
              <div style={{ fontSize:12, marginTop:4 }}>Escribe lo que no quieres olvidar para tu próxima sesión</div>
            </div>
          )}
          {insights.map(n => (
            <div key={n.id} style={{ background:"#FEFAF5", borderRadius:18, padding:16, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${n.shared?C.sageDark:C.plum}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div style={{ fontSize:11, color:C.light, fontWeight:700 }}>{n.date}</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {n.mood !== null && <span style={{ fontSize:16 }}>{["😞","😕","😐","🙂","😄"][n.mood]}</span>}
                  {n.shared && <span style={{ background:`${C.sageDark}20`, color:C.sageDark, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>👁 Psicólogo</span>}
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:C.plum, marginBottom:6 }}>{n.title}</div>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{n.text}</div>
              <div onClick={async () => {
              try {
                  await deleteDoc(doc(db, "notas", String(n.id)));
                  setInsights(prev => prev.filter(i => i.id !== n.id));
                } catch(e) { showToast("Error al eliminar ❌"); }
              }} style={{ marginTop:10, fontSize:11, color:C.light, cursor:"pointer", textAlign:"right" }}>🗑 Eliminar</div>
            </div>
          ))}
        </>
      )}
{/* PESTAÑA TAREAS */}
{noteTab === "tareas" && (
  <>
    {/* SUBTABS */}
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {[["📋","Mis autorregistros","autorregistros"],["📚","Mis recursos","recursos"],["🎯","Tareas","tareas"]].map(([ic,lb,id]) => (
        <div key={id} onClick={() => setTareasTab(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"12px 8px", borderRadius:16, background:tareasTab===id?C.plum:"white", cursor:"pointer", border:"0.5px solid rgba(196,132,90,0.12)", transition:"all 0.2s" }}>
          <span style={{ fontSize:22 }}>{ic}</span>
          <span style={{ fontSize:10, fontWeight:800, color:tareasTab===id?"white":C.light, textAlign:"center" }}>{lb}</span>
        </div>
      ))}
    </div>
    {/* MIS AUTORREGISTROS */}
        {tareasTab === "autorregistros" && (
          <div>
            {btn(() => setModal("nuevo-autorregistro"), "✏️ Escribir autorregistro", { width:"100%", padding:10, background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:12, fontSize:13, fontWeight:800, marginBottom:14, display:"block" })}

            {autorregistros.length === 0 ? (
              <div style={{ textAlign:"center", padding:30, color:C.light }}>
                <div style={{ fontSize:40, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:14, fontWeight:700 }}>Aún no tienes autorregistros</div>
                <div style={{ fontSize:12, marginTop:4 }}>Toca el botón de arriba para crear uno</div>
              </div>
            ) : (
              autorregistros.map((ar, i) => (
                <div key={i} style={{ background:"#FEFAF5", borderRadius:16, padding:16, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${C.plum}` }}>
                  <div style={{ fontSize:11, color:C.light, fontWeight:700, marginBottom:4 }}>📅 {ar.fecha}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:6 }}>¿Qué estaba haciendo?</div>
                  <div style={{ fontSize:12, color:C.light, marginBottom:8, lineHeight:1.5 }}>{ar.haciendo}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:6 }}>¿Qué sucedió?</div>
                  <div style={{ fontSize:12, color:C.light, marginBottom:8, lineHeight:1.5 }}>{ar.sucedio}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:6 }}>¿Qué hizo después?</div>
                  <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>{ar.despues}</div>
                </div>
              ))
            )}

            {mdl("nuevo-autorregistro", (
              <div>
                <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📋 Nuevo autorregistro</div>
                <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Registra lo que viviste</div>

                <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>📅 Fecha</div>
                <input placeholder="Ej: 19 de marzo, 2026" value={arFecha} onChange={e => setArFecha(e.target.value)}
                  style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>¿Qué estaba haciendo?</div>
                <textarea placeholder="Describe lo que hacías en ese momento..." value={arHaciendo} onChange={e => setArHaciendo(e.target.value)}
                  style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>

                <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>¿Qué sucedió?</div>
                <textarea placeholder="¿Qué pasó? ¿Cómo te sentiste?" value={arSucedio} onChange={e => setArSucedio(e.target.value)}
                  style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>

                <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>¿Qué hizo después?</div>
                <textarea placeholder="¿Qué hiciste luego? ¿Cómo lo manejaste?" value={arDespues} onChange={e => setArDespues(e.target.value)}
                  style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>

                <div style={{ display:"flex", gap:8 }}>
                  {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                  {btn(async () => {
                    if (!arFecha || !arHaciendo || !arSucedio || !arDespues) { showToast("Completa todos los campos ❌"); return; }
                    const id = Date.now().toString();
                    const nuevo = {
                      id,
                      pacienteId: usuarioActual.uid,
                      fecha: arFecha,
                      haciendo: arHaciendo,
                      sucedio: arSucedio,
                      despues: arDespues,
                      creadaEn: new Date().toISOString(),
                    };
                    try {
                      await setDoc(doc(db, "autorregistros", id), nuevo);
                      setAutorregistros(prev => [nuevo, ...prev]);
                      setArFecha(""); setArHaciendo(""); setArSucedio(""); setArDespues("");
                      setModal(null);
                      sumarXP(1, "Autorregistro completado 📋");
                    } catch(e) { showToast("Error al guardar ❌"); }
                  }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                </div>
              </div>
            ))}
          </div>
        )}      
    {/* MIS RECURSOS */}
    {tareasTab === "recursos" && (
  <div>
    {recursos.length === 0 ? (
      <div style={{ textAlign:"center", padding:30, color:C.light, fontSize:13 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
        Tu psicólogo aún no ha enviado materiales
      </div>
    ) : recursos.map(r => (
      <div key={r.id} style={{ background:"#FEFAF5", borderRadius:16, padding:16, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${C.plum}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {r.tipo==="PDF"?"📄":r.tipo==="Podcast"?"🎵":r.tipo==="YouTube"?"🎬":r.tipo==="Imagen"?"🖼️":r.tipo==="Enlace"?"🔗":"📎"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{r.nombre}</div>
            <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{r.tipo} · Enviado por {r.psicologoNombre}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <a href={r.url} target="_blank" rel="noreferrer"
            style={{ flex:2, padding:"8px 0", borderRadius:10, background:`${C.plum}15`, color:C.plum, fontSize:11, fontWeight:800, textAlign:"center", textDecoration:"none" }}>
            👁️ Abrir
          </a>
          {!r.recibido ? (
            btn(() => marcarRecursoRecibido(r.id), "✅ Recibido", { flex:1, padding:"8px 0", borderRadius:10, background:"#E8F5E9", color:C.green, fontSize:11, fontWeight:800 })
          ) : (
            <div style={{ flex:1, padding:"8px 0", borderRadius:10, background:"#E8F5E9", color:C.green, fontSize:11, fontWeight:800, textAlign:"center" }}>✅ Recibido</div>
          )}
          {btn(() => { setRecursoAEliminar(r); setModal("confirmar-eliminar-recurso"); }, "🗑️", { padding:"8px 10px", borderRadius:10, background:"#FFE5E5", color:C.red, fontSize:13, fontWeight:800 })}
        </div>
      </div>
    ))}
  </div>
)}

    {/* TAREAS */}
    {tareasTab === "tareas" && (
      <>
        {tareasPsicologo.length === 0 ? (
          <div style={{ textAlign:"center", padding:30, color:C.light }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🎯</div>
            <div style={{ fontSize:14, fontWeight:700 }}>Sin tareas asignadas</div>
            <div style={{ fontSize:12, marginTop:4 }}>Tu psicólogo aún no te ha asignado tareas</div>
          </div>
        ) : tareasPsicologo.map(t => (
          <div key={t.id} style={{ background:"#FEFAF5", borderRadius:16, padding:"11px 14px", marginBottom:12, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${t.completada?C.green:C.amber}`, opacity:t.completada?0.75:1 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
              <div onClick={async () => {
                try {
                  await updateDoc(doc(db, "tareas", t.id), { completada: !t.completada });
                  setTareasPsicologo(prev => prev.map(x => x.id === t.id ? { ...x, completada: !t.completada } : x));
                  if (!t.completada) {
                    sumarXP(t.xp || 80, "Tarea completada ✅");
                    if(navigator.vibrate) navigator.vibrate([10,50,10,50,30]);
                    setCelebrando(true);
                    setTimeout(() => setCelebrando(false), 1500);
                  }
                } catch(e) { showToast("Error ❌"); }
              }} style={{ width:22, height:22, borderRadius:"50%", border:`2.5px solid ${t.completada?C.green:C.amber}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:11, color:"white", background:t.completada?C.green:"transparent", marginTop:1 }}>{t.completada?"✓":""}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:C.text, textDecoration:t.completada?"line-through":"none" }}>{t.titulo}</div>
                {t.descripcion ? <div style={{ fontSize:11, color:C.light, marginTop:2, lineHeight:1.5 }}>{t.descripcion}</div> : null}
                <div style={{ display:"inline-flex", background:"#FFF8E6", color:C.amberDark, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, marginTop:5 }}>⭐ +{t.xp || 80} XP al completar</div>
                {t.vence ? <div style={{ fontSize:10, color:C.light, marginTop:2 }}>📅 Vence: {t.vence}</div> : null}
              </div>
            </div>
            {!t.completada && (
              <div style={{ display:"flex", gap:7 }}>
                {btn(() => { setTareaRespondiendo(t); setRespuestaTarea(t.respuesta || ""); setModal("responder-tarea-" + t.id); }, "✏️ Responder", { padding:"6px 12px", borderRadius:9, background:C.warm, color:C.amberDark, fontSize:11, fontWeight:800 })}
              </div>
            )}
            {t.respuesta ? (
              <div style={{ marginTop:8, background:"#F5F0FF", borderRadius:10, padding:"8px 10px" }}>
                <div style={{ fontSize:10, fontWeight:800, color:C.plum, marginBottom:3 }}>💬 Tu respuesta:</div>
                <div style={{ fontSize:11, color:C.text, lineHeight:1.5 }}>{t.respuesta}</div>
              </div>
            ) : null}
          </div>
        ))}
      </>
    )}
  </>
)}
    </div>

    {tareaRespondiendo && mdl("responder-tarea-" + tareaRespondiendo.id, (
      <div>
        <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>✏️ Responder tarea</div>
        <div style={{ fontSize:13, fontWeight:800, color:C.plum, marginBottom:4 }}>{tareaRespondiendo.titulo}</div>
        {tareaRespondiendo.descripcion ? <div style={{ fontSize:12, color:C.light, marginBottom:10, lineHeight:1.5 }}>{tareaRespondiendo.descripcion}</div> : null}
        <div style={{ background:"#FFF8E6", borderRadius:11, padding:"9px 12px", fontSize:11, fontWeight:700, color:C.amberDark, marginBottom:12 }}>⭐ Ganarás +{tareaRespondiendo.xp || 80} XP al completar</div>
        <textarea placeholder="Escribe tu reflexión aquí..." value={respuestaTarea} onChange={e => setRespuestaTarea(e.target.value)}
          style={{ width:"100%", minHeight:90, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:13, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
        <div style={{ display:"flex", gap:8 }}>
          {btn(() => { setModal(null); setRespuestaTarea(""); setTareaRespondiendo(null); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
          {btn(async () => {
            if (!respuestaTarea.trim()) { showToast("Escribe tu respuesta ❌"); return; }
            try {
              await updateDoc(doc(db, "tareas", tareaRespondiendo.id), { respuesta: respuestaTarea, completada: true });
              setTareasPsicologo(prev => prev.map(t => t.id === tareaRespondiendo.id ? { ...t, respuesta: respuestaTarea, completada: true } : t));
              sumarXP(tareaRespondiendo.xp || 80, "Tarea completada ✅");
              setRespuestaTarea(""); setTareaRespondiendo(null);
              setModal(null);
              showToast("✅ Respuesta enviada a tu psicólogo");
            } catch(e) { showToast("Error al enviar ❌"); }
          }, "Enviar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
        </div>
      </div>
    ))}
    {bnav("notas")}
  </div>
)}
          {/* CALENDARIO */}
          {!notifPanel && screen === "calendario" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))", background:"#F5EDE0" }}>
              <div style={{ background:"linear-gradient(160deg,#3A2A1C,#2A1E14)", padding:"18px 20px 22px" }}>
                <div style={{ fontSize:18, fontWeight:700, color:"white" }}>📅 Mis citas</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
                  {new Date().toLocaleDateString('es-CO', { month:'long', year:'numeric' })}
                </div>
              </div>
              <div style={{ padding:14 }}>
                {loadingCitas ? (
                  <div style={{ textAlign:"center", padding:30, color:C.light }}>
                    <div style={{ fontSize:30, marginBottom:8 }}>⏳</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>Cargando citas...</div>
                  </div>
                ) : citas.length === 0 ? (
                  <div style={{ textAlign:"center", padding:40, color:C.light }}>
                    <div style={{ fontSize:48, marginBottom:10 }}>📭</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Sin citas agendadas</div>
                    <div style={{ fontSize:12, marginTop:6 }}>Tu psicólogo agendará tu próxima sesión</div>
                  </div>
                ) : (
                  citas.map(c => (
                    <div key={c.id} style={{ background:"#FEFAF5", borderRadius:14, padding:"11px 14px", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.07)", borderLeft:`3px solid ${c.status==="cancelada"?C.red:c.status==="confirmada"?"#5A8A62":C.amber}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ background:c.modalidad==="virtual"?`${C.plum}15`:`${C.sage}15`, borderRadius:10, padding:"8px 10px", textAlign:"center", minWidth:52 }}>
                          <div style={{ fontSize:20 }}>{c.modalidad==="virtual"?"💻":"🏥"}</div>
                          <div style={{ fontSize:9, fontWeight:800, color:c.modalidad==="virtual"?C.plum:C.sageDark, textTransform:"uppercase" }}>{c.modalidad}</div>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:900, color:C.text }}>Sesión con {c.psicologoNombre}</div>
                          <div style={{ fontSize:12, color:C.light, marginTop:2 }}>📅 {new Date(c.fecha).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</div>
                          <div style={{ fontSize:12, color:C.light }}>⏰ {c.hora}</div>
                        </div>
                      </div>
                      {c.modalidad==="virtual" && c.link && (
                        <a href={c.link} target="_blank" rel="noreferrer"
                          style={{ display:"block", width:"100%", padding:"9px 0", background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center", textDecoration:"none", marginBottom:8 }}>
                          🎥 Unirse a la sesión virtual
                        </a>
                      )}
                      {c.notas && (
                        <div style={{ background:C.warm, borderRadius:10, padding:"8px 12px", marginBottom:8, fontSize:12, color:C.light, fontStyle:"italic" }}>
                          📝 {c.notas}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:7 }}>
                        {c.status === "pendiente" && (<>
                          {btn(() => { setCitaSeleccionada(c); setModal("confirmar-cita"); }, "✓ Confirmar", { flex:1, padding:"7px 0", borderRadius:9, background:C.green, color:"white", fontWeight:800, fontSize:11 })}
                          {btn(() => { setCitaSeleccionada(c); setModal("cancelar-cita"); }, "✕ Cancelar", { flex:1, padding:"7px 0", borderRadius:9, background:"#FFE5E5", color:C.red, fontWeight:800, fontSize:11 })}
                        </>)}
                        {c.status === "confirmada" && (
                          <div style={{ flex:1, textAlign:"center", fontSize:11, fontWeight:800, padding:7, borderRadius:9, background:"#E6FAF0", color:C.sageDark }}>✅ Confirmada</div>
                        )}
                        {c.status === "cancelada" && (
                          <div style={{ flex:1, textAlign:"center", fontSize:11, fontWeight:800, padding:7, borderRadius:9, background:"#FFE5E5", color:C.red }}>❌ Cancelada</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {mdl("confirmar-cita", citaSeleccionada && (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>✅</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Confirmar cita</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>
                    ¿Confirmas tu asistencia el <strong>{new Date(citaSeleccionada.fecha).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</strong> a las <strong>{citaSeleccionada.hora}</strong>?
                  </div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "No aún", { flex:1, padding:9, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => actualizarStatusCita(citaSeleccionada.id, "confirmada"), "✓ Confirmar", { flex:1, padding:9, background:C.green, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("cancelar-cita", citaSeleccionada && (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>❌</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Cancelar cita</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>
                    ¿Deseas cancelar la sesión del <strong>{new Date(citaSeleccionada.fecha).toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}</strong>?
                  </div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "Volver", { flex:1, padding:9, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => actualizarStatusCita(citaSeleccionada.id, "cancelada"), "Sí, cancelar", { flex:1, padding:9, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {usuarioActual?.rol === "psicologo" ? anav("calendario") : bnav("calendario")}
            </div>
          )}

          {/* LOGROS */}
          {!notifPanel && screen === "logros" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(120px + env(safe-area-inset-bottom, 0px))", background:"#F5EDE0" }}>
              <div style={{ background:`linear-gradient(145deg,${C.amberDark},${C.gold})`, padding:"32px 24px 52px", textAlign:"center" }}>
                <div style={{ fontSize:64, marginBottom:10 }}>{getRango(xp).icono}</div>
                <div style={{ fontSize:20, fontWeight:700, color:"white", marginBottom:4 }}>{getRango(xp).nombre}</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{usuarioActual?.nombre?.split(" ")[0] || "Tú"} · {xp} puntos acumulados</div>
              </div>

              <div style={{ padding:"0 16px", marginTop:-24, position:"relative", zIndex:10 }}>
                {/* TARJETA XP */}
                <div style={{ background:"#FEFAF5", borderRadius:14, padding:14, border:"0.5px solid rgba(196,132,90,0.15)", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Tu progreso</div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.amberDark }}>{xp} XP</div>
                  </div>
                  <div style={{ height:10, background:"#F5F0E8", borderRadius:5, overflow:"hidden", marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${Math.min((xp % 50) / 50 * 100, 100)}%`, background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:5, transition:"width 0.5s ease" }}/>
                  </div>
                  <div style={{ fontSize:11, color:C.light }}>
                    {xp < 50 ? `${50 - xp} puntos para Habilis 🖐️` :
                     xp < 100 ? `${100 - xp} puntos para Erectus 🔥` :
                     xp < 150 ? `${150 - xp} puntos para Sapiens 👁️` :
                     xp < 200 ? `${200 - xp} puntos para Sapiens Sapiens 💎` :
                     "¡Has alcanzado el rango máximo! 💎"}
                  </div>
                </div>

                {/* RANGOS */}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Todos los rangos</div>
                {[{min:0,max:49,nombre:"Primigenio",icono:"🪨",desc:"El inicio del camino"},
                  {min:50,max:99,nombre:"Habilis",icono:"🖐️",desc:"Usando las herramientas"},
                  {min:100,max:149,nombre:"Erectus",icono:"🔥",desc:"El fuego interior"},
                  {min:150,max:199,nombre:"Sapiens",icono:"👁️",desc:"La visión interna"},
                  {min:200,max:Infinity,nombre:"Sapiens Sapiens",icono:"💎",desc:"Claridad total"}
                ].map(r => (
                  <div key={r.nombre} style={{ background:"#FEFAF5", borderRadius:14, padding:"11px 14px", marginBottom:9, border:"0.5px solid rgba(196,132,90,0.12)", display:"flex", alignItems:"center", gap:14, opacity:xp >= r.min ? 1 : 0.4 }}>
                    <div style={{ fontSize:32, width:52, height:52, background:xp>=r.min?`${C.amber}20`:"#F5F5F5", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>{r.icono}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{r.nombre}</div>
                      <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{r.desc} · {r.min}–{r.max === Infinity ? "∞" : r.max} pts</div>
                    </div>
                    {xp >= r.min && xp <= r.max && <div style={{ background:`${C.amber}20`, color:C.amberDark, fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20 }}>Actual</div>}
                    {xp > r.max && <div style={{ color:C.sageDark, fontSize:18 }}>✅</div>}
                    {xp < r.min && <div style={{ color:C.light, fontSize:18 }}>🔒</div>}
                  </div>
                ))}

                {/* CÓMO GANAR PUNTOS */}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12, marginTop:4 }}>¿Cómo ganar puntos?</div>
                <div style={{ background:"#FEFAF5", borderRadius:14, overflow:"hidden", border:"0.5px solid rgba(196,132,90,0.12)" }}>
                  {[["📋","Completar tarea","5 pts"],["💡","Guardar nota","2 pts"],["📝","Autorregistro","1 pt"],["📚","Abrir recurso","1 pt"]].map(([ic,lb,pts],i,arr) => (
                    <div key={lb} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.04)":"none" }}>
                      <div style={{ fontSize:20 }}>{ic}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:600, color:C.text }}>{lb}</div>
                      <div style={{ fontSize:13, fontWeight:800, color:C.amberDark }}>{pts}</div>
                    </div>
                  ))}
                </div>
              </div>
              {bnav("logros")}
            </div>
          )}

          {/* PERFIL */}
          {!notifPanel && screen === "perfil" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(120px + env(safe-area-inset-bottom, 0px))", background:darkMode?"#0F0E17":"#F5EDE0" }}>

              {/* HEADER */}
              <div style={{ background:"linear-gradient(160deg,#3A2A1C,#2A1E14)", padding:"28px 20px 40px", textAlign:"center" }}>
                <div onClick={() => setModal("avatar")} style={{ position:"relative", display:"inline-block", marginBottom:10, cursor:"pointer" }}>
                  <div style={{ width:64, height:64, background:"rgba(196,132,90,0.2)", borderRadius:"50%", border:"2px solid rgba(232,168,124,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>{avatar}</div>
                  <div style={{ position:"absolute", bottom:0, right:0, width:20, height:20, background:"#C4845A", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #2A1E14" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </div>
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:"#F5E6D0", marginBottom:3 }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:11, color:"rgba(245,230,208,0.4)", marginBottom:10 }}>{usuarioActual?.email || ""}</div>
                <div style={{ display:"inline-flex", background:"rgba(232,168,124,0.1)", border:"0.5px solid rgba(232,168,124,0.2)", borderRadius:20, padding:"4px 12px", gap:5, alignItems:"center" }}>
                  <span style={{ fontSize:12 }}>{getRango(xp).icono}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:"#E8A87C" }}>{getRango(xp).nombre} · {xp} XP</span>
                </div>
              </div>

              <div style={{ padding:"0 14px", marginTop:-18, position:"relative", zIndex:10 }}>

                {/* MI PSICÓLOGO */}
                <div onClick={async () => { setPsicologoData(null); showScreen("perfil-psicologo"); }}
                  style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.15)", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, marginBottom:12, cursor:"pointer" }}>
                  <div style={{ width:44, height:44, background:"rgba(196,132,90,0.15)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👨‍⚕️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:"rgba(232,168,124,0.5)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>Mi psicólogo</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#F5E6D0" }}>{usuarioActual?.psicologoNombre || "Dr. Rincón"}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,208,0.25)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>

                {/* MI CUENTA */}
                <div style={{ fontSize:11, fontWeight:600, color:"rgba(245,230,208,0.35)", marginBottom:6, letterSpacing:0.8, textTransform:"uppercase" }}>Mi cuenta</div>
                <div style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.08)", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
                  {[
                    { ic:"user", lb:"Cambiar avatar", fn:() => setModal("avatar") },
                    { ic:"edit", lb:"Editar perfil", fn:() => { setEditNombre(usuarioActual?.nombre || ""); setEditTel(usuarioActual?.telefono || ""); setModal("edit-perfil"); } },
                    { ic:"bell", lb:"Notificaciones", fn:() => setNotifPanel(true) },
                  ].map(({ ic, lb, fn }, i, arr) => (
                    <div key={lb} onClick={fn}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:i<arr.length-1?"0.5px solid rgba(232,168,124,0.06)":"none", cursor:"pointer" }}>
                      <div style={{ width:30, height:30, background:"rgba(196,132,90,0.12)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {ic==="user" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        {ic==="edit" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>}
                        {ic==="bell" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                      </div>
                      <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#F5E6D0" }}>{lb}</div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,208,0.2)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  ))}
                </div>

                {/* CONFIGURACIÓN */}
                <div style={{ fontSize:11, fontWeight:600, color:"rgba(245,230,208,0.35)", marginBottom:6, letterSpacing:0.8, textTransform:"uppercase" }}>Configuración</div>
                <div style={{ background:"#2A2018", border:"0.5px solid rgba(232,168,124,0.08)", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
                  <div onClick={() => setModal("privacidad")}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:"0.5px solid rgba(232,168,124,0.06)", cursor:"pointer" }}>
                    <div style={{ width:30, height:30, background:"rgba(196,132,90,0.12)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#F5E6D0" }}>Privacidad y seguridad</div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,208,0.2)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div onClick={() => { const nuevo = !darkMode; setDarkMode(nuevo); localStorage.setItem('darkMode', nuevo); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:"0.5px solid rgba(232,168,124,0.06)", cursor:"pointer" }}>
                    <div style={{ width:30, height:30, background:"rgba(196,132,90,0.12)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                    </div>
                    <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#F5E6D0" }}>{darkMode?"Modo claro":"Modo oscuro"}</div>
                    <div style={{ width:38, height:20, borderRadius:10, background:darkMode?"#C4845A":"rgba(245,230,208,0.15)", position:"relative", transition:"background 0.3s", flexShrink:0 }}>
                      <div style={{ width:14, height:14, borderRadius:"50%", background:"white", position:"absolute", top:3, left:darkMode?21:3, transition:"left 0.3s" }}/>
                    </div>
                  </div>
                  <div onClick={() => { cargarResenas(usuarioActual?.psicologoId); setModal("nueva-resena"); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", cursor:"pointer" }}>
                    <div style={{ width:30, height:30, background:"rgba(196,132,90,0.12)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4845A" strokeWidth="1.75" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#F5E6D0" }}>Valorar a mi psicólogo</div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,208,0.2)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* CERRAR SESIÓN */}
                <div onClick={async () => { await signOut(auth); setUsuarioActual(null); setCitas([]); setInsights([]); setAutorregistros([]); setRecursos([]); setTareasPsicologo([]); showScreen("login"); }}
                  style={{ background:"rgba(239,154,154,0.08)", border:"0.5px solid rgba(239,154,154,0.15)", borderRadius:14, padding:"11px 14px", display:"flex", alignItems:"center", gap:12, marginBottom:8, cursor:"pointer" }}>
                  <div style={{ width:30, height:30, background:"rgba(239,154,154,0.12)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF9A9A" strokeWidth="1.75" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </div>
                  <div style={{ flex:1, fontSize:13, fontWeight:500, color:"#EF9A9A" }}>Cerrar sesión</div>
                </div>

              </div>

              {mdl("avatar", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Elige tu avatar 🐾</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
                    {avatars.map(a => (
                      <div key={a} onClick={() => setAvatar(a)} style={{ aspectRatio:"1", background:avatar===a?"#F0EDF5":"white", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`2px solid ${avatar===a?C.plum:"transparent"}` }}>
                        <div style={{ fontSize:28 }}>{a}</div>
                      </div>
                    ))}
                  </div>
                  {btn(() => { setModal(null); showNotif("Avatar actualizado", "Tu nuevo avatar fue guardado 🐾", "🐾"); }, "Guardar avatar ✓", { width:"100%", padding:14, background:C.plum, color:"white", borderRadius:12, fontSize:13, fontWeight:700 })}
                </div>
              ))}
              {mdl("edit-perfil", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>✏️ Editar perfil</div>
                  <div style={{ fontSize:52, textAlign:"center", marginBottom:14 }}>{avatar}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Nombre</div>
                  <input value={editNombre} onChange={e => setEditNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Teléfono</div>
                  <input value={editTel} onChange={e => setEditTel(e.target.value)}
                    placeholder="Tu teléfono"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Correo</div>
                  <input value={usuarioActual?.email || ""} disabled
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.04)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box", background:"#F5F5F5", color:C.light }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      if (!editNombre.trim()) { showToast("El nombre no puede estar vacío ❌"); return; }
                      try {
                        await updateDoc(doc(db, "usuarios", usuarioActual.uid), { nombre: editNombre, telefono: editTel });
                        setUsuarioActual(prev => ({ ...prev, nombre: editNombre, telefono: editTel }));
                        setModal(null);
                        showNotif("Perfil actualizado", "Tus datos fueron guardados ✅", "✏️");
                      } catch(e) { showToast("Error al guardar ❌"); }
                    }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("privacidad", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>🛡️ Privacidad y seguridad</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Gestiona tu seguridad</div>

    <div style={{ background:"#F0EDF5", borderRadius:14, padding:14, marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:800, color:C.plum, marginBottom:4 }}>🔒 Tu información está protegida</div>
      <div style={{ fontSize:11, color:C.light, lineHeight:1.5 }}>Tus datos están cifrados y solo tú y tu psicólogo pueden acceder a ellos.</div>
    </div>

    {/* NOTIFICACIONES */}
    <div style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:10, border:`2px solid rgba(0,0,0,0.06)` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>🔔 Notificaciones push</div>
          <div style={{ fontSize:11, color:C.light, marginTop:2 }}>
            {usuarioActual?.fcmToken ? "✅ Activadas" : "❌ Desactivadas"}
          </div>
        </div>
        <div onClick={async () => {
          if (usuarioActual?.fcmToken) {
            await updateDoc(doc(db, "usuarios", usuarioActual.uid), { fcmToken: "" });
            setUsuarioActual(prev => ({ ...prev, fcmToken: "" }));
            showToast("🔕 Notificaciones desactivadas");
          } else {
            await activarNotificaciones();
          }
        }}
          style={{
            width:48, height:26, borderRadius:13,
            background: usuarioActual?.fcmToken ? C.plum : C.light,
            position:"relative", cursor:"pointer", transition:"background 0.3s"
          }}>
          <div style={{
            width:20, height:20, borderRadius:"50%", background:"white",
            position:"absolute", top:3,
            left: usuarioActual?.fcmToken ? 25 : 3,
            transition:"left 0.3s", boxShadow:"0 2px 4px rgba(0,0,0,0.2)"
          }}/>
        </div>
      </div>
      <div style={{ fontSize:10, color:C.light, lineHeight:1.5 }}>
        {usuarioActual?.fcmToken
          ? "Recibes notificaciones de citas y mensajes de tu psicólogo."
          : "Activa para recibir recordatorios de citas y mensajes de tu psicólogo."}
      </div>
    </div>

    {btn(() => { setPinAnterior(""); setPinNuevo(""); setPinNuevo2(""); setModal("cambiar-pin"); }, "🔑 Cambiar PIN de acceso", { width:"100%", padding:10, background:"#FEFAF5", color:C.text, borderRadius:12, fontSize:13, fontWeight:800, border:`2px solid rgba(0,0,0,0.08)`, marginBottom:10 })}
    {btn(() => setModal(null), "Cerrar", { width:"100%", padding:9, background:C.warm, color:C.text, borderRadius:12, fontSize:13, fontWeight:800 })}
  </div>
))}

              {mdl("cambiar-pin", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>🔑 Cambiar PIN</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Confirma tu PIN actual antes de cambiarlo</div>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:6 }}>PIN actual</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:6 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width:14, height:14, borderRadius:"50%", background:pinAnterior.length > i ? C.plum : "transparent", border:`2.5px solid ${pinAnterior.length > i ? C.plum : C.light}`, transition:"all 0.2s" }}/>
                    ))}
                  </div>
                  <input type="password" placeholder="PIN actual" inputMode="numeric" maxLength={4} value={pinAnterior} onChange={e => setPinAnterior(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box", textAlign:"center", letterSpacing:6 }}/>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:6 }}>Nuevo PIN</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:6 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width:14, height:14, borderRadius:"50%", background:pinNuevo.length > i ? C.sage : "transparent", border:`2.5px solid ${pinNuevo.length > i ? C.sage : C.light}`, transition:"all 0.2s" }}/>
                    ))}
                  </div>
                  <input type="password" placeholder="Nuevo PIN" inputMode="numeric" maxLength={4} value={pinNuevo} onChange={e => setPinNuevo(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box", textAlign:"center", letterSpacing:6 }}/>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:6 }}>Confirmar nuevo PIN</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:6 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width:14, height:14, borderRadius:"50%", background:pinNuevo2.length > i ? C.amber : "transparent", border:`2.5px solid ${pinNuevo2.length > i ? C.amber : C.light}`, transition:"all 0.2s" }}/>
                    ))}
                  </div>
                  <input type="password" placeholder="Confirmar PIN" inputMode="numeric" maxLength={4} value={pinNuevo2} onChange={e => setPinNuevo2(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:16, outline:"none", fontFamily:"inherit", boxSizing:"border-box", textAlign:"center", letterSpacing:6 }}/>

                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal("privacidad"); setPinAnterior(""); setPinNuevo(""); setPinNuevo2(""); }, "← Volver", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      if (pinAnterior.length < 4) { showToast("Ingresa tu PIN actual ❌"); return; }
                      if (pinNuevo.length < 4) { showToast("El nuevo PIN debe tener 4 dígitos ❌"); return; }
                      if (pinNuevo !== pinNuevo2) { showToast("Los PINs no coinciden ❌"); return; }
                      try {
                        await signInWithEmailAndPassword(auth, usuarioActual.email, pinAnterior + "**");
                        await updateDoc(doc(db, "usuarios", usuarioActual.uid), { pin: pinNuevo });
                        setModal(null);
                        setPinAnterior(""); setPinNuevo(""); setPinNuevo2("");
                        showNotif("PIN actualizado", "Tu PIN fue cambiado exitosamente 🔒", "🔒");
                      } catch(e) { showToast("PIN actual incorrecto ❌"); }
                    }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("nueva-resena", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>⭐ Valorar a mi psicólogo</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:6 }}>Tu reseña es anónima y pública en su perfil</div>
                  {usuarioActual?.psicologoId && (
                    <div style={{ background:`linear-gradient(135deg,${C.dark},${C.plum})`, borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div style={{ fontSize:24 }}>👨‍⚕️</div>
                      <div style={{ fontSize:13, fontWeight:800, color:"white" }}>{usuarioActual?.psicologoNombre || "Tu psicólogo"}</div>
                    </div>
                  )}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:10 }}>Calificación</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} onClick={() => setResenaRating(i)}
                        style={{ fontSize:32, cursor:"pointer", opacity:resenaRating >= i ? 1 : 0.3, transition:"all 0.2s" }}>⭐</div>
                    ))}
                  </div>
                  <textarea placeholder="Cuéntanos tu experiencia..." value={resenaTexto} onChange={e => setResenaTexto(e.target.value)}
                    style={{ width:"100%", minHeight:100, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>
                  <div style={{ background:"#FFF8E1", borderRadius:10, padding:"10px 12px", marginBottom:16, fontSize:11, color:C.amberDark, fontWeight:700 }}>🔒 Tu identidad permanecerá anónima</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => enviarResena(), loadingResenas ? "Enviando..." : "Enviar reseña ✓", { flex:2, padding:11, background:loadingResenas?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {bnav("perfil")}
            </div>
          )}
          {/* PERFIL PSICÓLOGO — vista paciente */}
          {!notifPanel && screen === "perfil-psicologo" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(120px + env(safe-area-inset-bottom, 0px))", background:"#F5EDE0" }}>
              <div style={{ background:"linear-gradient(160deg,#3A2A1C,#2A1E14)", padding:"24px 20px 44px", paddingTop:"max(24px, env(safe-area-inset-top, 24px))", textAlign:"center", position:"relative" }}>
                <div onClick={() => showScreen("perfil")} style={{ position:"absolute", top:"max(20px, env(safe-area-inset-top, 20px))", left:20, fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.7)" }}>←</div>
                {psicologoData?.foto ? (
                  <img src={psicologoData.foto} alt="foto" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(255,255,255,0.2)", margin:"0 auto 14px", display:"block" }}/>
                ) : (
                  <div style={{ width:80, height:80, background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 14px", border:"3px solid rgba(255,255,255,0.2)" }}>👨‍⚕️</div>
                )}
                <div style={{ fontSize:22, fontWeight:900, color:"white", marginBottom:4 }}>{psicologoData?.nombre || usuarioActual?.psicologoNombre || "Mi psicólogo"}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:12 }}>Psicólogo Clínico</div>
                <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                  {psicologoData?.especialidad && <span style={{ background:"rgba(255,255,255,0.12)", color:"white", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>🧠 {psicologoData.especialidad}</span>}
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:6 }}>Psicólogo Clínico</div>
              </div>

              <div style={{ padding:"0 16px", marginTop:-24, position:"relative", zIndex:10 }}>
                {/* INFO */}
                <div style={{ background:"#FEFAF5", borderRadius:14, padding:18, marginBottom:14, boxShadow:"0 4px 20px rgba(0,0,0,0.07)" }}>
                  {[["📞","Teléfono", psicologoData?.telefono || "No registrado"],["📧","Correo", psicologoData?.email || ""],["🎓","Especialidad", psicologoData?.especialidad || "No registrado"],["🔬","Enfoque", psicologoData?.enfoque || "No registrado"]].map(([ic,lb,val],i,arr) => (
                    <div key={lb} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.04)":"none" }}>
                      <div style={{ fontSize:18, width:32, textAlign:"center", flexShrink:0 }}>{ic}</div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:C.light, textTransform:"uppercase", marginBottom:2 }}>{lb}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RESEÑAS */}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>⭐ Reseñas</div>
                {loadingResenas ? (
                  <div style={{ textAlign:"center", padding:20, color:C.light }}>Cargando...</div>
                ) : resenas.length === 0 ? (
                  <div style={{ background:"#FEFAF5", borderRadius:14, padding:20, textAlign:"center", border:"0.5px solid rgba(196,132,90,0.12)" }}>
                    <div style={{ fontSize:11, color:C.light }}>Aún no hay reseñas</div>
                  </div>
                ) : (
                  <>
                    <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:16, padding:16, marginBottom:12, textAlign:"center" }}>
                      <div style={{ fontSize:32, fontWeight:900, color:"white" }}>{(resenas.reduce((a,r) => a+r.rating, 0) / resenas.length).toFixed(1)} ⭐</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{resenas.length} reseña{resenas.length !== 1 ? "s" : ""}</div>
                    </div>
                    {resenas.map(r => (
                      <div key={r.id} style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:9, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div style={{ fontSize:14 }}>{"⭐".repeat(r.rating)}</div>
                          <div style={{ fontSize:10, color:C.light }}>{new Date(r.fecha).toLocaleDateString('es-CO')}</div>
                        </div>
                        <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{r.texto}</div>
                        <div style={{ fontSize:10, color:C.light, marginTop:6, fontStyle:"italic" }}>— Paciente anónimo</div>
                      </div>
                    ))}
                  </>
                )}

                {btn(() => { cargarResenas(usuarioActual?.psicologoId); setModal("nueva-resena"); }, "⭐ Escribir reseña", { width:"100%", padding:10, background:C.plum, color:"white", borderRadius:12, fontSize:13, fontWeight:800, marginTop:8, display:"block" })}
              </div>
              {mdl("nueva-resena", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>⭐ Valorar a mi psicólogo</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:6 }}>Tu reseña es anónima y pública en su perfil</div>
                  {usuarioActual?.psicologoId && (
                    <div style={{ background:`linear-gradient(135deg,${C.dark},${C.plum})`, borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div style={{ fontSize:24 }}>👨‍⚕️</div>
                      <div style={{ fontSize:13, fontWeight:800, color:"white" }}>{usuarioActual?.psicologoNombre || "Tu psicólogo"}</div>
                    </div>
                  )}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:10 }}>Calificación</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} onClick={() => setResenaRating(i)}
                        style={{ fontSize:32, cursor:"pointer", opacity:resenaRating >= i ? 1 : 0.3, transition:"all 0.2s" }}>⭐</div>
                    ))}
                  </div>
                  <textarea placeholder="Cuéntanos tu experiencia..." value={resenaTexto} onChange={e => setResenaTexto(e.target.value)}
                    style={{ width:"100%", minHeight:100, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>
                  <div style={{ background:"#FFF8E1", borderRadius:10, padding:"10px 12px", marginBottom:16, fontSize:11, color:C.amberDark, fontWeight:700 }}>🔒 Tu identidad permanecerá anónima</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => enviarResena(), loadingResenas ? "Enviando..." : "Enviar reseña ✓", { flex:2, padding:11, background:loadingResenas?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {bnav("perfil")}
            </div>
          )}    
          {/* MIS PACIENTES */}
          {!notifPanel && screen === "psi-dashboard" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))", background:"#F5EDE0" }}>
              <div style={{ background:"linear-gradient(160deg,#3A2A1C,#2A1E14)", padding:"16px 18px 20px", paddingTop:"max(16px, env(safe-area-inset-top, 16px))", display:"flex", alignItems:"center", gap:12 }}>
                <div onClick={() => showScreen("admin-perfil")} style={{ fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.7)" }}>←</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:"white" }}>👥 Mis pacientes</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} activo{pacientes.length !== 1 ? "s" : ""}</div>
                </div>
                <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer" }}>
                  <div style={{ fontSize:24 }}>🔔</div>
                  {unread > 0 && <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"white", border:`2px solid ${C.plum}` }}>{unread}</div>}
                </div>
              </div>

              <div style={{ padding:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:18 }}>
                  {[[pacientes.length,"Pacientes"],[citas.filter(c=>c.status==="pendiente").length,"Pendientes"],[citas.filter(c=>c.status==="confirmada").length,"Confirmadas"]].map(([n,l]) => (
                    <div key={l} style={{ background:"#FEFAF5", borderRadius:14, padding:13, textAlign:"center", border:"0.5px solid rgba(196,132,90,0.12)" }}>
                      <div style={{ fontSize:17, fontWeight:700, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* ALERTAS INTELIGENTES */}
                {(() => {
                  const hoy = new Date().toISOString().split('T')[0];
                  const citasHoy = citas.filter(c => c.fecha === hoy);
                  const recursosRecibidos = recursos.filter(r => r.recibido);
                  if (citasHoy.length === 0 && recursosRecibidos.length === 0) return null;
                  return (
                    <div style={{ background:C.cardBg, borderRadius:16, padding:14, marginBottom:14, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:10 }}>🔔 Alertas del día</div>
                      {citasHoy.map(c => (
                        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`0.5px solid ${darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"}` }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:C.plum, flexShrink:0 }}/>
                          <div style={{ flex:1, fontSize:12, color:C.text }}>Cita con <strong>{c.pacienteNombre}</strong> hoy a las {c.hora}</div>
                        </div>
                      ))}
                      {recursosRecibidos.slice(0,3).map(r => (
                        <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`0.5px solid ${darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"}` }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, flexShrink:0 }}/>
                          <div style={{ flex:1, fontSize:12, color:C.text }}><strong>{r.pacienteNombre}</strong> recibió "{r.nombre}" ✅</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* CITAS HOY */}
                {citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length > 0 && (
                  <>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📅 Citas de hoy</div>
                    {citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).map(c => (
                      <div key={c.id} style={{ background:"#FEFAF5", borderRadius:14, padding:"12px 14px", marginBottom:9, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${C.sage}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{c.pacienteNombre}</div>
                            <div style={{ fontSize:11, color:C.light }}>⏰ {c.hora} · {c.modalidad === "virtual" ? "💻 Virtual" : "🏥 Presencial"}</div>
                          </div>
                          <div style={{ background:c.status==="confirmada"?"#E6FAF0":"#FFF8E1", color:c.status==="confirmada"?C.sageDark:C.amberDark, fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>
                            {c.status==="confirmada"?"✅ Confirmada":"⏳ Pendiente"}
                          </div>
                        </div>
                        {c.modalidad==="virtual" && c.link && (
                          <a href={c.link} target="_blank" rel="noreferrer"
                            style={{ display:"block", marginTop:8, padding:"7px 0", background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:9, fontSize:11, fontWeight:800, textAlign:"center", textDecoration:"none" }}>
                            🎥 Unirse ahora
                          </a>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* LISTA PACIENTES */}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>👤 Lista de pacientes</div>
                {pacientes.length === 0 ? (
                  <div style={{ textAlign:"center", padding:40, color:C.light }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>👥</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>Sin pacientes aún</div>
                    <div style={{ fontSize:12, marginTop:4 }}>El admin debe crear y asignarte pacientes</div>
                  </div>
                ) : (
                  pacientes.map(p => (
                    <div key={p.id} onClick={() => { setPacienteSeleccionado(p); cargarTareasPsicologo(p.id, usuarioActual.uid); cargarRecursosPsicologo(p.id, usuarioActual.uid); cargarAutorregistros(p.id); cargarNotasClinicas(p.id); cargarRegistrosAnimo(p.id); showScreen("admin-paciente"); }}
                      style={{ background:"#FEFAF5", borderRadius:14, padding:"11px 14px", display:"flex", alignItems:"center", gap:12, marginBottom:9, border:"0.5px solid rgba(196,132,90,0.12)", cursor:"pointer" }}>
                      <div style={{ width:46, height:46, background:`linear-gradient(135deg,${C.plum}20,${C.sage}20)`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👤</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.nombre}</div>
                        <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{p.email}</div>
                        {p.telefono && <div style={{ fontSize:10, color:C.light }}>📞 {p.telefono}</div>}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                        <div style={{ background:"#E8F5E9", color:C.sageDark, fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>Activo</div>
                        <div style={{ color:C.light, fontSize:18 }}>›</div>
                      </div>
                    </div>
                  ))
                )}

                {/* BOTÓN AGENDAR */}
                {btn(() => setModal("agendar-cita"), "📅 Agendar nueva cita", { width:"100%", padding:10, background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:12, fontSize:13, fontWeight:800, marginTop:8, display:"block" })}
                {btn(() => setModal("crear-recordatorio"), "🔔 Nuevo recordatorio", {
  width:"100%", padding:10, background:"#FEFAF5", color:C.text,
  borderRadius:12, fontSize:13, fontWeight:800,
  border:`2px solid rgba(0,0,0,0.08)`, marginBottom:8, marginTop:8
})}

{recordatorios.filter(r => r.pacienteId === pacienteSeleccionado?.id).length > 0 && (
  <div style={{ marginTop:12 }}>
    <div style={{ fontSize:12, fontWeight:800, color:C.light, marginBottom:8 }}>RECORDATORIOS ACTIVOS</div>
    {recordatorios
      .filter(r => r.pacienteId === pacienteSeleccionado?.id)
      .map(r => (
        <div key={r.id} style={{ background:"#FEFAF5", borderRadius:12, padding:12, marginBottom:8, border:`2px solid rgba(0,0,0,0.06)` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{r.titulo}</div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <div onClick={() => toggleRecordatorio(r.id, r.activo)}
                style={{ width:36, height:20, borderRadius:10, background:r.activo ? C.plum : C.light, position:"relative", cursor:"pointer" }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:"white", position:"absolute", top:3, left:r.activo ? 19 : 3, transition:"left 0.3s" }}/>
              </div>
              <div onClick={() => eliminarRecordatorio(r.id)} style={{ fontSize:16, cursor:"pointer" }}>🗑️</div>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.light }}>
            🕐 {r.hora} · {["D","L","M","X","J","V","S"].filter((_,i) => r.diasSemana.includes(i)).join(", ")}
          </div>
          <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{r.mensaje}</div>
        </div>
      ))}
  </div>
)}
              </div>

              {mdl("agendar-cita", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📅 Agendar cita</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>El paciente verá la cita en su calendario</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Paciente</div>
                  <select value={citaPacienteId} onChange={e => setCitaPacienteId(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", background:"#FEFAF5", boxSizing:"border-box" }}>
                    <option value="">— Seleccionar paciente —</option>
                    {pacientes.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                  </select>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Fecha</div>
                  <input type="date" value={citaFecha} onChange={e => setCitaFecha(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Hora</div>
                  <input type="time" value={citaHora} onChange={e => setCitaHora(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Modalidad</div>
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    {[["presencial","🏥","Presencial"],["virtual","💻","Virtual"]].map(([val,ic,lb]) => (
                      <div key={val} onClick={() => setCitaModalidad(val)}
                        style={{ flex:1, padding:"10px 0", borderRadius:12, textAlign:"center", cursor:"pointer", border:`2px solid ${citaModalidad===val?C.plum:"rgba(0,0,0,0.08)"}`, background:citaModalidad===val?`${C.plum}15`:"white" }}>
                        <div style={{ fontSize:22 }}>{ic}</div>
                        <div style={{ fontSize:11, fontWeight:800, color:citaModalidad===val?C.plum:C.light }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                  {citaModalidad === "virtual" && (
                    <>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>🔗 Link de Meet</div>
                      <input placeholder="https://meet.google.com/xxx" value={citaLink} onChange={e => setCitaLink(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                    </>
                  )}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>📝 Notas para el paciente</div>
                  <textarea placeholder="Ej: Recuerda traer tu diario..." value={citaNotas} onChange={e => setCitaNotas(e.target.value)}
                    style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => crearCita(), loadingCitas ? "Agendando..." : "Agendar ✓", { flex:2, padding:11, background:loadingCitas?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("crear-recordatorio", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>🔔 Nuevo recordatorio</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Se enviará automáticamente al paciente</div>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
    <input value={recTitulo} onChange={e => setRecTitulo(e.target.value)} placeholder="Ej: 💪 ¡Hoy toca gym!"
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Mensaje</div>
    <textarea value={recMensaje} onChange={e => setRecMensaje(e.target.value)} placeholder="Ej: Recuerda que hoy tienes entrenamiento 🏋️"
      style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Hora de envío</div>
    <input type="time" value={recHora} onChange={e => setRecHora(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Días de la semana</div>
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {[["D",0],["L",1],["M",2],["X",3],["J",4],["V",5],["S",6]].map(([label, dia]) => (
        <div key={dia} onClick={() => setRecDias(prev =>
          prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        )} style={{
          width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800, cursor:"pointer",
          background: recDias.includes(dia) ? C.plum : "white",
          color: recDias.includes(dia) ? "white" : C.text,
          border: `2px solid ${recDias.includes(dia) ? C.plum : "rgba(0,0,0,0.08)"}`
        }}>{label}</div>
      ))}
    </div>
    <div style={{ background:C.warm, borderRadius:11, padding:10, marginBottom:16 }}>
      <div style={{ fontSize:11, color:C.light, lineHeight:1.5 }}>
        📍 La notificación llegará a las <strong>{recHora || "--:--"}</strong> hora del paciente
        {recDias.length > 0 && ` los días seleccionados`}
      </div>
    </div>
    <div style={{ display:"flex", gap:8 }}>
      {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
      {btn(() => crearRecordatorio(), loadingRec ? "Guardando..." : "Guardar 🔔", { flex:2, padding:11, background:loadingRec ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
    </div>
  </div>
))}
              {anav("psi-dashboard")}
            </div>
          )}
          {/* ADMIN SaaS HOME */}
{!notifPanel && screen === "admin-home" && (
  <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))" }}>
    <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"18px 22px 22px", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ fontSize:34 }}>👑</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:16, fontWeight:700, color:"white" }}>Panel Administrador</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>Mipsicologo · Control total</div>
      </div>
    </div>
    <div style={{ padding:14 }}>

      {/* ESTADÍSTICAS */}
      <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📊 Estadísticas generales</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:9, marginBottom:18 }}>
        {[["🧠","Psicólogos activos","3"],["👥","Pacientes totales","68"],["💰","Ingresos del mes","$1.2M"],["⚠️","Cuentas inactivas","5"]].map(([ic,lb,val]) => (
          <div key={lb} style={{ background:"#FEFAF5", borderRadius:14, padding:13, border:"0.5px solid rgba(196,132,90,0.12)" }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{ic}</div>
            <div style={{ fontSize:20, fontWeight:900, color:C.plum }}>{val}</div>
            <div style={{ fontSize:10, color:C.light, fontWeight:700 }}>{lb}</div>
          </div>
        ))}
      </div>

      {/* PSICÓLOGOS */}
      <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>🧠 Psicólogos</div>
      {[["Dr. Danilo Rincón","23 pacientes","Activo"],["Dra. Laura Gómez","18 pacientes","Activo"],["Dr. Carlos Mejía","12 pacientes","Inactivo"]].map(([nombre,sub,status]) => (
        <div key={nombre} style={{ background:"#FEFAF5", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:7, border:"0.5px solid rgba(196,132,90,0.12)" }}>
          <div style={{ fontSize:26, width:42, height:42, background:C.warm, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center" }}>🧠</div>
          <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>{nombre}</div><div style={{ fontSize:10, color:C.light }}>{sub}</div></div>
          <div style={{ marginLeft:"auto", background:status==="Activo"?"#A8C5B5":"#FFE0E0", color:status==="Activo"?C.sageDark:C.red, fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>{status}</div>
        </div>
      ))}

      {/* ACCIONES */}
      <div style={{ fontSize:13, fontWeight:700, color:C.text, margin:"16px 0 10px" }}>⚡ Acciones</div>
      {mitem("➕", "Agregar usuario", () => setModal("registro-admin"))}
{mitem("👥", "Ver y gestionar usuarios", () => { cargarTodosUsuarios(); setModal("gestionar-usuarios"); })}
{mitem("💰", "Gestión de pagos", () => showNotif("Pagos", "Función disponible pronto", "💰"))}
{mitem("📊", "Ver reportes", () => showNotif("Reportes", "Función disponible pronto", "📊"))}

{mdl("gestionar-usuarios", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>👥 Gestionar usuarios</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:14 }}>Selecciona usuarios para eliminar o desactivar</div>

    {usuariosSeleccionados.length > 0 && (
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {btn(() => handleEliminarUsuarios(), `🗑️ Eliminar (${usuariosSeleccionados.length})`, { flex:1, padding:10, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
        {btn(() => setUsuariosSeleccionados([]), "✕ Quitar selección", { flex:1, padding:10, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
      </div>
    )}

    {loadingUsuarios ? (
      <div style={{ textAlign:"center", padding:20, color:C.light, fontSize:13 }}>Cargando usuarios...</div>
    ) : todosUsuarios.length === 0 ? (
      <div style={{ textAlign:"center", padding:20, color:C.light, fontSize:13 }}>No hay usuarios registrados</div>
    ) : (
      todosUsuarios.map(u => (
        <div key={u.id} style={{ background:usuariosSeleccionados.includes(u.id)?"#F0EDF5":"white", borderRadius:13, padding:"11px 13px", marginBottom:8, border:"0.5px solid rgba(196,132,90,0.12)", border:`2px solid ${usuariosSeleccionados.includes(u.id)?C.plum:"transparent"}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div onClick={() => toggleSeleccion(u.id)} style={{ width:22, height:22, borderRadius:6, border:`2px solid ${usuariosSeleccionados.includes(u.id)?C.plum:C.light}`, background:usuariosSeleccionados.includes(u.id)?C.plum:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"white", cursor:"pointer", flexShrink:0 }}>
              {usuariosSeleccionados.includes(u.id) ? "✓" : ""}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{u.nombre}</div>
              <div style={{ fontSize:10, color:C.light }}>{u.email}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <span style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, background:u.rol==="psicologo"?"#EDE8F5":"#E8F5E9", color:u.rol==="psicologo"?C.plum:C.sageDark }}>
                  {u.rol==="psicologo"?"🧠 Psicólogo":"👤 Paciente"}
                </span>
                <span style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, background:u.inactivo?"#FFE5E5":"#E8F5E9", color:u.inactivo?C.red:C.sageDark }}>
                  {u.inactivo?"🔒 Inactivo":"✅ Activo"}
                </span>
              </div>
            </div>
            {btn(() => handleToggleInactivo(u.id, u.inactivo), u.inactivo?"Activar":"Desactivar", { padding:"6px 10px", background:u.inactivo?"#E8F5E9":"#FFE5E5", color:u.inactivo?C.sageDark:C.red, borderRadius:9, fontSize:10, fontWeight:800 })}
          </div>
        </div>
      ))
    )}

    {btn(() => setModal(null), "Cerrar", { width:"100%", padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:13, fontWeight:800, marginTop:8 })}
  </div>
))}
{mdl("registro-admin", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>➕ Crear usuario</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>El usuario recibirá acceso inmediato</div>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Nombre completo</div>
    <input placeholder="Ej: Sofía Martínez" value={formNombre} onChange={e => setFormNombre(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Correo electrónico</div>
    <input type="email" placeholder="correo@ejemplo.com" value={formEmail} onChange={e => setFormEmail(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Teléfono</div>
    <input type="tel" placeholder="Ej: 3001234567" value={formTel} onChange={e => setFormTel(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Fecha de nacimiento</div>
    <input type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>PIN de acceso (4 dígitos)</div>
    <div style={{ display:"flex", justifyContent:"center", gap:14, marginBottom:8 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ width:16, height:16, borderRadius:"50%", background:formPin.length > i ? C.plum : "transparent", border:`2.5px solid ${formPin.length > i ? C.plum : C.light}`, transition:"all 0.2s" }}/>
      ))}
    </div>
    <input type="password" placeholder="PIN" inputMode="numeric" maxLength={4} value={formPin} onChange={e => setFormPin(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box", textAlign:"center", letterSpacing:4 }}/>

    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Rol</div>
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {[["paciente","👤","Paciente"],["psicologo","🧠","Psicólogo"]].map(([val,ic,lb]) => (
        <div key={val} onClick={() => setFormRol(val)}
          style={{ flex:1, padding:"10px 0", borderRadius:12, textAlign:"center", cursor:"pointer", border:`2px solid ${formRol===val?C.plum:"rgba(0,0,0,0.08)"}`, background:formRol===val?`${C.plum}15`:"white" }}>
          <div style={{ fontSize:22 }}>{ic}</div>
          <div style={{ fontSize:11, fontWeight:800, color:formRol===val?C.plum:C.light }}>{lb}</div>
        </div>
      ))}
    </div>
{formRol === "paciente" && (
      <>
        <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8, marginTop:4 }}>Psicólogo asignado</div>
        <select value={formPsicologoId} onChange={e => setFormPsicologoId(e.target.value)}
          style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:16, outline:"none", fontFamily:"inherit", background:"#FEFAF5", boxSizing:"border-box" }}>
          <option value="">— Seleccionar psicólogo —</option>
          {todosUsuarios.filter(u => u.rol === "psicologo").map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </>
    )}
    <div style={{ display:"flex", gap:8 }}>
      {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
      {btn(() => handleCrearUsuarioAdmin(), formLoading ? "Creando..." : "Crear usuario ✓", { flex:2, padding:11, background:formLoading?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
    </div>
  </div>
))}

    </div>
    {anav("admin-home")}
  </div>
)}

          {/* ADMIN PACIENTE */}
          {!notifPanel && screen === "admin-paciente" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))" }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"16px 22px 20px", paddingTop:"max(16px, env(safe-area-inset-top, 16px))", display:"flex", alignItems:"center", gap:14 }}>
                <div onClick={() => showScreen("psi-dashboard")} style={{ fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.8)" }}>←</div>
                <div style={{ width:50, height:50, background:"rgba(255,255,255,0.15)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👤</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:900, color:"white" }}>{pacienteSeleccionado?.nombre || "Paciente"}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{pacienteSeleccionado?.email || ""}</div>
                </div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {[[autorregistros.length,"Registros"],[citas.filter(c=>c.pacienteId===pacienteSeleccionado?.id).length,"Sesiones"],[pacienteSeleccionado?.xp||0,"XP"]].map(([n,l]) => (
                    <div key={l} style={{ background:"#FEFAF5", borderRadius:13, padding:"12px 8px", textAlign:"center", border:"0.5px solid rgba(196,132,90,0.12)" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:12, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                  <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:12 }}>📊 Estado de ánimo — últimos 7 días</div>
                  {registrosAnimo.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"16px 0", color:C.light, fontSize:12 }}>El paciente aún no ha registrado su ánimo</div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:70 }}>
                      {registrosAnimo.slice(-14).map((r, i) => {
                        const colores = [C.red, C.amber, C.light, C.sage, C.green];
                        const emojis = ["😞","😕","😐","🙂","😄"];
                        const altura = [12,24,36,50,64][r.valor];
                        const col = colores[r.valor];
                        return (
                          <div key={r.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                            <div style={{ fontSize:10 }}>{emojis[r.valor]}</div>
                            <div style={{ width:"100%", height:altura, borderRadius:"4px 4px 0 0", background:col, opacity:0.85 }}/>
                            <div style={{ fontSize:8, color:C.light, fontWeight:700 }}>{new Date(r.fecha).getDate()}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📝 Autorregistros recientes</div>
                {autorregistros.length === 0 ? (
                  <div style={{ background:"#FEFAF5", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>
                    El paciente aún no tiene autorregistros
                  </div>
                ) : autorregistros.slice(0,3).map(ar => (
                  <div key={ar.id} style={{ background:"#FEFAF5", borderRadius:16, padding:16, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${C.plum}` }}>
                    <div style={{ fontSize:11, color:C.light, fontWeight:700, marginBottom:4 }}>📅 {ar.fecha}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:4 }}>¿Qué estaba haciendo?</div>
                    <div style={{ fontSize:12, color:C.light, lineHeight:1.5, marginBottom:6 }}>{ar.haciendo}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:4 }}>¿Qué sucedió?</div>
                    <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>{ar.sucedio}</div>
                  </div>
                ))}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, margin:"16px 0 10px" }}>⚡ Acciones</div>
                {btn(() => setModal("assign-task"), "📋 Asignar nueva tarea", { width:"100%", padding:9, background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, color:"white", borderRadius:13, fontSize:13, fontWeight:800, marginBottom:10 })}
                {mitem("💬", "Nota clínica privada", () => setModal("feedback"))}
                {mitem("📅", "Agendar cita", () => setModal("agendar-cita"))}
                {mitem("🔔", "Programar notificación", () => setModal("programar-notif"))}
                {mitem("🔔", "Recordatorios recurrentes", () => setModal("crear-recordatorio"))}
                {mitem("📤", "Enviar material", () => setModal("enviar-material"))}
                {recordatorios.filter(r => r.pacienteId === pacienteSeleccionado?.id).length > 0 && (
  <div style={{ marginTop:4, marginBottom:4 }}>
    <div style={{ fontSize:12, fontWeight:800, color:C.light, margin:"12px 0 8px" }}>RECORDATORIOS ACTIVOS</div>
    {recordatorios
      .filter(r => r.pacienteId === pacienteSeleccionado?.id)
      .map(r => (
        <div key={r.id} style={{ background:"#FEFAF5", borderRadius:12, padding:12, marginBottom:8, border:`2px solid rgba(0,0,0,0.06)` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{r.titulo}</div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <div onClick={() => toggleRecordatorio(r.id, r.activo)}
                style={{ width:36, height:20, borderRadius:10, background:r.activo ? C.plum : C.light, position:"relative", cursor:"pointer" }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:"white", position:"absolute", top:3, left:r.activo ? 19 : 3, transition:"left 0.3s" }}/>
              </div>
              <div onClick={() => eliminarRecordatorio(r.id)} style={{ fontSize:16, cursor:"pointer" }}>🗑️</div>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.light }}>
            🕐 {r.hora} · {["D","L","M","X","J","V","S"].filter((_,i) => r.diasSemana.includes(i)).join(", ")}
          </div>
          <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{r.mensaje}</div>
        </div>
      ))}
  </div>
)}
<div style={{ fontSize:13, fontWeight:700, color:C.text, margin:"16px 0 10px" }}>📤 Materiales enviados</div>
{recursos.length === 0 ? (
  <div style={{ background:"#FEFAF5", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>No hay materiales enviados aún</div>
) : recursos.map(r => (
  <div key={r.id} style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${r.recibido ? C.green : C.sage}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${C.plum}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
          {r.tipo==="PDF"?"📄":r.tipo==="Audio"?"🎵":r.tipo==="Video"?"🎬":r.tipo==="Imagen"?"🖼️":"📎"}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{r.nombre}</div>
          <div style={{ fontSize:10, color:C.light }}>{r.tipo}</div>
        </div>
      </div>
      <div style={{ fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:20, background:r.recibido ? "#E8F5E9" : "#FFF3E0", color:r.recibido ? C.green : C.amber }}>
        {r.recibido ? "✅ Recibido" : "⏳ Pendiente"}
      </div>
    </div>
    <div style={{ display:"flex", justifyContent:"flex-end" }}>
      {btn(() => { setRecursoAEliminar(r); setModal("confirmar-eliminar-recurso"); }, "🗑️ Eliminar", { padding:"6px 12px", borderRadius:9, background:"#FFE5E5", color:C.red, fontSize:11, fontWeight:800 })}
    </div>
  </div>
))}
<div style={{ fontSize:13, fontWeight:700, color:C.text, margin:"16px 0 10px" }}>📋 Tareas asignadas</div>
{tareasPsicologo.length === 0 ? (
  <div style={{ background:"#FEFAF5", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>No hay tareas asignadas aún</div>
) : tareasPsicologo.map(t => (
  <div key={t.id} style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:`4px solid ${t.completada ? C.green : C.sage}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
      <div style={{ fontSize:13, fontWeight:800, color:C.text, flex:1 }}>{t.titulo}</div>
      <div style={{ fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:20, background:t.completada ? "#E8F5E9" : "#FFF3E0", color:t.completada ? C.green : C.amber }}>{t.completada ? "✅ Completada" : "⏳ Pendiente"}</div>
    </div>
    {t.descripcion ? <div style={{ fontSize:11, color:C.light, marginBottom:6, lineHeight:1.5 }}>{t.descripcion}</div> : null}
    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
      <div style={{ fontSize:10, color:C.amber, fontWeight:700 }}>⭐ +{t.xp} XP</div>
      {t.vence ? <div style={{ fontSize:10, color:C.light, fontWeight:700 }}>📅 Vence: {t.vence}</div> : null}
    </div>
    {t.respuesta ? (
      <div style={{ marginTop:8, background:"#F5F0FF", borderRadius:10, padding:"8px 10px" }}>
        <div style={{ fontSize:10, fontWeight:800, color:C.plum, marginBottom:3 }}>💬 Respuesta del paciente:</div>
        <div style={{ fontSize:11, color:C.text, lineHeight:1.5 }}>{t.respuesta}</div>
      </div>
    ) : null}
  </div>
))}
                <div style={{ fontSize:13, fontWeight:700, color:C.text, margin:"16px 0 10px" }}>🔒 Notas clínicas</div>
                {notasClinicas.length === 0 ? (
                  <div style={{ background:"#FEFAF5", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>
                    Aún no has escrito notas clínicas para este paciente
                  </div>
                ) : notasClinicas.map(n => (
                  <div key={n.id} style={{ background:"#FEFAF5", borderRadius:14, padding:14, border:"0.5px solid rgba(196,132,90,0.12)", borderLeft:"3px solid #8B7BA0", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ fontSize:12, fontWeight:800, color:C.text }}>{n.titulo}</div>
                      <div style={{ fontSize:10, color:C.light }}>{new Date(n.creadaEn).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</div>
                    </div>
                    <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>{n.texto}</div>
                    <div style={{ display:"inline-block", background:"#F0EDF5", color:C.plum, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, marginTop:5 }}>🔒 Solo visible para ti</div>
                  </div>
                ))}
              </div>
              {mdl("assign-task", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📋 Asignar tarea</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:14 }}>Para: <strong>{pacienteSeleccionado?.nombre}</strong></div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
                  <input placeholder="Ej: Registro de pensamientos..." value={tareaTitulo} onChange={e => setTareaTitulo(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Descripción / instrucciones</div>
                  <textarea placeholder="Explica qué debe hacer el paciente..." value={tareaDescripcion} onChange={e => setTareaDescripcion(e.target.value)}
                    style={{ width:"100%", minHeight:80, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>⭐ XP al completar</div>
                      <input type="number" value={tareaXP} onChange={e => setTareaXP(Number(e.target.value))}
                        style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>📅 Fecha límite</div>
                      <div onClick={() => { setTareaSinFecha(!tareaSinFecha); setTareaVence(""); }}
                        style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7, cursor:"pointer" }}>
                        <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${tareaSinFecha ? C.sage : "rgba(0,0,0,0.15)"}`, background:tareaSinFecha ? C.sage : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {tareaSinFecha && <span style={{ color:"white", fontSize:11, fontWeight:900 }}>✓</span>}
                        </div>
                        <span style={{ fontSize:11, color:tareaSinFecha ? C.sage : C.light, fontWeight:700 }}>Sin fecha límite</span>
                      </div>
                      {!tareaSinFecha && (
                        <input type="date" value={tareaVence} onChange={e => setTareaVence(e.target.value)}
                          style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                      )}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => crearTarea(), loadingTarea ? "Guardando..." : "Asignar ✓", { flex:2, padding:11, background:loadingTarea ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("enviar-material", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📤 Enviar material</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:14 }}>Para: <strong>{pacienteSeleccionado?.nombre}</strong></div>

                  {/* SELECTOR DE TIPO */}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Tipo de material</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:16 }}>
                    {[["🖼️","Imagen","Imagen"],["📄","PDF","PDF"],["🎵","Podcast","Podcast"],["🎬","YouTube","YouTube"],["🔗","Enlace","Enlace"]].map(([ic,lb,val]) => (
                      <div key={val} onClick={() => { setRecursoTipo(val); setRecursoUrl(""); }}
                        style={{ padding:"8px 13px", borderRadius:20, cursor:"pointer", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", gap:5, border:`2px solid ${recursoTipo===val ? C.plum : "rgba(0,0,0,0.08)"}`, background:recursoTipo===val ? `${C.plum}15` : "white", color:recursoTipo===val ? C.plum : C.light, transition:"all 0.15s" }}>
                        {ic} {lb}
                      </div>
                    ))}
                  </div>

                  {/* IMAGEN — subida directa */}
                  {recursoTipo === "Imagen" && (
                    <label style={{ display:"block", cursor:"pointer", marginBottom:12 }}>
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display:"none" }}
                        onChange={e => { if(e.target.files[0]) subirArchivoCloudinary(e.target.files[0]); }}/>
                      <div style={{ border:`2px dashed ${recursoUrl ? C.sage : "rgba(0,0,0,0.15)"}`, borderRadius:14, padding:"20px 14px", textAlign:"center", background:recursoUrl ? "#F0FBF4" : "#FAFAFA", transition:"all 0.2s" }}>
                        {subiendoArchivo ? (
                          <div><div style={{ fontSize:24, marginBottom:8 }}>⏳</div><div style={{ fontSize:12, color:C.light }}>Subiendo imagen...</div></div>
                        ) : recursoUrl ? (
                          <div>
                            <img src={recursoUrl} alt="preview" style={{ width:80, height:80, objectFit:"cover", borderRadius:10, marginBottom:6 }}/>
                            <div style={{ fontSize:12, fontWeight:800, color:C.sageDark }}>✅ Imagen subida</div>
                            <div style={{ fontSize:10, color:C.light, marginTop:3 }}>Toca para cambiar</div>
                          </div>
                        ) : (
                          <div><div style={{ fontSize:32, marginBottom:8 }}>🖼️</div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>Toca para subir imagen</div><div style={{ fontSize:11, color:C.light, marginTop:4 }}>JPG, PNG, WEBP</div></div>
                        )}
                      </div>
                    </label>
                  )}

                  {/* PDF — pegar URL */}
                  {recursoTipo === "PDF" && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:"#FFF8E1", borderRadius:11, padding:"10px 12px", marginBottom:10, fontSize:11, color:C.amberDark, fontWeight:700 }}>
                        💡 Sube el PDF a Google Drive, Dropbox o OneDrive, compártelo como "cualquiera con el link" y pega el link aquí
                      </div>
                      <input placeholder="https://drive.google.com/file/d/..." value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:`2px solid ${recursoUrl ? C.sage : "rgba(0,0,0,0.08)"}`, borderRadius:11, fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                      {recursoUrl ? <div style={{ fontSize:10, color:C.sageDark, fontWeight:700, marginTop:4 }}>✅ Link listo</div> : null}
                    </div>
                  )}

                  {/* PODCAST — pegar URL */}
                  {recursoTipo === "Podcast" && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:"#F3E5F5", borderRadius:11, padding:"10px 12px", marginBottom:10, fontSize:11, color:"#7B1FA2", fontWeight:700 }}>
                        🎵 Pega el link del episodio de Spotify, Apple Podcasts, Google Podcasts u otra plataforma
                      </div>
                      <input placeholder="https://open.spotify.com/episode/..." value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:`2px solid ${recursoUrl ? C.sage : "rgba(0,0,0,0.08)"}`, borderRadius:11, fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                      {recursoUrl ? <div style={{ fontSize:10, color:C.sageDark, fontWeight:700, marginTop:4 }}>✅ Link listo</div> : null}
                    </div>
                  )}

                  {/* YOUTUBE — pegar URL */}
                  {recursoTipo === "YouTube" && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:"#FFEBEE", borderRadius:11, padding:"10px 12px", marginBottom:10, fontSize:11, color:"#C62828", fontWeight:700 }}>
                        🎬 Pega el link del video de YouTube
                      </div>
                      <input placeholder="https://www.youtube.com/watch?v=..." value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:`2px solid ${recursoUrl ? C.sage : "rgba(0,0,0,0.08)"}`, borderRadius:11, fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                      {recursoUrl ? <div style={{ fontSize:10, color:C.sageDark, fontWeight:700, marginTop:4 }}>✅ Link listo</div> : null}
                    </div>
                  )}

                  {/* ENLACE — pegar URL */}
                  {recursoTipo === "Enlace" && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:"#E3F2FD", borderRadius:11, padding:"10px 12px", marginBottom:10, fontSize:11, color:"#1565C0", fontWeight:700 }}>
                        🔗 Pega cualquier link — artículo, recurso web, formulario, etc.
                      </div>
                      <input placeholder="https://..." value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:`2px solid ${recursoUrl ? C.sage : "rgba(0,0,0,0.08)"}`, borderRadius:11, fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                      {recursoUrl ? <div style={{ fontSize:10, color:C.sageDark, fontWeight:700, marginTop:4 }}>✅ Link listo</div> : null}
                    </div>
                  )}

                  {/* NOMBRE */}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Nombre del material</div>
                  <input placeholder="Ej: Técnica de respiración 4-7-8" value={recursoNombre} onChange={e => setRecursoNombre(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:16, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal(null); setRecursoUrl(""); setRecursoNombre(""); setRecursoTipo("Imagen"); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => enviarRecurso(), loadingRecurso ? "Enviando..." : "Enviar ✓", { flex:2, padding:11, background:(!recursoUrl || loadingRecurso || subiendoArchivo) ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {recursoAEliminar && mdl("confirmar-eliminar-recurso", (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>🗑️</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:8, textAlign:"center" }}>Eliminar material</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:6 }}>¿Seguro que quieres eliminar este material?</div>
                  <div style={{ background:C.warm, borderRadius:12, padding:"10px 14px", marginBottom:18, textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{recursoAEliminar.nombre}</div>
                    <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{recursoAEliminar.tipo}</div>
                  </div>
                  <div style={{ background:"#FFE5E5", borderRadius:11, padding:"10px 12px", marginBottom:16, fontSize:11, color:C.red, fontWeight:700 }}>
                    ⚠️ Esta acción no se puede deshacer
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal(null); setRecursoAEliminar(null); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      try {
                        await deleteDoc(doc(db, "recursos", recursoAEliminar.id));
                        setRecursos(prev => prev.filter(r => r.id !== recursoAEliminar.id));
                        setRecursoAEliminar(null);
                        setModal(null);
                        showToast("🗑️ Material eliminado");
                      } catch(e) { showToast("Error al eliminar ❌"); }
                    }, "Sí, eliminar", { flex:2, padding:11, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("frase-mes", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>✨ Frase del mes</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Todos tus pacientes verán esta frase en su inicio</div>
                  <div style={{ background:`${C.plum}10`, borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:11, color:C.plum, fontWeight:700 }}>
                    📅 Mes actual: {new Date().toLocaleDateString('es-CO', { month:'long', year:'numeric' })}
                  </div>
                  {usuarioActual?.fraseDelMesFecha === new Date().toISOString().slice(0,7) && usuarioActual?.fraseDelMes && (
                    <div style={{ background:"#F0FBF4", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color:C.sageDark, fontWeight:700 }}>
                      ✅ Frase activa: "{usuarioActual.fraseDelMes}"
                    </div>
                  )}
                  <textarea placeholder="Escribe una frase motivacional para tus pacientes este mes..." value={fraseDelMes} onChange={e => setFraseDelMes(e.target.value)}
                    style={{ width:"100%", minHeight:100, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.6 }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal(null); setFraseDelMes(""); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      if (!fraseDelMes.trim()) { showToast("Escribe una frase ❌"); return; }
                      setLoadingFrase(true);
                      try {
                        const mesActual = new Date().toISOString().slice(0,7);
                        await updateDoc(doc(db, "usuarios", usuarioActual.uid), {
                          fraseDelMes: fraseDelMes.trim(),
                          fraseDelMesFecha: mesActual,
                        });
                        setUsuarioActual(prev => ({ ...prev, fraseDelMes: fraseDelMes.trim(), fraseDelMesFecha: mesActual }));
                        setModal(null);
                        showToast("✅ Frase del mes guardada");
                      } catch(e) { showToast("Error al guardar ❌"); }
                      setLoadingFrase(false);
                    }, loadingFrase ? "Guardando..." : "Publicar frase ✨", { flex:2, padding:11, background:loadingFrase?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("feedback", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Nota clínica 💬</div>
                  <div style={{ background:"#F0EDF5", borderRadius:11, padding:"10px 12px", marginBottom:12, fontSize:11, color:C.plum, fontWeight:700 }}>🔒 Solo visible para ti — el paciente no puede verla</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
                  <input placeholder="Ej: Sesión 5 Mar · Progresos" value={notaClinicaTitulo} onChange={e => setNotaClinicaTitulo(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Observaciones</div>
                  <textarea placeholder="Observaciones, progresos, pendientes..." value={notaClinicaTexto} onChange={e => setNotaClinicaTexto(e.target.value)}
                    style={{ width:"100%", minHeight:110, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal(null); setNotaClinicaTexto(""); setNotaClinicaTitulo(""); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      if (!notaClinicaTitulo.trim()) { showToast("Escribe un título ❌"); return; }
                      if (!notaClinicaTexto.trim()) { showToast("Escribe la observación ❌"); return; }
                      if (!pacienteSeleccionado) { showToast("Selecciona un paciente ❌"); return; }
                      setLoadingNotaClin(true);
                      try {
                        const id = Date.now().toString();
                        const nueva = {
                          id,
                          psicologoId: usuarioActual.uid,
                          pacienteId: pacienteSeleccionado.id,
                          pacienteNombre: pacienteSeleccionado.nombre,
                          titulo: notaClinicaTitulo,
                          texto: notaClinicaTexto,
                          creadaEn: new Date().toISOString(),
                        };
                        await setDoc(doc(db, "notasClinicas", id), nueva);
                        setNotasClinicas(prev => [nueva, ...prev]);
                        setNotaClinicaTexto(""); setNotaClinicaTitulo("");
                        setModal(null);
                        showToast("✅ Nota clínica guardada");
                      } catch(e) { showToast("Error al guardar ❌"); }
                      setLoadingNotaClin(false);
                    }, loadingNotaClin ? "Guardando..." : "Guardar 🔒", { flex:2, padding:11, background:loadingNotaClin?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("programar-notif", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>🔔 Programar notificación</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>
      Para: <strong>{pacienteSeleccionado?.nombre}</strong>
    </div>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
    <input placeholder="Ej: Recuerda tu sesión de hoy" value={notifTitulo} onChange={e => setNotifTitulo(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Mensaje</div>
    <textarea placeholder="Ej: Tu sesión es hoy a las 3pm. ¡Nos vemos pronto!" value={notifMensaje} onChange={e => setNotifMensaje(e.target.value)}
      style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ display:"flex", gap:10, marginBottom:10 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Fecha</div>
        <input type="date" value={notifFecha} onChange={e => setNotifFecha(e.target.value)}
          style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Hora</div>
        <input type="time" value={notifHora} onChange={e => setNotifHora(e.target.value)}
          style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>
    </div>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>⏰ Recordatorios antes</div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
      {[[5,"5 min"],[10,"10 min"],[30,"30 min"],[60,"1 hora"],[120,"2 horas"],[1440,"1 día"]].map(([mins, label]) => {
        const activo = notifIntervalos.includes(mins);
        return (
          <div key={mins} onClick={() => setNotifIntervalos(prev =>
            activo ? prev.filter(m => m !== mins) : [...prev, mins]
          )}
            style={{ padding:"7px 13px", borderRadius:20, fontSize:11, fontWeight:800, cursor:"pointer",
              background: activo ? C.plum : "rgba(0,0,0,0.05)",
              color: activo ? "white" : C.text,
              border: `2px solid ${activo ? C.plum : "transparent"}`,
              transition:"all 0.15s"
            }}>
            {activo ? "✓ " : ""}{label}
          </div>
        );
      })}
    </div>
    {notifIntervalos.length > 0 && (
      <div style={{ background:`${C.plum}10`, borderRadius:11, padding:"10px 13px", marginBottom:14, fontSize:11, color:C.plum, fontWeight:700 }}>
        📬 Se enviarán {notifIntervalos.length + 1} notificaciones en total
      </div>
    )}
    <div style={{ display:"flex", gap:8 }}>
      {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
      {btn(() => programarNotificacion(), loadingNotif ? "Programando..." : "Programar 🔔", { flex:2, padding:11, background:loadingNotif ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
    </div>
  </div>
))}
{mdl("crear-recordatorio", (
  <div>
    <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>🔔 Nuevo recordatorio</div>
    <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>Se enviará automáticamente al paciente</div>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
    <input value={recTitulo} onChange={e => setRecTitulo(e.target.value)} placeholder="Ej: 💪 ¡Hoy toca gym!"
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Mensaje</div>
    <textarea value={recMensaje} onChange={e => setRecMensaje(e.target.value)} placeholder="Ej: Recuerda que hoy tienes entrenamiento 🏋️"
      style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Hora de envío</div>
    <input type="time" value={recHora} onChange={e => setRecHora(e.target.value)}
      style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Días de la semana</div>
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {[["D",0],["L",1],["M",2],["X",3],["J",4],["V",5],["S",6]].map(([label, dia]) => (
        <div key={dia} onClick={() => setRecDias(prev =>
          prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        )} style={{
          width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800, cursor:"pointer",
          background: recDias.includes(dia) ? C.plum : "white",
          color: recDias.includes(dia) ? "white" : C.text,
          border: `2px solid ${recDias.includes(dia) ? C.plum : "rgba(0,0,0,0.08)"}`
        }}>{label}</div>
      ))}
    </div>
    <div style={{ background:C.warm, borderRadius:11, padding:10, marginBottom:16 }}>
      <div style={{ fontSize:11, color:C.light, lineHeight:1.5 }}>
        📍 La notificación llegará a las <strong>{recHora || "--:--"}</strong> hora del paciente
        {recDias.length > 0 && ` los días seleccionados`}
      </div>
    </div>
    <div style={{ display:"flex", gap:8 }}>
      {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
      {btn(() => crearRecordatorio(), loadingRec ? "Guardando..." : "Guardar 🔔", { flex:2, padding:11, background:loadingRec ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
    </div>
  </div>
))}
              {anav("admin-paciente")}
            </div>
          )}

          {/* ADMIN PERFIL */}
          {!notifPanel && screen === "admin-perfil" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:"calc(140px + env(safe-area-inset-bottom, 0px))", background:"#F5EDE0" }}>

              {/* HEADER */}
              <div style={{ background:`linear-gradient(160deg,${C.dark},${C.plum})`, padding:"32px 24px 48px", textAlign:"center", position:"relative" }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                  {usuarioActual?.foto ? (
                    <img src={usuarioActual.foto} alt="foto" style={{ width:90, height:90, borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(255,255,255,0.25)", margin:"0 auto", display:"block" }}/>
                  ) : (
                    <div style={{ width:90, height:90, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, border:"3px solid rgba(255,255,255,0.25)", margin:"0 auto" }}>👨‍⚕️</div>
                  )}
                  <div onClick={() => { setEditNombre(usuarioActual?.nombre||""); setEditTel(usuarioActual?.telefono||""); setEditFoto(usuarioActual?.foto||""); setEditEspecialidad(usuarioActual?.especialidad||""); setEditExperiencia(usuarioActual?.experiencia||""); setEditEnfoque(usuarioActual?.enfoque||""); setModal("edit-psico"); }} style={{ position:"absolute", bottom:2, right:2, width:26, height:26, background:C.amber, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer", border:"2px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>✏️</div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:"white", marginBottom:4 }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600, marginBottom:12 }}>{usuarioActual?.email || ""}</div>
                <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(255,255,255,0.12)", color:"white", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20 }}>🧠 Psicólogo Clínico</span>
                  <span style={{ background:"rgba(255,255,255,0.12)", color:"white", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20 }}>TCC · Mindfulness</span>
                </div>
              </div>

              {/* STATS */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(196,132,90,0.1)", margin:"-1px 0 16px" }}>
                {[[pacientes.length || "0","Pacientes"],[citas.length || "0","Citas"],[citas.filter(c=>c.status==="confirmada").length || "0","Confirmadas"]].map(([n,l]) => (
                  <div key={l} style={{ background:"#FEFAF5", padding:"14px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:C.plum }}>{n}</div>
                    <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:"0 16px" }}>

                {/* ACCIONES RÁPIDAS */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                  {[["📅","Agendar cita",() => setModal("agendar-cita")],["👥","Mis pacientes",() => showScreen("psi-dashboard")],["💬","Nota clínica",() => setModal("feedback")],["✨","Frase del mes",() => { setFraseDelMes(usuarioActual?.fraseDelMes||""); setModal("frase-mes"); }],["🔔","Notificaciones",() => setNotifPanel(true)]].map(([ic,lb,fn]) => (
                    <div key={lb} onClick={fn} style={{ background:"#FEFAF5", borderRadius:14, padding:"11px 14px", textAlign:"center", border:"0.5px solid rgba(196,132,90,0.12)", cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ fontSize:28, marginBottom:6 }}>{ic}</div>
                      <div style={{ fontSize:12, fontWeight:800, color:C.text }}>{lb}</div>
                    </div>
                  ))}
                </div>

                {/* INFO PROFESIONAL */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>ℹ️ Información profesional</div>
                <div style={{ background:"#FEFAF5", borderRadius:14, padding:16, marginBottom:16, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                  {[["🎓","Especialidad", usuarioActual?.especialidad || "No registrado"],["🔬","Enfoque", usuarioActual?.enfoque || "No registrado"],["📞","Teléfono", usuarioActual?.telefono || "No registrado"]].map(([ic,lb,val]) => (
                    <div key={lb} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
                      <div style={{ fontSize:18, width:32, textAlign:"center", flexShrink:0 }}>{ic}</div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:C.light, textTransform:"uppercase", marginBottom:2 }}>{lb}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONFIGURACIÓN */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>⚙️ Configuración</div>
                <div style={{ background:"#FEFAF5", borderRadius:14, overflow:"hidden", marginBottom:16, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                  <div onClick={() => setNotifPanel(true)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:"1px solid rgba(0,0,0,0.04)", cursor:"pointer" }}>
                    <div style={{ fontSize:18, width:32, textAlign:"center" }}>🔔</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>Notificaciones</div>
                    <div style={{ color:C.light, fontSize:16 }}>›</div>
                  </div>
                  <div onClick={() => { const nuevo = !darkMode; setDarkMode(nuevo); localStorage.setItem('darkMode', nuevo); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:"1px solid rgba(0,0,0,0.04)", cursor:"pointer" }}>
                    <div style={{ fontSize:18, width:32, textAlign:"center" }}>{darkMode?"☀️":"🌙"}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>{darkMode?"Modo claro":"Modo oscuro"}</div>
                    <div style={{ width:44, height:24, borderRadius:12, background:darkMode?C.plum:C.light, position:"relative", transition:"background 0.3s" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:darkMode?23:3, transition:"left 0.3s" }}/>
                    </div>
                  </div>
                  <div onClick={async () => { await signOut(auth); setUsuarioActual(null); setCitas([]); setPacientes([]); setResenas([]); setRecordatorios([]); setTareasPsicologo([]); setRecursos([]); showScreen("login"); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", cursor:"pointer" }}>
                    <div style={{ fontSize:18, width:32, textAlign:"center" }}>🚪</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.red, flex:1 }}>Cerrar sesión</div>
                    <div style={{ color:C.red, fontSize:16 }}>›</div>
                  </div>
                </div>
                {/* RESEÑAS */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>⭐ Reseñas de pacientes</div>
                {loadingResenas ? (
                  <div style={{ textAlign:"center", padding:20, color:C.light, fontSize:13 }}>Cargando reseñas...</div>
                ) : resenas.length === 0 ? (
                  <div style={{ background:"#FEFAF5", borderRadius:14, padding:20, textAlign:"center", marginBottom:16, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                    <div style={{ fontSize:32, marginBottom:6 }}>⭐</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Aún no tienes reseñas</div>
                    <div style={{ fontSize:11, color:C.light, marginTop:4 }}>Tus pacientes podrán valorarte desde su perfil</div>
                  </div>
                ) : (
                  <>
                    <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:16, padding:16, marginBottom:12, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontSize:36, fontWeight:900, color:"white" }}>{(resenas.reduce((a,r) => a+r.rating, 0) / resenas.length).toFixed(1)} ⭐</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{resenas.length} reseña{resenas.length !== 1 ? "s" : ""}</div>
                    </div>
                    {resenas.map(r => (
                      <div key={r.id} style={{ background:"#FEFAF5", borderRadius:14, padding:14, marginBottom:10, border:"0.5px solid rgba(196,132,90,0.12)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div style={{ fontSize:14 }}>{"⭐".repeat(r.rating)}</div>
                          <div style={{ fontSize:10, color:C.light }}>{new Date(r.fecha).toLocaleDateString('es-CO')}</div>
                        </div>
                        <div style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{r.texto}</div>
                        <div style={{ fontSize:10, color:C.light, marginTop:6, fontStyle:"italic" }}>— Paciente anónimo</div>
                      </div>
                    ))}
                  </>
                )}                

              </div>

              {mdl("edit-psico", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:16, textAlign:"center" }}>✏️ Editar perfil</div>

                  {/* PREVIEW FOTO */}
                  <div style={{ textAlign:"center", marginBottom:14 }}>
                    {editFoto ? (
                      <img src={editFoto} alt="preview" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`3px solid ${C.plum}` }}/>
                    ) : (
                      <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto", border:`3px solid ${C.plum}` }}>👨‍⚕️</div>
                    )}
                  </div>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>🖼️ URL de foto de perfil</div>
                  <input placeholder="https://ejemplo.com/mi-foto.jpg" value={editFoto} onChange={e => setEditFoto(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:12, marginBottom:4, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:10, color:C.light, marginBottom:12 }}>💡 Copia la URL de tu foto desde Google, LinkedIn u otra red</div>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Nombre completo</div>
                  <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Tu nombre"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Especialidad</div>
                  <input value={editEspecialidad} onChange={e => setEditEspecialidad(e.target.value)} placeholder="Ej: Psicología Clínica · TCC"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Enfoque terapéutico</div>
                  <input value={editEnfoque} onChange={e => setEditEnfoque(e.target.value)} placeholder="Ej: TCC · Mindfulness · Aceptación"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Teléfono</div>
                  <input value={editTel} onChange={e => setEditTel(e.target.value)} placeholder="Tu teléfono"
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:16, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(async () => {
                      try {
                        await updateDoc(doc(db, "usuarios", usuarioActual.uid), {
                          nombre: editNombre,
                          telefono: editTel,
                          foto: editFoto,
                          especialidad: editEspecialidad,
                          experiencia: editExperiencia,
                          enfoque: editEnfoque,
                        });
                        setUsuarioActual(prev => ({ ...prev, nombre:editNombre, telefono:editTel, foto:editFoto, especialidad:editEspecialidad, experiencia:editExperiencia, enfoque:editEnfoque }));
                        setModal(null);
                        showNotif("Perfil actualizado", "Los cambios fueron guardados ✅", "✏️");
                      } catch(e) { showToast("Error al guardar ❌"); }
                    }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}

              {mdl("agendar-cita", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📅 Agendar cita</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>El paciente verá la cita en su calendario</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Paciente</div>
                  <select value={citaPacienteId} onChange={e => setCitaPacienteId(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", background:"#FEFAF5", boxSizing:"border-box" }}>
                    <option value="">— Seleccionar paciente —</option>
                    {pacientes.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                  </select>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Fecha</div>
                  <input type="date" value={citaFecha} onChange={e => setCitaFecha(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Hora</div>
                  <input type="time" value={citaHora} onChange={e => setCitaHora(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Modalidad</div>
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    {[["presencial","🏥","Presencial"],["virtual","💻","Virtual"]].map(([val,ic,lb]) => (
                      <div key={val} onClick={() => setCitaModalidad(val)}
                        style={{ flex:1, padding:"10px 0", borderRadius:12, textAlign:"center", cursor:"pointer", border:`2px solid ${citaModalidad===val?C.plum:"rgba(0,0,0,0.08)"}`, background:citaModalidad===val?`${C.plum}15`:"white" }}>
                        <div style={{ fontSize:22 }}>{ic}</div>
                        <div style={{ fontSize:11, fontWeight:800, color:citaModalidad===val?C.plum:C.light }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                  {citaModalidad === "virtual" && (
                    <>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>🔗 Link de Meet</div>
                      <input placeholder="https://meet.google.com/xxx" value={citaLink} onChange={e => setCitaLink(e.target.value)}
                        style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                    </>
                  )}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>📝 Notas para el paciente</div>
                  <textarea placeholder="Ej: Recuerda traer tu diario..." value={citaNotas} onChange={e => setCitaNotas(e.target.value)}
                    style={{ width:"100%", minHeight:70, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => crearCita(), loadingCitas ? "Agendando..." : "Agendar ✓", { flex:2, padding:11, background:loadingCitas?C.light:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}

              {anav("admin-perfil")}
            </div>
          )}

        </div>

        {/* TOAST */}
        {toast && (
          <div style={{ position:"absolute", top:58, left:"50%", transform:"translateX(-50%)", background:C.gold, color:"white", fontWeight:800, fontSize:12, padding:"9px 18px", borderRadius:20, zIndex:600, whiteSpace:"nowrap", boxShadow:"0 4px 14px rgba(0,0,0,0.2)", pointerEvents:"none" }}>
            {toast}
          </div>
        )}

      </div>
    </div>
  );
}
