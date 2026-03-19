import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { getDoc, doc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function NOOS() {
  const [screen, setScreen] = useState("login");
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
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [resenaRating, setResenaRating] = useState(0);
  const [resenaTexto, setResenaTexto] = useState("");
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [adminCitaStatus, setAdminCitaStatus] = useState("pending");
  const [toast, setToast] = useState(null);
  const [pinValue, setPinValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [insights, setInsights] = useState(() => {
  try { return JSON.parse(localStorage.getItem('insights')) || []; } catch { return []; }
});
const [insightText, setInsightText] = useState("");
const [insightTitle, setInsightTitle] = useState("");
const [insightMood, setInsightMood] = useState(null);
const [insightShared, setInsightShared] = useState(false);
const [tareasTab, setTareasTab] = useState("autorregistros");
const [autorregistros, setAutorregistros] = useState(() => {
  try { return JSON.parse(localStorage.getItem('autorregistros')) || []; } catch { return []; }
});
const [arFecha, setArFecha] = useState("");
const [arHaciendo, setArHaciendo] = useState("");
const [arSucedio, setArSucedio] = useState("");
const [arDespues, setArDespues] = useState("");
const [darkMode, setDarkMode] = useState(() => {
  try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
});
  const [navOpen, setNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}));
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, icon:"📅", title:"Cita mañana", msg:"Recuerda tu sesión con Dr. García mañana a las 10:00 AM", time:"Hace 1h", read:false },
    { id:2, icon:"🎯", title:"Nueva tarea asignada", msg:"Dr. García te asignó: Registro de pensamientos automáticos", time:"Hace 3h", read:false },
    { id:3, icon:"✨", title:"Frase de la semana", msg:'"El coraje no es la ausencia de miedo..." — Dr. García', time:"Hace 1 día", read:true },
    { id:4, icon:"🔥", title:"¡Racha de 5 días!", msg:"Llevas 5 días seguidos registrando. +100 XP bonus", time:"Hace 2 días", read:true },
  ]);

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
      if (rol === "paciente") {
         setUsuarioActual({ uid, ...docSnap.data() });
        cargarCitas(uid, "paciente");
        showScreen("home");
      } else if (rol === "psicologo") {
        setUsuarioActual({ uid, ...docSnap.data() });
        cargarCitas(uid, "psicologo");
        cargarResenas(uid);
        const pacientesSnap = await getDocs(collection(db, "usuarios"));
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
    const snap = await getDocs(collection(db, "citas"));
    const todas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const filtradas = rol === "paciente"
      ? todas.filter(c => c.pacienteId === uid)
      : todas.filter(c => c.psicologoId === uid);
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
const cargarResenas = async (psicologoId) => {
  setLoadingResenas(true);
  try {
    const snap = await getDocs(collection(db, "resenas"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.psicologoId === psicologoId)
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

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const toggleTarea = (i) => {
    const next = [...tareas]; next[i] = !next[i]; setTareas(next);
    if (!tareas[i]) sumarXP(5, "Tarea completada ✅");
  };

  const pendientes = tareas.filter(t => !t).length;
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .screen-enter {
    animation: fadeIn 0.25s ease;
  }
`;
  const C = {
  plum:"#5C4D6E", sage:"#7DAA92", sageDark:"#4A8A72",
  amber:"#E8A87C", amberDark:"#C4845A", cream:"#FAF7F2",
  warm:"#FFF3E8", text:"#2D2D3E", light:"#9A9AB0",
  red:"#E57373", green:"#66BB6A", blue:"#64B5F6",
  dark:"#1a1a2e", gold:"#F0C040", bg:"#F0EBE3"
};

  const avatars = ["🦋","🦁","🐺","🦊","🐘","🦅","🐬","🦉","🐆","🦓","🐢","🦜"];

  const btn = (onClick, children, s = {}) => (
  <button onClick={() => { playSound("click"); if(navigator.vibrate) navigator.vibrate(8); onClick && onClick(); }} style={{ border:"none", cursor:"pointer", fontFamily:"inherit", ...s }}>{children}</button>
);

  const mitem = (icon, label, onClick, danger) => (
    <div onClick={onClick} style={{ background:"white", borderRadius:13, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:7, cursor:"pointer" }}>
      <div style={{ fontSize:18, width:34, height:34, background:C.warm, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:700, color:danger?C.red:C.text, flex:1 }}>{label}</div>
      <div style={{ color:C.light }}>›</div>
    </div>
  );

  const bnav = (active) => (
  <>
    {/* BOTÓN HAMBURGUESA */}
    <div onClick={() => { if(navigator.vibrate) navigator.vibrate(10); setNavOpen(!navOpen); }}
      style={{ position:"absolute", bottom:20, right:20, width:52, height:52, borderRadius:"50%", background:C.plum, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, cursor:"pointer", boxShadow:"0 4px 20px rgba(92,77,110,0.4)", zIndex:200, transition:"transform 0.2s ease", transform:navOpen?"rotate(45deg)":"rotate(0deg)" }}>
      {navOpen ? "✕" : "☰"}
    </div>

    {/* OVERLAY */}
    {navOpen && <div onClick={() => setNavOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", zIndex:198, backdropFilter:"blur(4px)" }}/>}

    {/* BANDEJA */}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:199, transform:navOpen?"translateY(0)":"translateY(100%)", transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1)", background:"white", borderRadius:"28px 28px 0 0", padding:"16px 20px 40px", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>
      <div style={{ width:36, height:4, background:"#E0E0E0", borderRadius:2, margin:"0 auto 20px" }}/>
      <div style={{ fontSize:11, fontWeight:800, color:"#bbb", marginBottom:14, textTransform:"uppercase", letterSpacing:1.5 }}>Navegación</div>
      {[["🏠","Inicio","home"],["📝","Notas","notas"],["📅","Citas","calendario"],["🏆","Logros","logros"],["👤","Perfil","perfil"]].map(([ic,lb,id]) => (
        <div key={id} onClick={() => { showScreen(id); setNavOpen(false); }}
          style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, marginBottom:6, background:active===id?`${C.plum}12`:"transparent", cursor:"pointer" }}>
          <div style={{ fontSize:22, width:42, height:42, borderRadius:12, background:active===id?C.plum:"#F5F5F5", display:"flex", alignItems:"center", justifyContent:"center" }}>{ic}</div>
          <div style={{ fontSize:15, fontWeight:active===id?800:600, color:active===id?C.plum:C.text }}>{lb}</div>
          {active===id && <div style={{ marginLeft:"auto", width:7, height:7, borderRadius:"50%", background:C.plum }}/>}
        </div>
      ))}
    </div>
  </>
);

  const anav = (active) => (
  <>
    {/* BOTÓN HAMBURGUESA */}
    <div onClick={() => { if(navigator.vibrate) navigator.vibrate(10); setNavOpen(!navOpen); }}
      style={{ position:"absolute", bottom:20, right:20, width:52, height:52, borderRadius:"50%", background:C.plum, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, cursor:"pointer", boxShadow:"0 4px 20px rgba(92,77,110,0.4)", zIndex:200, transition:"transform 0.2s ease", transform:navOpen?"rotate(45deg)":"rotate(0deg)" }}>
      {navOpen ? "✕" : "☰"}
    </div>

    {/* OVERLAY */}
    {navOpen && <div onClick={() => setNavOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", zIndex:198, backdropFilter:"blur(4px)" }}/>}

    {/* BANDEJA */}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:199, transform:navOpen?"translateY(0)":"translateY(100%)", transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1)", background:C.dark, borderRadius:"28px 28px 0 0", padding:"16px 20px 40px", boxShadow:"0 -8px 40px rgba(0,0,0,0.2)" }}>
      <div style={{ width:36, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2, margin:"0 auto 20px" }}/>
      <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.3)", marginBottom:14, textTransform:"uppercase", letterSpacing:1.5 }}>Navegación</div>

      {active === "admin-home" || active === "admin-psicologo" || active === "admin-pacientes" || active === "admin-pagos" ? (
        [["👑","Dashboard","admin-home"],["🧠","Psicólogos","admin-psicologo"],["👥","Pacientes","admin-pacientes"],["💰","Pagos","admin-pagos"]].map(([ic,lb,id]) => (
          <div key={id} onClick={() => { setNavOpen(false); showScreen(id); }}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, marginBottom:6, background:active===id?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer" }}>
            <div style={{ fontSize:22, width:42, height:42, borderRadius:12, background:active===id?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center" }}>{ic}</div>
            <div style={{ fontSize:15, fontWeight:700, color:active===id?C.amber:"rgba(255,255,255,0.7)" }}>{lb}</div>
            {active===id && <div style={{ marginLeft:"auto", width:7, height:7, borderRadius:"50%", background:C.amber }}/>}
          </div>
        ))
      ) : (
        [["👤","Mi Perfil","admin-perfil"],["👥","Pacientes","psi-dashboard"],["📅","Mis Citas","calendario-psi"]].map(([ic,lb,id]) => (
          <div key={id} onClick={() => { setNavOpen(false); showScreen(id); }}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, marginBottom:6, background:active===id?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer" }}>
            <div style={{ fontSize:22, width:42, height:42, borderRadius:12, background:active===id?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center" }}>{ic}</div>
            <div style={{ fontSize:15, fontWeight:700, color:active===id?C.amber:"rgba(255,255,255,0.7)" }}>{lb}</div>
            {active===id && <div style={{ marginLeft:"auto", width:7, height:7, borderRadius:"50%", background:C.amber }}/>}
          </div>
        ))
      )}

      <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"8px 0" }}/>

      <div onClick={() => { setNavOpen(false); showScreen("login"); }}
        style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, cursor:"pointer" }}>
        <div style={{ fontSize:22, width:42, height:42, borderRadius:12, background:"rgba(255,100,100,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>🚪</div>
        <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,100,100,0.8)" }}>Cerrar sesión</div>
      </div>
    </div>
  </>
);

  const mdl = (id, children) => modal === id ? (
    <div onClick={() => setModal(null)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"flex-end", borderRadius:44 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.cream, borderRadius:"28px 28px 44px 44px", padding:"20px 20px 36px", width:"100%", maxHeight:"85%", overflowY:"auto" }}>
        <div style={{ width:40, height:4, background:"rgba(0,0,0,0.15)", borderRadius:2, margin:"0 auto 16px" }}/>
        {children}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#E8EDF0", height:"100vh", width:"100vw", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}><style>{styles}</style>
      
      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ width:"100%", maxWidth:430, height:"100%", background:C.cream, overflow:"hidden", position:"relative", margin:"0 auto" }}>

        {/* CONTENIDO */}
        <div style={{ height:"calc(780px - 44px)", overflowY:"auto", overflowX:"hidden", position:"relative" }}>

          {/* PANEL NOTIFICACIONES */}
          {notifPanel && (
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <div style={{ background:"white", padding:"14px 20px", borderBottom:"1px solid rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:10 }}>
                <div onClick={() => setNotifPanel(false)} style={{ fontSize:20, cursor:"pointer", color:C.light }}>←</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:18, fontWeight:900, color:C.text }}>Notificaciones 🔔</div>
                  {unread > 0 && <div style={{ fontSize:11, color:C.light }}>{unread} sin leer</div>}
                </div>
                {unread > 0 && btn(markAllRead, "Marcar todas ✓", { fontSize:11, fontWeight:800, color:C.plum, background:C.warm, padding:"5px 10px", borderRadius:9 })}
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:14 }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{ background:n.read?"white":"#F5F0FB", borderRadius:16, padding:"12px 14px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer", borderLeft:`3px solid ${n.read?"transparent":C.plum}` }}>
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
  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:`linear-gradient(160deg, #FAF7F2, #EDE0F5, #D4EDE1)`, backgroundSize:"400% 400%", animation:"gradientMove 6s ease infinite" }}>

    {/* LOGO */}
    <div style={{ fontSize:80, marginBottom:8, animation:"fadeIn 0.8s ease" }}>🛋️</div>
    <div style={{ fontSize:32, fontWeight:900, color:C.plum, letterSpacing:0, marginBottom:4 }}>Mi Psicólogo</div>
    <div style={{ fontSize:13, color:C.light, fontWeight:500, marginBottom:40, textAlign:"center" }}>Un espacio seguro</div>

    {/* FORMULARIO */}
    <div style={{ width:"100%", background:"white", borderRadius:24, padding:28, boxShadow:"0 8px 32px rgba(92,77,110,0.12)" }}>

      {/* NOMBRE */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Nombre de usuario</div>
<input
  type="email"
  placeholder="Tu correo"
  value={emailValue}
  onChange={e => setEmailValue(e.target.value)}
  style={{ width:"100%", padding:"14px 16px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:14, fontSize:14, marginBottom:20, outline:"none" }}
/>

      {/* PIN VISUAL */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:12 }}>PIN de acceso</div>
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:16 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:18, height:18, borderRadius:"50%", background: pinValue && pinValue.length > i ? C.plum : "transparent", border:`2.5px solid ${pinValue && pinValue.length > i ? C.plum : C.light}`, transition:"all 0.2s ease" }}/>
        ))}
      </div>
      <input
        type="password"
        placeholder="PIN"
        inputMode="numeric"
        maxLength={4}
        value={pinValue || ""}
        onChange={e => setPinValue(e.target.value)}
        style={{ width:"100%", padding:"14px 16px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:14, fontSize:14, marginBottom:24, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.cream, textAlign:"center", letterSpacing:1 }}
      />

      {/* BOTÓN CON RIPPLE */}
      <button
        onClick={e => {
          if (navigator.vibrate) navigator.vibrate(10);
          const btn = e.currentTarget;
          const circle = document.createElement("span");
          const diameter = Math.max(btn.clientWidth, btn.clientHeight);
          circle.style.cssText = `width:${diameter}px;height:${diameter}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.3);transform:scale(0);animation:ripple 0.5s linear;left:${e.clientX - btn.getBoundingClientRect().left - diameter/2}px;top:${e.clientY - btn.getBoundingClientRect().top - diameter/2}px;pointer-events:none;`;
          btn.appendChild(circle);
          setTimeout(() => circle.remove(), 500);
          handleLogin();
        }}
        style={{ width:"100%", padding:16, background:C.plum, color:"white", borderRadius:15, fontSize:15, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"inherit", position:"relative", overflow:"hidden" }}
      >
        Entrar
      </button>
    </div>

    {/* FOOTER */}
    <div style={{ marginTop:24, fontSize:12, color:C.light, textAlign:"center", lineHeight:1.6 }}>
      ¿Problemas para entrar?<br/>
      <span style={{ color:C.plum, fontWeight:700 }}>Contacta a tu psicólogo</span>
    </div>

  </div>
)}
{/* REGISTRO */}
{!notifPanel && screen === "registro" && (
  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:`linear-gradient(160deg,${C.cream} 0%,#EDE8F5 100%)` }}>
    
    {/* LOGO */}
    <div style={{ fontSize:48, marginBottom:8 }}>🧠</div>
    <div style={{ fontSize:28, fontWeight:900, color:C.plum, marginBottom:4 }}>Crear cuenta</div>
    <div style={{ fontSize:13, color:C.light, marginBottom:32 }}>Únete a Mi Psicólogo</div>

    {/* FORMULARIO */}
    <div style={{ width:"100%", background:"white", borderRadius:24, padding:28, boxShadow:"0 8px 32px rgba(92,77,110,0.12)" }}>

      {/* NOMBRE */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Nombre completo</div>
      <input
        type="text"
        placeholder="Tu nombre"
        value={regNombre}
        onChange={e => setRegNombre(e.target.value)}
        style={{ width:"100%", padding:"14px 16px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:14, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
      />

      {/* CORREO */}
      <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Correo electrónico</div>
      <input
        type="email"
        placeholder="Tu correo"
        value={regEmail}
        onChange={e => setRegEmail(e.target.value)}
        style={{ width:"100%", padding:"14px 16px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:14, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
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
        style={{ width:"100%", padding:"14px 16px", border:`2px solid rgba(0,0,0,0.08)`, borderRadius:14, fontSize:14, marginBottom:16, outline:"none", boxSizing:"border-box" }}
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
        style={{ width:"100%", padding:16, background:C.plum, color:"white", borderRadius:15, fontSize:15, fontWeight:800, border:"none", cursor:"pointer" }}
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140 }}>
              <div style={{ background:`linear-gradient(145deg,${C.plum},#3D3055)`, padding:"20px 24px 76px", position:"relative" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>¡Buenos días,</div>
                <div style={{ fontSize:23, color:"white", fontWeight:900 }}>{usuarioActual?.nombre || "Bienvenido"} 👋</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:3 }}>{new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })} · Semana {Math.ceil(new Date().getDate()/7)}</div>
                <div style={{ position:"absolute", top:18, right:22, display:"flex", gap:10, alignItems:"center" }}>
                  <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer" }}>
                    <div style={{ fontSize:24 }}>🔔</div>
                    {unread > 0 && <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"white", border:"2px solid #3D3055" }}>{unread}</div>}
                  </div>
                  <div onClick={() => showScreen("perfil")} style={{ width:50, height:50, background:`linear-gradient(135deg,${C.amber},${C.gold})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border:"3px solid rgba(255,255,255,0.3)", cursor:"pointer" }}>{avatar}</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:18, padding:"12px 14px", marginTop:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                     <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>{getRango(xp).icono} {getRango(xp).nombre}</span>
                    <span style={{ fontSize:11, color:C.amber, fontWeight:800 }}>{xp} XP · {getRango(xp).icono} {getRango(xp).nombre}</span>
                  </div>
                  <div style={{ height:7, background:"rgba(255,255,255,0.15)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((xp % 50) / 50 * 100, 100)}%`, background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:4, transition:"width 0.5s ease" }}/>
                  </div>
                </div>
              </div>
              <div style={{ padding:"0 14px", marginTop:-42, position:"relative", zIndex:10 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[[`linear-gradient(135deg,${C.sage},${C.sageDark})`,"📝","Autorregistros","14","este mes",true],["white","🎯","Tareas","3/5","completadas",false],["white","📅","Próx. cita","Mar 15","10:00 AM",false],["white","🏅","Logros","8","desbloqueados",false]].map(([bg,ic,lb,val,sub,inv]) => (
                    <div key={lb} style={{ background:bg, borderRadius:18, padding:"16px 14px", boxShadow:"0 4px 14px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontSize:26, marginBottom:8 }}>{ic}</div>
                      <div style={{ fontSize:10, color:inv?"rgba(255,255,255,0.8)":C.light, fontWeight:700, textTransform:"uppercase" }}>{lb}</div>
                      <div style={{ fontSize:20, fontWeight:900, color:inv?"white":C.text, marginTop:2 }}>{val}</div>
                      <div style={{ fontSize:10, color:inv?"rgba(255,255,255,0.7)":C.light }}>{sub}</div>
                    </div>
                  ))}
                </div>                
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"0 0 10px" }}>📅 Próxima cita</div>
                <div style={{ background:"white", borderRadius:18, padding:"14px 16px", boxShadow:"0 4px 14px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ background:C.plum, borderRadius:12, padding:"9px 12px", textAlign:"center", minWidth:50 }}>
                    <div style={{ fontSize:20, fontWeight:900, color:"white", lineHeight:1 }}>15</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>MAR</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text }}>Sesión con Dr. García</div>
                    <div style={{ fontSize:11, color:C.light, marginTop:2 }}>⏰ 10:00 AM · 1 hora</div>
                    <span style={{ background:C.warm, color:C.amberDark, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>📍 Presencial</span>
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"0 0 10px" }}>✨ Frase de la semana</div>
                <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:20, padding:20, marginBottom:16 }}>
                  <div style={{ fontSize:16, color:"white", lineHeight:1.5, fontStyle:"italic" }}>"El coraje no es la ausencia de miedo, sino la decisión de que algo más es más importante."</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:8, fontWeight:700 }}>— Dr. García · Esta semana</div>
                </div>
              </div>
              {bnav("home")}
            </div>
          )}

          {/* NOTAS */}
{!notifPanel && screen === "notas" && (
  <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
    
    {/* HEADER */}
    <div style={{ background:"white", padding:"14px 22px 0", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize:21, fontWeight:900, color:C.text }}>Notas & Tareas</div>
      <div style={{ fontSize:11, color:C.light, fontWeight:600, marginBottom:10 }}>Tu espacio personal de registro</div>
      <div style={{ display:"flex", borderBottom:"2px solid rgba(0,0,0,0.06)" }}>
        {[["💡 Para no olvidar","insights"],["🎯 Tareas","tareas"]].map(([lb,id]) => (
          <button key={id} onClick={() => setNoteTab(id)} style={{ flex:1, padding:"11px 0", fontSize:11, fontWeight:800, color:noteTab===id?C.plum:C.light, border:"none", background:"transparent", borderBottom:`3px solid ${noteTab===id?C.plum:"transparent"}`, marginBottom:-2, cursor:"pointer", fontFamily:"inherit" }}>
            {lb}{id==="tareas" && pendientes > 0 && <span style={{ background:C.amber, color:"white", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20, marginLeft:6 }}>{pendientes}</span>}
          </button>
        ))}
      </div>
    </div>

    <div style={{ flex:1, overflowY:"auto", padding:14, paddingBottom:140 }}>
      
      {/* PESTAÑA INSIGHTS */}
      {noteTab === "insights" && (
        <>
          {/* FORMULARIO NUEVA NOTA */}
          <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:16, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
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
              style={{ width:"100%", padding:"12px 14px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:12, fontSize:13, marginBottom:12, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#FDFBF7" }}
            />

            {/* TEXTO */}
            <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:6 }}>Nota</div>
            <textarea
              placeholder="Escribe aquí lo que no quieres olvidar para tu próxima sesión..."
              value={insightText}
              onChange={e => setInsightText(e.target.value)}
              style={{ width:"100%", minHeight:90, padding:"12px 14px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:12, fontSize:13, resize:"none", outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box", background:"#FDFBF7", lineHeight:1.5 }}
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
            {btn(() => {
              if (!insightText.trim()) return;
              const nueva = {
                id: Date.now(),
                title: insightTitle || "Para no olvidar",
                text: insightText,
                mood: insightMood,
                shared: insightShared,
                date: new Date().toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
              };
              const nuevas = [nueva, ...insights];
              setInsights(nuevas);
              localStorage.setItem('insights', JSON.stringify(nuevas));
              setInsightText("");
              setInsightTitle("");
              setInsightMood(null);
              setInsightShared(false);
              showNotif("Nota guardada", "Tu insight quedó registrado 💡", "✅");
                  sumarXP(2, "Nota guardada 💡");
            }, "💾 Guardar nota", { width:"100%", padding:14, background:C.plum, color:"white", borderRadius:13, fontSize:14, fontWeight:800 })}
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
            <div key={n.id} style={{ background:"#FDFBF7", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${n.shared?C.sageDark:C.plum}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div style={{ fontSize:11, color:C.light, fontWeight:700 }}>{n.date}</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {n.mood !== null && <span style={{ fontSize:16 }}>{["😞","😕","😐","🙂","😄"][n.mood]}</span>}
                  {n.shared && <span style={{ background:`${C.sageDark}20`, color:C.sageDark, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>👁 Psicólogo</span>}
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:C.plum, marginBottom:6 }}>{n.title}</div>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{n.text}</div>
              <div onClick={() => {
                const nuevas = insights.filter(i => i.id !== n.id);
                setInsights(nuevas);
                localStorage.setItem('insights', JSON.stringify(nuevas));
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
        <div key={id} onClick={() => setTareasTab(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"12px 8px", borderRadius:16, background:tareasTab===id?C.plum:"white", cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", transition:"all 0.2s" }}>
          <span style={{ fontSize:22 }}>{ic}</span>
          <span style={{ fontSize:10, fontWeight:800, color:tareasTab===id?"white":C.light, textAlign:"center" }}>{lb}</span>
        </div>
      ))}
    </div>
    {/* MIS AUTORREGISTROS */}
        {tareasTab === "autorregistros" && (
          <div>
            {btn(() => setModal("nuevo-autorregistro"), "✏️ Escribir autorregistro", { width:"100%", padding:13, background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:14, fontSize:13, fontWeight:800, marginBottom:14, display:"block" })}

            {autorregistros.length === 0 ? (
              <div style={{ textAlign:"center", padding:30, color:C.light }}>
                <div style={{ fontSize:40, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:14, fontWeight:700 }}>Aún no tienes autorregistros</div>
                <div style={{ fontSize:12, marginTop:4 }}>Toca el botón de arriba para crear uno</div>
              </div>
            ) : (
              autorregistros.map((ar, i) => (
                <div key={i} style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${C.plum}` }}>
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
                  {btn(() => {
                    if (!arFecha || !arHaciendo || !arSucedio || !arDespues) { showToast("Completa todos los campos ❌"); return; }
                    const nuevo = { fecha:arFecha, haciendo:arHaciendo, sucedio:arSucedio, despues:arDespues };
                    const nuevos = [nuevo, ...autorregistros];
                    setAutorregistros(nuevos);
                    localStorage.setItem('autorregistros', JSON.stringify(nuevos));
                    setArFecha(""); setArHaciendo(""); setArSucedio(""); setArDespues("");
                    setModal(null);
                    sumarXP(1, "Autorregistro completado 📋");
                  }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                </div>
              </div>
            ))}
          </div>
        )}      
    {/* MIS RECURSOS */}
    {tareasTab === "recursos" && (
      <div>
        <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${C.plum}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📄</div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>Técnica de respiración 4-7-8</div>
              <div style={{ fontSize:11, color:C.light, marginTop:2 }}>PDF · Asignado por Dr. García</div>
            </div>
          </div>
        </div>
        <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${C.sage}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🎵</div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text }}>Meditación guiada 10 min</div>
              <div style={{ fontSize:11, color:C.light, marginTop:2 }}>Audio · Asignado por Dr. García</div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* TAREAS */}
    {tareasTab === "tareas" && (
      <>
        {[["Registro de pensamientos automáticos","Anota 3 momentos donde notes pensamientos negativos.","⏰ Vence hoy",true,0],["Diario de gratitud 3×3","Escribe 3 cosas por las que estás agradecida, 3 días seguidos.","📅 Vence en 4 días",false,1]].map(([titulo,desc,deadline,urgent,i]) => (
          <div key={i} style={{ background:"white", borderRadius:18, padding:"14px 16px", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${tareas[i]?C.green:C.amber}`, opacity:tareas[i]?.75:1 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
              <div onClick={() => toggleTarea(i)} style={{ width:22, height:22, borderRadius:"50%", border:`2.5px solid ${tareas[i]?C.green:C.amber}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:11, color:"white", background:tareas[i]?C.green:"transparent", marginTop:1 }}>{tareas[i]?"✓":""}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:C.text, textDecoration:tareas[i]?"line-through":"none" }}>{titulo}</div>
                <div style={{ fontSize:11, color:C.light, marginTop:2, lineHeight:1.5 }}>{desc}</div>
                <div style={{ display:"inline-flex", background:"#FFF8E6", color:C.amberDark, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, marginTop:5 }}>⭐ +80 XP al completar</div>
                <div style={{ fontSize:10, color:urgent?C.red:C.light, marginTop:2 }}>{deadline}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {btn(() => setModal("task-"+i), "✏️ Responder", { padding:"6px 12px", borderRadius:9, background:C.warm, color:C.amberDark, fontSize:11, fontWeight:800 })}
              {btn(null, "📎 Subir", { padding:"6px 12px", borderRadius:9, background:"#EEF3FF", color:C.blue, fontSize:11, fontWeight:800 })}
              {btn(() => toggleTarea(i), tareas[i]?"↩ Desmarcar":"✔ Listo", { padding:"6px 12px", borderRadius:9, background:"#E6FAF0", color:C.sageDark, fontSize:11, fontWeight:800 })}
            </div>
          </div>
        ))}
      </>
    )}
  </>
)}
    </div>

    {[0,1].map(i => mdl("task-"+i, (
      <div key={i}>
        <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:3 }}>{["Registro de pensamientos","Diario de gratitud 3×3"][i]}</div>
        <div style={{ background:"#FFF8E6", borderRadius:11, padding:"9px 12px", fontSize:11, fontWeight:700, color:C.amberDark, marginBottom:12 }}>⭐ Ganarás +{[80,60][i]} XP</div>
        <textarea placeholder="Escribe tu reflexión aquí..." style={{ width:"100%", minHeight:90, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:13, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
        <div style={{ display:"flex", gap:8 }}>
          {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
          {btn(() => { setModal(null); showNotif("Reflexión enviada", "Tu psicólogo podrá ver tu respuesta", "📝"); }, "Enviar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
        </div>
      </div>
    )))}
    {bnav("notas")}
  </div>
)}
          {/* CALENDARIO */}
          {!notifPanel && screen === "calendario" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140 }}>
              <div style={{ background:`linear-gradient(145deg,${C.sageDark},${C.sage})`, padding:"18px 22px 22px" }}>
                <div style={{ fontSize:23, fontWeight:900, color:"white" }}>📅 Mis citas</div>
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
                    <div style={{ fontSize:15, fontWeight:800, color:C.text }}>Sin citas agendadas</div>
                    <div style={{ fontSize:12, marginTop:6 }}>Tu psicólogo agendará tu próxima sesión</div>
                  </div>
                ) : (
                  citas.map(c => (
                    <div key={c.id} style={{ background:"white", borderRadius:16, padding:"14px 16px", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.07)", borderLeft:`4px solid ${c.status==="cancelada"?C.red:c.status==="confirmada"?C.sageDark:C.amber}` }}>
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
                    {btn(() => setModal(null), "No aún", { flex:1, padding:12, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => actualizarStatusCita(citaSeleccionada.id, "confirmada"), "✓ Confirmar", { flex:1, padding:12, background:C.green, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
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
                    {btn(() => setModal(null), "Volver", { flex:1, padding:12, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => actualizarStatusCita(citaSeleccionada.id, "cancelada"), "Sí, cancelar", { flex:1, padding:12, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {bnav("calendario")}
            </div>
          )}

          {/* LOGROS */}
          {!notifPanel && screen === "logros" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:20 }}>
              <div style={{ background:`linear-gradient(145deg,${C.amberDark},${C.gold})`, padding:"18px 22px 28px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:6 }}>{avatar}</div>
                <div style={{ fontSize:19, fontWeight:900, color:"white" }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:700 }}>{getRango(xp).icono} {getRango(xp).nombre} · {xp} XP</div>
              </div>
              <div style={{ padding:"0 14px 14px" }}>
                <div style={{ background:"white", margin:"-14px 0 14px", borderRadius:18, padding:16, boxShadow:"0 4px 18px rgba(0,0,0,0.1)", position:"relative", zIndex:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:12, fontWeight:800, color:C.text }}>✨ Nivel 4 — Exploradora</span>
                    <span style={{ fontSize:12, fontWeight:800, color:C.amberDark }}>{xp} XP</span>
                  </div>
                  <div style={{ height:11, background:C.warm, borderRadius:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((xp % 50) / 50 * 100, 100)}%`, background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:5, transition:"width 0.5s ease" }}/>
                  </div>
                  <div style={{ fontSize:10, color:C.light, marginTop:5 }}>380 XP para Nivel 5 · Guerrera 💪</div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>🏅 Mis logros</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[["🌱","Primer Paso","Primer autorregistro","+50 XP",false],["🔥","En Racha","5 días seguidos","+100 XP",false],["💬","Comunicativa","10 sesiones","+150 XP",false],["📚","Lectora","5 recursos leídos","+80 XP",false],["⚔️","Guerrera","Nivel 5","🔒",true],["🌟","Constancia","30 días","🔒",true]].map(([ic,name,desc,xp,locked]) => (
                    <div key={name} style={{ background:"white", borderRadius:16, padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", textAlign:"center", opacity:locked?.4:1, filter:locked?"grayscale(1)":"none" }}>
                      <div style={{ fontSize:30, marginBottom:7 }}>{ic}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text }}>{name}</div>
                      <div style={{ fontSize:10, color:C.light, marginTop:2 }}>{desc}</div>
                      <div style={{ display:"inline-block", background:C.warm, color:C.amberDark, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, marginTop:5 }}>{xp}</div>
                    </div>
                  ))}
                </div>
              </div>
              {bnav("logros")}
            </div>
          )}

          {/* PERFIL */}
          {!notifPanel && screen === "perfil" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140 }}>
              <div style={{ background:"white", padding:22, textAlign:"center", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                <div onClick={() => setModal("avatar")} style={{ fontSize:60, marginBottom:4, cursor:"pointer" }}>{avatar}</div>
                <div style={{ fontSize:10, color:C.light, fontWeight:700, marginBottom:5 }}>Toca para cambiar</div>
                <div style={{ fontSize:21, fontWeight:900, color:C.text }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:12, color:C.light, fontWeight:600 }}>Miembro desde Enero 2026</div>
                <div style={{ display:"flex", justifyContent:"center", gap:7, marginTop:10, flexWrap:"wrap" }}>
                  {[`${getRango(xp).icono} ${getRango(xp).nombre}`,`⭐ ${xp} XP`,"🏅 Logros"].map(b => <span key={b} style={{ background:C.warm, borderRadius:9, padding:"5px 10px", fontSize:10, fontWeight:800, color:C.amberDark }}>{b}</span>)}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(0,0,0,0.06)", marginBottom:14 }}>
                {[["14","Registros"],["12","Sesiones"],["620","XP Total"]].map(([n,l]) => (
                  <div key={l} style={{ background:"white", padding:"14px 6px", textAlign:"center" }}>
                    <div style={{ fontSize:19, fontWeight:900, color:C.plum }}>{n}</div>
                    <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"0 14px" }}>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>🧠 Mi psicólogo</div>
                <div style={{ background:`linear-gradient(135deg,${C.dark},${C.plum})`, borderRadius:18, padding:16, display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                  <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, border:"2px solid rgba(255,255,255,0.3)" }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:900, color:"white" }}>Dr. Danilo Rincón</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Psicología Clínica · TCC</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:5, fontStyle:"italic" }}>"Estoy aquí para acompañarte."</div>
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>Mi cuenta</div>
                {mitem(avatar, "Cambiar avatar", () => setModal("avatar"))}
                {mitem("✏️", "Editar perfil", () => setModal("edit-perfil"))}
                {mitem("🔔", "Notificaciones", () => setNotifPanel(true))}                
                {mitem("🔒", "Privacidad y seguridad", () => showNotif("Privacidad", "Tu información está segura y encriptada", "🔒"))}
                {mitem("❓", "Ayuda y soporte", () => showNotif("Soporte", "Un agente te responderá pronto", "❓"))}
                {mitem("⭐", "Valorar a mi psicólogo", () => { cargarResenas(usuarioActual?.psicologoId); setModal("nueva-resena"); })}
                {mitem("🚪", "Cerrar sesión", () => showScreen("login"), true)}
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
                  {btn(() => { setModal(null); showNotif("Avatar actualizado", "Tu nuevo avatar fue guardado 🐾", "🐾"); }, "Guardar avatar ✓", { width:"100%", padding:14, background:C.plum, color:"white", borderRadius:14, fontSize:14, fontWeight:800 })}
                </div>
              ))}
              {mdl("edit-perfil", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Editar perfil</div>
                  <div style={{ fontSize:52, textAlign:"center", marginBottom:14 }}>{avatar}</div>
                  {[["Nombre", usuarioActual?.nombre || ""],["Correo", usuarioActual?.email || ""],["Teléfono", usuarioActual?.telefono || ""]].map(([l,v]) => (
                    <div key={l}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>{l}</div>
                      <input defaultValue={v} style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setModal(null); showNotif("Perfil guardado", "Tus datos fueron actualizados", "✏️"); }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
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
                      <div style={{ fontSize:13, fontWeight:800, color:"white" }}>Dr. Rincón</div>
                    </div>
                  )}
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:10 }}>Calificación</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} onClick={() => setResenaRating(i)}
                        style={{ fontSize:32, cursor:"pointer", opacity:resenaRating >= i ? 1 : 0.3, transition:"all 0.2s" }}>⭐</div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:6 }}>Tu reseña</div>
                  <textarea placeholder="Cuéntanos tu experiencia con tu psicólogo..." value={resenaTexto} onChange={e => setResenaTexto(e.target.value)}
                    style={{ width:"100%", minHeight:100, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, resize:"none", outline:"none", marginBottom:16, fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}/>
                  <div style={{ background:"#FFF8E1", borderRadius:10, padding:"10px 12px", marginBottom:16, fontSize:11, color:C.amberDark, fontWeight:700 }}>
                    🔒 Tu identidad permanecerá anónima
                  </div>
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140, background:"#F8F7FA" }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"18px 22px 22px", display:"flex", alignItems:"center", gap:12 }}>
                <div onClick={() => showScreen("admin-perfil")} style={{ fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.7)" }}>←</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:19, fontWeight:900, color:"white" }}>👥 Mis pacientes</div>
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
                    <div key={l} style={{ background:"white", borderRadius:14, padding:13, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize:21, fontWeight:900, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* CITAS HOY */}
                {citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length > 0 && (
                  <>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:10 }}>📅 Citas de hoy</div>
                    {citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).map(c => (
                      <div key={c.id} style={{ background:"white", borderRadius:14, padding:"12px 14px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", borderLeft:`4px solid ${C.sage}` }}>
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
                <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:10 }}>👤 Lista de pacientes</div>
                {pacientes.length === 0 ? (
                  <div style={{ textAlign:"center", padding:40, color:C.light }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>👥</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>Sin pacientes aún</div>
                    <div style={{ fontSize:12, marginTop:4 }}>El admin debe crear y asignarte pacientes</div>
                  </div>
                ) : (
                  pacientes.map(p => (
                    <div key={p.id} onClick={() => { setPacienteSeleccionado(p); showScreen("admin-paciente"); }}
                      style={{ background:"white", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", cursor:"pointer" }}>
                      <div style={{ width:46, height:46, background:`linear-gradient(135deg,${C.plum}20,${C.sage}20)`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👤</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{p.nombre}</div>
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
                {btn(() => setModal("agendar-cita"), "📅 Agendar nueva cita", { width:"100%", padding:13, background:`linear-gradient(135deg,${C.plum},#3D3055)`, color:"white", borderRadius:14, fontSize:13, fontWeight:800, marginTop:8, display:"block" })}
              </div>

              {mdl("agendar-cita", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📅 Agendar cita</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>El paciente verá la cita en su calendario</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Paciente</div>
                  <select value={citaPacienteId} onChange={e => setCitaPacienteId(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", background:"white", boxSizing:"border-box" }}>
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
              {anav("psi-dashboard")}
            </div>
          )}
          {/* ADMIN SaaS HOME */}
{!notifPanel && screen === "admin-home" && (
  <div style={{ height:"100%", overflowY:"auto", paddingBottom:140 }}>
    <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"18px 22px 22px", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ fontSize:34 }}>👑</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:19, fontWeight:900, color:"white" }}>Panel Administrador</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>Mipsicologo · Control total</div>
      </div>
    </div>
    <div style={{ padding:14 }}>

      {/* ESTADÍSTICAS */}
      <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📊 Estadísticas generales</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:9, marginBottom:18 }}>
        {[["🧠","Psicólogos activos","3"],["👥","Pacientes totales","68"],["💰","Ingresos del mes","$1.2M"],["⚠️","Cuentas inactivas","5"]].map(([ic,lb,val]) => (
          <div key={lb} style={{ background:"white", borderRadius:14, padding:13, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{ic}</div>
            <div style={{ fontSize:20, fontWeight:900, color:C.plum }}>{val}</div>
            <div style={{ fontSize:10, color:C.light, fontWeight:700 }}>{lb}</div>
          </div>
        ))}
      </div>

      {/* PSICÓLOGOS */}
      <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>🧠 Psicólogos</div>
      {[["Dr. Danilo Rincón","23 pacientes","Activo"],["Dra. Laura Gómez","18 pacientes","Activo"],["Dr. Carlos Mejía","12 pacientes","Inactivo"]].map(([nombre,sub,status]) => (
        <div key={nombre} style={{ background:"white", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:7, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:26, width:42, height:42, background:C.warm, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center" }}>🧠</div>
          <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>{nombre}</div><div style={{ fontSize:10, color:C.light }}>{sub}</div></div>
          <div style={{ marginLeft:"auto", background:status==="Activo"?"#A8C5B5":"#FFE0E0", color:status==="Activo"?C.sageDark:C.red, fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>{status}</div>
        </div>
      ))}

      {/* ACCIONES */}
      <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>⚡ Acciones</div>
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
        <div key={u.id} style={{ background:usuariosSeleccionados.includes(u.id)?"#F0EDF5":"white", borderRadius:13, padding:"11px 13px", marginBottom:8, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:`2px solid ${usuariosSeleccionados.includes(u.id)?C.plum:"transparent"}` }}>
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
          style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:16, outline:"none", fontFamily:"inherit", background:"white", boxSizing:"border-box" }}>
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140 }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"16px 22px 20px", display:"flex", alignItems:"center", gap:14 }}>
                <div onClick={() => showScreen("psi-dashboard")} style={{ fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.8)" }}>←</div>
                <div style={{ width:50, height:50, background:"rgba(255,255,255,0.15)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👤</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:900, color:"white" }}>{pacienteSeleccionado?.nombre || "Paciente"}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{pacienteSeleccionado?.email || ""}</div>
                </div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {[["14","Registros"],["12","Sesiones"],["620","XP"]].map(([n,l]) => (
                    <div key={l} style={{ background:"white", borderRadius:13, padding:"12px 8px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize:19, fontWeight:900, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"white", borderRadius:16, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:12 }}>📊 Estado de ánimo — últimos 7 días</div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:60 }}>
                    {[["😕",30,C.blue],["😐",45,C.amber],["🙂",55,C.sage],["😐",45,C.amber],["😕",28,C.red],["🙂",52,C.sage],["😄",58,C.green]].map(([e,h,col],i) => (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ fontSize:11 }}>{e}</div>
                        <div style={{ width:"100%", height:h, borderRadius:"4px 4px 0 0", background:col, opacity:.8 }}/>
                        <div style={{ fontSize:9, color:C.light, fontWeight:700 }}>{"LMMJVSD"[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📝 Autorregistros recientes</div>
                {[["Hoy · 8:42 AM · 😐","Mañana tranquila ☀️","Me desperté sin ansiedad. Hice ejercicios de respiración.",C.sage],["Ayer · 7:15 PM · 😕","Momento difícil en el trabajo","Conflicto con mi jefe. Usé el registro ABC.",C.red]].map(([date,title,text,col]) => (
                  <div key={title} style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${col}` }}>
                    <div style={{ fontSize:11, color:C.light, fontWeight:700, marginBottom:4 }}>{date}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4 }}>{title}</div>
                    <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>{text}</div>
                  </div>
                ))}
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>⚡ Acciones</div>
                {btn(() => setModal("assign-task"), "📋 Asignar nueva tarea", { width:"100%", padding:12, background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, color:"white", borderRadius:13, fontSize:13, fontWeight:800, marginBottom:10 })}
                {mitem("💬", "Nota clínica privada", () => setModal("feedback"))}
                {mitem("📅", "Agendar cita", () => setModal("agendar-cita"))}
                {mitem("📤", "Enviar material", () => showNotif("Material enviado", "Sofía lo recibirá en su app", "📤"))}
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>🔒 Notas clínicas</div>
                <div style={{ background:"white", borderRadius:16, padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", borderLeft:"3px solid #8B7BA0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontSize:12, fontWeight:800, color:C.text }}>Sesión 5 Mar · Progresos</div>
                    <div style={{ fontSize:10, color:C.light }}>Hace 5 días</div>
                  </div>
                  <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>Sofía muestra avances en identificar pensamientos automáticos.</div>
                  <div style={{ display:"inline-block", background:"#F0EDF5", color:C.plum, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, marginTop:5 }}>🔒 Solo visible para ti</div>
                </div>
              </div>
              {mdl("assign-task", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Asignar tarea 📋</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Título</div>
                  <input placeholder="Ej: Registro de pensamientos..." style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Descripción</div>
                  <textarea placeholder="Instrucciones para el paciente..." style={{ width:"100%", minHeight:80, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setModal(null); showNotif("Tarea asignada", "Sofía recibirá la tarea en su app", "📋"); }, "Asignar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("feedback", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Nota clínica 💬</div>
                  <div style={{ background:"#F0EDF5", borderRadius:11, padding:"10px 12px", marginBottom:12, fontSize:11, color:C.plum, fontWeight:700 }}>🔒 Solo visible para ti</div>
                  <textarea placeholder="Observaciones, progresos..." style={{ width:"100%", minHeight:110, padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:12, resize:"none", outline:"none", marginBottom:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setModal(null); showNotif("Nota guardada", "La nota clínica fue guardada", "💬"); }, "Guardar", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {anav("admin-paciente")}
            </div>
          )}

          {/* ADMIN PERFIL */}
          {!notifPanel && screen === "admin-perfil" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140, background:"#F8F7FA" }}>

              {/* HEADER */}
              <div style={{ background:`linear-gradient(160deg,${C.dark},${C.plum})`, padding:"32px 24px 48px", textAlign:"center", position:"relative" }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                  <div style={{ width:90, height:90, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, border:"3px solid rgba(255,255,255,0.25)", margin:"0 auto" }}>👨‍⚕️</div>
                  <div onClick={() => setModal("edit-psico")} style={{ position:"absolute", bottom:2, right:2, width:26, height:26, background:C.amber, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer", border:"2px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>✏️</div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:"white", marginBottom:4 }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600, marginBottom:12 }}>{usuarioActual?.email || ""}</div>
                <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(255,255,255,0.12)", color:"white", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20 }}>🧠 Psicólogo Clínico</span>
                  <span style={{ background:"rgba(255,255,255,0.12)", color:"white", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20 }}>TCC · Mindfulness</span>
                </div>
              </div>

              {/* STATS */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(0,0,0,0.06)", margin:"-1px 0 20px" }}>
                {[[pacientes.length || "0","Pacientes"],[citas.length || "0","Citas"],[citas.filter(c=>c.status==="confirmada").length || "0","Confirmadas"]].map(([n,l]) => (
                  <div key={l} style={{ background:"white", padding:"16px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:C.plum }}>{n}</div>
                    <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:"0 16px" }}>

                {/* ACCIONES RÁPIDAS */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                  {[["📅","Agendar cita",() => setModal("agendar-cita")],["👥","Mis pacientes",() => showScreen("psi-dashboard")],["💬","Nota clínica",() => setModal("feedback")],["🔔","Notificaciones",() => setNotifPanel(true)]].map(([ic,lb,fn]) => (
                    <div key={lb} onClick={fn} style={{ background:"white", borderRadius:16, padding:"16px 14px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ fontSize:28, marginBottom:6 }}>{ic}</div>
                      <div style={{ fontSize:12, fontWeight:800, color:C.text }}>{lb}</div>
                    </div>
                  ))}
                </div>

                {/* INFO PROFESIONAL */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>ℹ️ Información profesional</div>
                <div style={{ background:"white", borderRadius:16, padding:16, marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  {[["🎓","Formación","Psicología Clínica · Uni. Nacional"],["⏳","Experiencia","12 años de práctica clínica"],["🔬","Enfoque","TCC · Mindfulness · Aceptación"],["📞","Teléfono", usuarioActual?.telefono || "No registrado"]].map(([ic,lb,val]) => (
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
                <div style={{ background:"white", borderRadius:16, overflow:"hidden", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  {[["🔔","Notificaciones"],["📅","Disponibilidad"],["📊","Exportar datos"]].map(([ic,lb],i,arr) => (
                    <div key={lb} onClick={() => showNotif(lb, "Función disponible pronto", ic)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.04)":"none", cursor:"pointer" }}>
                      <div style={{ fontSize:18, width:32, textAlign:"center" }}>{ic}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, flex:1 }}>{lb}</div>
                      <div style={{ color:C.light, fontSize:16 }}>›</div>
                    </div>
                  ))}
                </div>
                {/* RESEÑAS */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>⭐ Reseñas de pacientes</div>
                {loadingResenas ? (
                  <div style={{ textAlign:"center", padding:20, color:C.light, fontSize:13 }}>Cargando reseñas...</div>
                ) : resenas.length === 0 ? (
                  <div style={{ background:"white", borderRadius:16, padding:20, textAlign:"center", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
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
                      <div key={r.id} style={{ background:"white", borderRadius:14, padding:14, marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
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

                {/* CERRAR SESIÓN */}
                <div onClick={() => showScreen("login")}
                  style={{ background:"white", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", marginBottom:8 }}>
                  <div style={{ fontSize:18, width:32, textAlign:"center" }}>🚪</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.red, flex:1 }}>Cerrar sesión</div>
                  <div style={{ color:C.red, fontSize:16 }}>›</div>
                </div>

              </div>

              {mdl("edit-psico", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:16, textAlign:"center" }}>✏️ Editar perfil</div>
                  {[["Nombre", usuarioActual?.nombre || ""],["Especialidad","Psicología Clínica · TCC"],["Experiencia","12 años"],["Teléfono", usuarioActual?.telefono || ""],["Correo", usuarioActual?.email || ""]].map(([l,v]) => (
                    <div key={l}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>{l}</div>
                      <input defaultValue={v} style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => setModal(null), "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setModal(null); showNotif("Perfil actualizado", "Los cambios fueron guardados", "✏️"); }, "Guardar ✓", { flex:2, padding:11, background:C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}

              {mdl("agendar-cita", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:4, textAlign:"center" }}>📅 Agendar cita</div>
                  <div style={{ fontSize:12, color:C.light, textAlign:"center", marginBottom:16 }}>El paciente verá la cita en su calendario</div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Paciente</div>
                  <select value={citaPacienteId} onChange={e => setCitaPacienteId(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", background:"white", boxSizing:"border-box" }}>
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
