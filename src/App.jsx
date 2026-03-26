import { useState, useEffect } from "react";
import { messaging, getToken, onMessage } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getDoc, doc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

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
          showScreen("home");
      } else if (rol === "psicologo") {
        setUsuarioActual({ uid, ...docSnap.data() });
        cargarCitas(uid, "psicologo");
        cargarRecordatorios(uid);
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
    const snap = await getDocs(collection(db, "recordatorios"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.psicologoId === psicologoId);
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
    const snap = await getDocs(collection(db, "notas"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(n => n.pacienteId === pacienteId)
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setInsights(lista);
  } catch(e) { console.log("Error notas:", e); }
};

const cargarAutorregistros = async (pacienteId) => {
  try {
    const snap = await getDocs(collection(db, "autorregistros"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(a => a.pacienteId === pacienteId)
      .sort((a,b) => new Date(b.creadaEn) - new Date(a.creadaEn));
    setAutorregistros(lista);
  } catch(e) { console.log("Error autorregistros:", e); }
};
const cargarRecursosPaciente = async (pacienteId) => {
  try {
    const snap = await getDocs(collection(db, "recursos"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.pacienteId === pacienteId)
      .sort((a,b) => new Date(b.creadoEn) - new Date(a.creadoEn));
    setRecursos(lista);
  } catch(e) { console.log("Error recursos:", e); }
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
      if (archivo.type.includes("pdf")) {
        url = data.secure_url.replace("/raw/upload/", "/raw/upload/fl_attachment/");
      }
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
    const snap = await getDocs(collection(db, "tareas"));
    const lista = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(t => t.pacienteId === pacienteId)
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
          showScreen("home");
          showScreen("home");
        } else if (data.rol === "psicologo") {
          cargarCitas(user.uid, "psicologo");
          cargarRecordatorios(user.uid);
          cargarResenas(user.uid);
          const pacientesSnap = await getDocs(collection(db, "usuarios"));
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

      <div onClick={async () => { 
  setNavOpen(false); 
  await signOut(auth);
  setUsuarioActual(null);
  showScreen("login"); 
}}
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
  if (checkingAuth) return (
  <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F0EBE3", fontFamily:"system-ui" }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🧠</div>
      <div style={{ fontSize:14, color:"#9A9AB0", fontWeight:700 }}>Cargando...</div>
    </div>
  </div>
);

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
    {showInstall && (
  <button onClick={handleInstall} style={{ marginTop:16, width:"100%", padding:"13px 0", background:"rgba(255,255,255,0.35)", color:"#5C4D2E", borderRadius:20, fontSize:13, fontWeight:800, border:"1.5px solid rgba(255,255,255,0.7)", cursor:"pointer", fontFamily:"inherit", letterSpacing:".3px", backdropFilter:"blur(8px)" }}>
    ⬇️ Descargar App
  </button>
)}

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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:100, background:"#F8F7FA" }}>

              {/* HEADER */}
              <div style={{ background:`linear-gradient(145deg,${C.plum},#3D3055)`, padding:"28px 24px 52px", position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>
                      {new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}
                    </div>
                    <div style={{ fontSize:26, color:"white", fontWeight:900, marginTop:4 }}>
                      Hola, {usuarioActual?.nombre?.split(" ")[0] || "Bienvenido"} 👋
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer" }}>
                      <div style={{ fontSize:22 }}>🔔</div>
                      {unread > 0 && <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"white" }}>{unread}</div>}
                    </div>
                    <div onClick={() => showScreen("perfil")} style={{ width:44, height:44, background:`linear-gradient(135deg,${C.amber},${C.gold})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, border:"2px solid rgba(255,255,255,0.3)", cursor:"pointer" }}>{avatar}</div>
                  </div>
                </div>

                {/* BARRA XP */}
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:14, padding:"10px 14px", marginTop:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:700 }}>{getRango(xp).icono} {getRango(xp).nombre}</span>
                    <span style={{ fontSize:11, color:C.amber, fontWeight:800 }}>{xp} XP</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.15)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((xp % 50) / 50 * 100, 100)}%`, background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:3, transition:"width 0.5s ease" }}/>
                  </div>
                </div>
              </div>

              {/* PRÓXIMA CITA */}
              <div style={{ padding:"0 16px", marginTop:-28, position:"relative", zIndex:10 }}>
                {citas.length === 0 ? (
                  <div style={{ background:"white", borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text }}>Sin citas agendadas</div>
                    <div style={{ fontSize:12, color:C.light, marginTop:4 }}>Tu psicólogo agendará tu próxima sesión</div>
                  </div>
                ) : (
                  (() => {
                    const proxima = citas.filter(c => c.status !== "cancelada").sort((a,b) => new Date(a.fecha) - new Date(b.fecha))[0];
                    if (!proxima) return null;
                    return (
                      <div style={{ background:"white", borderRadius:20, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", marginBottom:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                          <div style={{ fontSize:12, fontWeight:800, color:C.plum, textTransform:"uppercase", letterSpacing:0.5 }}>📅 Próxima cita</div>
                          <div style={{ background:proxima.status==="confirmada"?"#E6FAF0":"#FFF8E1", color:proxima.status==="confirmada"?C.sageDark:C.amberDark, fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:20 }}>
                            {proxima.status==="confirmada"?"✅ Confirmada":"⏳ Pendiente"}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                          <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:12, padding:"10px 12px", textAlign:"center", minWidth:52 }}>
                            <div style={{ fontSize:18, fontWeight:900, color:"white", lineHeight:1 }}>
                              {new Date(proxima.fecha).getDate()}
                            </div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", fontWeight:700, textTransform:"uppercase" }}>
                              {new Date(proxima.fecha).toLocaleDateString('es-CO', { month:'short' })}
                            </div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:15, fontWeight:900, color:C.text }}>Sesión con {proxima.psicologoNombre}</div>
                            <div style={{ fontSize:12, color:C.light, marginTop:3 }}>⏰ {proxima.hora} · {proxima.modalidad==="virtual"?"💻 Virtual":"🏥 Presencial"}</div>
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

                {/* FRASE SEMANA */}
                <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:20, padding:20, marginBottom:16 }}>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:700, marginBottom:8 }}>✨ Frase de la semana</div>
                  <div style={{ fontSize:15, color:"white", lineHeight:1.6, fontStyle:"italic" }}>"El coraje no es la ausencia de miedo, sino la decisión de que algo más es más importante."</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:8, fontWeight:700 }}>— Tu psicólogo</div>
                </div>
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
      <div key={r.id} style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${C.plum}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {r.tipo==="PDF"?"📄":r.tipo==="Audio"?"🎵":r.tipo==="Video"?"🎬":r.tipo==="Imagen"?"🖼️":"📎"}
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
        </div>
      </div>
    ))}
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:100, background:"#F8F7FA" }}>
              <div style={{ background:`linear-gradient(145deg,${C.amberDark},${C.gold})`, padding:"32px 24px 52px", textAlign:"center" }}>
                <div style={{ fontSize:64, marginBottom:10 }}>{getRango(xp).icono}</div>
                <div style={{ fontSize:28, fontWeight:900, color:"white", marginBottom:4 }}>{getRango(xp).nombre}</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{usuarioActual?.nombre?.split(" ")[0] || "Tú"} · {xp} puntos acumulados</div>
              </div>

              <div style={{ padding:"0 16px", marginTop:-24, position:"relative", zIndex:10 }}>
                {/* TARJETA XP */}
                <div style={{ background:"white", borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text }}>Tu progreso</div>
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
                <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:12 }}>Todos los rangos</div>
                {[{min:0,max:49,nombre:"Primigenio",icono:"🪨",desc:"El inicio del camino"},
                  {min:50,max:99,nombre:"Habilis",icono:"🖐️",desc:"Usando las herramientas"},
                  {min:100,max:149,nombre:"Erectus",icono:"🔥",desc:"El fuego interior"},
                  {min:150,max:199,nombre:"Sapiens",icono:"👁️",desc:"La visión interna"},
                  {min:200,max:Infinity,nombre:"Sapiens Sapiens",icono:"💎",desc:"Claridad total"}
                ].map(r => (
                  <div key={r.nombre} style={{ background:"white", borderRadius:16, padding:"14px 16px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:14, opacity:xp >= r.min ? 1 : 0.4 }}>
                    <div style={{ fontSize:32, width:52, height:52, background:xp>=r.min?`${C.amber}20`:"#F5F5F5", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>{r.icono}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{r.nombre}</div>
                      <div style={{ fontSize:11, color:C.light, marginTop:2 }}>{r.desc} · {r.min}–{r.max === Infinity ? "∞" : r.max} pts</div>
                    </div>
                    {xp >= r.min && xp <= r.max && <div style={{ background:`${C.amber}20`, color:C.amberDark, fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20 }}>Actual</div>}
                    {xp > r.max && <div style={{ color:C.sageDark, fontSize:18 }}>✅</div>}
                    {xp < r.min && <div style={{ color:C.light, fontSize:18 }}>🔒</div>}
                  </div>
                ))}

                {/* CÓMO GANAR PUNTOS */}
                <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:12, marginTop:4 }}>¿Cómo ganar puntos?</div>
                <div style={{ background:"white", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:100, background:"#F8F7FA" }}>

              {/* HEADER */}
              <div style={{ background:`linear-gradient(145deg,${C.plum},#3D3055)`, padding:"32px 24px 52px", textAlign:"center" }}>
                <div onClick={() => setModal("avatar")} style={{ position:"relative", display:"inline-block", marginBottom:12, cursor:"pointer" }}>
                  <div style={{ fontSize:64 }}>{avatar}</div>
                  <div style={{ position:"absolute", bottom:0, right:-4, width:24, height:24, background:C.amber, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, border:"2px solid white" }}>✏️</div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:"white", marginBottom:4 }}>{usuarioActual?.nombre || "Mi perfil"}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:12 }}>{usuarioActual?.email || ""}</div>
                <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"5px 14px", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:13 }}>{getRango(xp).icono}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"white" }}>{getRango(xp).nombre} · {xp} XP</span>
                </div>
              </div>

              <div style={{ padding:"0 16px", marginTop:-24, position:"relative", zIndex:10 }}>

                {/* MI PSICÓLOGO */}
                <div onClick={async () => { setPsicologoData(null); showScreen("perfil-psicologo"); }}
                  style={{ background:`linear-gradient(135deg,${C.dark},${C.plum})`, borderRadius:20, padding:18, display:"flex", alignItems:"center", gap:14, marginBottom:16, cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                  <div style={{ width:56, height:56, background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0, border:"2px solid rgba(255,255,255,0.2)" }}>👨‍⚕️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Mi psicólogo</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"white" }}>{usuarioActual?.psicologoNombre || "Dr. Rincón"}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>Toca para ver su perfil completo</div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:20 }}>›</div>
                </div>

                {/* MI CUENTA */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>Mi cuenta</div>
                <div style={{ background:"white", borderRadius:16, overflow:"hidden", marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  {[
                    [avatar, "Cambiar avatar", () => setModal("avatar")],
                    ["✏️", "Editar perfil", () => { setEditNombre(usuarioActual?.nombre || ""); setEditTel(usuarioActual?.telefono || ""); setModal("edit-perfil"); }],
                    ["🔔", "Notificaciones", () => setNotifPanel(true)],
                  ].map(([ic,lb,fn],i,arr) => (
                    <div key={lb} onClick={fn}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.04)":"none", cursor:"pointer" }}>
                      <div style={{ fontSize:18, width:36, height:36, background:C.warm, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ic}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.text }}>{lb}</div>
                      <div style={{ color:C.light, fontSize:16 }}>›</div>
                    </div>
                  ))}
                </div>

                {/* CONFIGURACIÓN */}
                <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:10 }}>Configuración</div>
                <div style={{ background:"white", borderRadius:16, overflow:"hidden", marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  {[
                    ["🛡️", "Privacidad y seguridad", () => setModal("privacidad")],
                  ].map(([ic,lb,fn],i,arr) => (
                    <div key={lb} onClick={fn}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.04)":"none", cursor:"pointer" }}>
                      <div style={{ fontSize:18, width:36, height:36, background:C.warm, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ic}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.text }}>{lb}</div>
                      <div style={{ color:C.light, fontSize:16 }}>›</div>
                    </div>
                  ))}
                </div>

                {/* VALORAR */}
                <div onClick={() => { cargarResenas(usuarioActual?.psicologoId); setModal("nueva-resena"); }}
                  style={{ background:"white", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:12, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:18, width:36, height:36, background:"#FFF8E1", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>⭐</div>
                  <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.text }}>Valorar a mi psicólogo</div>
                  <div style={{ color:C.light, fontSize:16 }}>›</div>
                </div>

                {/* CERRAR SESIÓN */}
                <div onClick={() => showScreen("login")}
                  style={{ background:"white", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:8, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:18, width:36, height:36, background:"#FFE5E5", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>🚪</div>
                  <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.red }}>Cerrar sesión</div>
                  <div style={{ color:C.red, fontSize:16 }}>›</div>
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
                  {btn(() => { setModal(null); showNotif("Avatar actualizado", "Tu nuevo avatar fue guardado 🐾", "🐾"); }, "Guardar avatar ✓", { width:"100%", padding:14, background:C.plum, color:"white", borderRadius:14, fontSize:14, fontWeight:800 })}
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
    <div style={{ background:"white", borderRadius:14, padding:14, marginBottom:10, border:`2px solid rgba(0,0,0,0.06)` }}>
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

    {btn(() => { setPinAnterior(""); setPinNuevo(""); setPinNuevo2(""); setModal("cambiar-pin"); }, "🔑 Cambiar PIN de acceso", { width:"100%", padding:13, background:"white", color:C.text, borderRadius:12, fontSize:13, fontWeight:800, border:`2px solid rgba(0,0,0,0.08)`, marginBottom:10 })}
    {btn(() => setModal(null), "Cerrar", { width:"100%", padding:12, background:C.warm, color:C.text, borderRadius:12, fontSize:13, fontWeight:800 })}
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:100, background:"#F8F7FA" }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"24px 22px 52px", textAlign:"center", position:"relative" }}>
                <div onClick={() => showScreen("perfil")} style={{ position:"absolute", top:20, left:20, fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.7)" }}>←</div>
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
                <div style={{ background:"white", borderRadius:20, padding:18, marginBottom:14, boxShadow:"0 4px 20px rgba(0,0,0,0.07)" }}>
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
                <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:12 }}>⭐ Reseñas</div>
                {loadingResenas ? (
                  <div style={{ textAlign:"center", padding:20, color:C.light }}>Cargando...</div>
                ) : resenas.length === 0 ? (
                  <div style={{ background:"white", borderRadius:16, padding:20, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize:11, color:C.light }}>Aún no hay reseñas</div>
                  </div>
                ) : (
                  <>
                    <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:16, padding:16, marginBottom:12, textAlign:"center" }}>
                      <div style={{ fontSize:32, fontWeight:900, color:"white" }}>{(resenas.reduce((a,r) => a+r.rating, 0) / resenas.length).toFixed(1)} ⭐</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{resenas.length} reseña{resenas.length !== 1 ? "s" : ""}</div>
                    </div>
                    {resenas.map(r => (
                      <div key={r.id} style={{ background:"white", borderRadius:14, padding:14, marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
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

                {btn(() => { cargarResenas(usuarioActual?.psicologoId); setModal("nueva-resena"); }, "⭐ Escribir reseña", { width:"100%", padding:13, background:C.plum, color:"white", borderRadius:14, fontSize:13, fontWeight:800, marginTop:8, display:"block" })}
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
                    <div key={p.id} onClick={() => { setPacienteSeleccionado(p); cargarTareasPaciente(p.id); cargarRecursosPaciente(p.id); showScreen("admin-paciente"); }}
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
                {btn(() => setModal("crear-recordatorio"), "🔔 Nuevo recordatorio", {
  width:"100%", padding:13, background:"white", color:C.text,
  borderRadius:12, fontSize:13, fontWeight:800,
  border:`2px solid rgba(0,0,0,0.08)`, marginBottom:8, marginTop:8
})}

{recordatorios.filter(r => r.pacienteId === pacienteSeleccionado?.id).length > 0 && (
  <div style={{ marginTop:12 }}>
    <div style={{ fontSize:12, fontWeight:800, color:C.light, marginBottom:8 }}>RECORDATORIOS ACTIVOS</div>
    {recordatorios
      .filter(r => r.pacienteId === pacienteSeleccionado?.id)
      .map(r => (
        <div key={r.id} style={{ background:"white", borderRadius:12, padding:12, marginBottom:8, border:`2px solid rgba(0,0,0,0.06)` }}>
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
                {mitem("🔔", "Programar notificación", () => setModal("programar-notif"))}
                {mitem("🔔", "Recordatorios recurrentes", () => setModal("crear-recordatorio"))}
                {mitem("📤", "Enviar material", () => setModal("enviar-material"))}
                {recordatorios.filter(r => r.pacienteId === pacienteSeleccionado?.id).length > 0 && (
  <div style={{ marginTop:4, marginBottom:4 }}>
    <div style={{ fontSize:12, fontWeight:800, color:C.light, margin:"12px 0 8px" }}>RECORDATORIOS ACTIVOS</div>
    {recordatorios
      .filter(r => r.pacienteId === pacienteSeleccionado?.id)
      .map(r => (
        <div key={r.id} style={{ background:"white", borderRadius:12, padding:12, marginBottom:8, border:`2px solid rgba(0,0,0,0.06)` }}>
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
<div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>📤 Materiales enviados</div>
{recursos.length === 0 ? (
  <div style={{ background:"white", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>No hay materiales enviados aún</div>
) : recursos.map(r => (
  <div key={r.id} style={{ background:"white", borderRadius:16, padding:14, marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", borderLeft:`4px solid ${r.recibido ? C.green : C.sage}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
  </div>
))}
<div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>📋 Tareas asignadas</div>
{tareasPsicologo.length === 0 ? (
  <div style={{ background:"white", borderRadius:14, padding:16, textAlign:"center", color:C.light, fontSize:12, marginBottom:12 }}>No hay tareas asignadas aún</div>
) : tareasPsicologo.map(t => (
  <div key={t.id} style={{ background:"white", borderRadius:16, padding:14, marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", borderLeft:`4px solid ${t.completada ? C.green : C.sage}` }}>
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

                  {/* ZONA DE SUBIDA */}
                  <label style={{ display:"block", cursor:"pointer" }}>
                    <input type="file" accept=".pdf,.mp3,.mp4,.jpg,.jpeg,.png,.wav,.mov" style={{ display:"none" }}
                      onChange={e => { if(e.target.files[0]) subirArchivoCloudinary(e.target.files[0]); }}/>
                    <div style={{ border:`2px dashed ${recursoUrl ? C.sage : "rgba(0,0,0,0.15)"}`, borderRadius:14, padding:"20px 14px", textAlign:"center", background:recursoUrl ? "#F0FBF4" : "#FAFAFA", marginBottom:12, transition:"all 0.2s" }}>
                      {subiendoArchivo ? (
                        <div>
                          <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>
                          <div style={{ fontSize:12, color:C.light }}>Subiendo archivo...</div>
                        </div>
                      ) : recursoUrl ? (
                        <div>
                          <div style={{ fontSize:24, marginBottom:6 }}>✅</div>
                          <div style={{ fontSize:12, fontWeight:800, color:C.sageDark }}>Archivo subido correctamente</div>
                          <div style={{ fontSize:10, color:C.light, marginTop:3 }}>Toca para cambiar el archivo</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize:32, marginBottom:8 }}>📎</div>
                          <div style={{ fontSize:13, fontWeight:800, color:C.text }}>Toca para seleccionar archivo</div>
                          <div style={{ fontSize:11, color:C.light, marginTop:4 }}>PDF, Audio, Video, Imagen</div>
                        </div>
                      )}
                    </div>
                  </label>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:5 }}>Nombre del material</div>
                  <input placeholder="Ej: Técnica de respiración 4-7-8" value={recursoNombre} onChange={e => setRecursoNombre(e.target.value)}
                    style={{ width:"100%", padding:"11px 13px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:11, fontSize:13, marginBottom:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>

                  <div style={{ fontSize:11, fontWeight:800, color:C.text, marginBottom:8 }}>Tipo detectado</div>
                  <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                    {["PDF","Imagen","Otro"].map(tipo => (
                      <div key={tipo} onClick={() => setRecursoTipo(tipo)}
                        style={{ flex:1, padding:"8px 0", borderRadius:10, textAlign:"center", cursor:"pointer", fontSize:11, fontWeight:800, border:`2px solid ${recursoTipo===tipo ? C.plum : "rgba(0,0,0,0.08)"}`, background:recursoTipo===tipo ? `${C.plum}15` : "white", color:recursoTipo===tipo ? C.plum : C.light }}>
                        {tipo}
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", gap:8 }}>
                    {btn(() => { setModal(null); setRecursoUrl(""); setRecursoNombre(""); }, "Cancelar", { flex:1, padding:11, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => enviarRecurso(), loadingRecurso ? "Enviando..." : "Enviar ✓", { flex:2, padding:11, background:(!recursoUrl || loadingRecurso || subiendoArchivo) ? C.light : C.plum, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:140, background:"#F8F7FA" }}>

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
