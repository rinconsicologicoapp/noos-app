import { useState } from "react";

export default function NOOS() {
  const [screen, setScreen] = useState("login");
  const [noteTab, setNoteTab] = useState("notas");
  const [avatar, setAvatar] = useState("🦋");
  const [modal, setModal] = useState(null);
  const [mood, setMood] = useState(2);
  const [tareas, setTareas] = useState([false, false]);
  const [citaStatus, setCitaStatus] = useState("pending");
  const [adminCitaStatus, setAdminCitaStatus] = useState("pending");
  const [toast, setToast] = useState(null);
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, icon:"📅", title:"Cita mañana", msg:"Recuerda tu sesión con Dr. García mañana a las 10:00 AM", time:"Hace 1h", read:false },
    { id:2, icon:"🎯", title:"Nueva tarea asignada", msg:"Dr. García te asignó: Registro de pensamientos automáticos", time:"Hace 3h", read:false },
    { id:3, icon:"✨", title:"Frase de la semana", msg:'"El coraje no es la ausencia de miedo..." — Dr. García', time:"Hace 1 día", read:true },
    { id:4, icon:"🔥", title:"¡Racha de 5 días!", msg:"Llevas 5 días seguidos registrando. +100 XP bonus", time:"Hace 2 días", read:true },
  ]);

  const unread = notifs.filter(n => !n.read).length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const showNotif = (title, msg, icon = "🔔") => {
    setNotifs(prev => [{ id: Date.now(), icon, title, msg, time: "Ahora", read: false }, ...prev]);
    showToast(`${icon} ${title}`);
  };

  const showScreen = (id) => { setNotifPanel(false); setModal(null); setScreen(id); };

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const toggleTarea = (i) => {
    const next = [...tareas]; next[i] = !next[i]; setTareas(next);
    if (!tareas[i]) showNotif("¡Tarea completada!", "Ganaste +80 XP", "⭐");
  };

  const pendientes = tareas.filter(t => !t).length;

  const C = {
    plum:"#5C4D6E", sage:"#7DAA92", sageDark:"#4E7A63", amber:"#E8A87C",
    amberDark:"#C97D4E", cream:"#FAF7F2", warm:"#F0E6D3", text:"#2C2C3A",
    light:"#7A7A8A", gold:"#D4A843", red:"#E87070", blue:"#70A0E8",
    green:"#70C89A", dark:"#1a1a2e"
  };

  const avatars = ["🦋","🦁","🐺","🦊","🐘","🦅","🐬","🦉","🐆","🦓","🐢","🦜"];

  const btn = (onClick, children, s = {}) => (
    <button onClick={onClick} style={{ border:"none", cursor:"pointer", fontFamily:"inherit", ...s }}>{children}</button>
  );

  const mitem = (icon, label, onClick, danger) => (
    <div onClick={onClick} style={{ background:"white", borderRadius:13, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:7, cursor:"pointer" }}>
      <div style={{ fontSize:18, width:34, height:34, background:C.warm, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:700, color:danger?C.red:C.text, flex:1 }}>{label}</div>
      <div style={{ color:C.light }}>›</div>
    </div>
  );

  const bnav = (active) => (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:72, background:"white", borderTop:"1px solid rgba(0,0,0,0.06)", display:"flex", alignItems:"center", justifyContent:"space-around", paddingBottom:8, zIndex:100, borderRadius:"0 0 44px 44px" }}>
      {[["🏠","Inicio","home"],["📝","Notas","notas"],["📚","Recursos","materiales"],["📅","Citas","calendario"],["👤","Perfil","perfil"]].map(([ic,lb,id]) => (
        <div key={id} onClick={() => showScreen(id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer" }}>
          <div style={{ fontSize:22, opacity:active===id?1:0.35 }}>{ic}</div>
          <div style={{ width:4, height:4, borderRadius:"50%", background:C.sageDark, opacity:active===id?1:0 }}/>
          <div style={{ fontSize:10, fontWeight:700, color:active===id?C.sageDark:"#aaa" }}>{lb}</div>
        </div>
      ))}
    </div>
  );

  const anav = (active) => (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:72, background:C.dark, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-around", paddingBottom:8, zIndex:100, borderRadius:"0 0 44px 44px" }}>
      {[["📊","Dashboard","admin-home"],["👥","Pacientes","admin-paciente"],["🧠","Mi Perfil","admin-perfil"]].map(([ic,lb,id]) => (
        <div key={id} onClick={() => showScreen(id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer" }}>
          <div style={{ fontSize:20, opacity:active===id?1:0.35 }}>{ic}</div>
          <div style={{ fontSize:9, fontWeight:700, color:active===id?C.amber:"rgba(255,255,255,0.4)" }}>{lb}</div>
        </div>
      ))}
    </div>
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
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#E8EDF0", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:20 }}>
      <div style={{ fontSize:26, fontWeight:900, color:C.plum, marginBottom:4 }}>🛋️ Mi psicólogo</div>
      <div style={{ fontSize:12, color:"#7A7A8A", marginBottom:14 }}>Prototipo v3 · Interactivo</div>

      {/* NAV EXTERNO */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20, alignItems:"center" }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#7A7A8A", textTransform:"uppercase" }}>👤 Paciente:</span>
          <div style={{ display:"flex", gap:4, background:"white", padding:5, borderRadius:14, boxShadow:"0 2px 10px rgba(0,0,0,0.08)", flexWrap:"wrap", justifyContent:"center" }}>
            {[["🔐 Login","login"],["🏠 Inicio","home"],["📝 Notas","notas"],["📚 Recursos","materiales"],["📅 Calendario","calendario"],["🏆 Logros","logros"],["👤 Perfil","perfil"]].map(([lb,id]) => (
              <button key={id} onClick={() => showScreen(id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:screen===id?C.plum:"transparent", color:screen===id?"white":"#7A7A8A", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{lb}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#7A7A8A", textTransform:"uppercase" }}>🛡️ Psicólogo:</span>
          <div style={{ display:"flex", gap:4, background:"white", padding:5, borderRadius:14, boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
            {[["📊 Dashboard","admin-home"],["🔍 Ver Paciente","admin-paciente"],["🧠 Mi Perfil","admin-perfil"]].map(([lb,id]) => (
              <button key={id} onClick={() => showScreen(id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:screen===id?C.dark:"transparent", color:screen===id?"white":"#7A7A8A", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{lb}</button>
            ))}
          </div>
        </div>
      </div>

      {/* TELÉFONO */}
      <div style={{ width:375, height:780, background:C.cream, borderRadius:44, boxShadow:"0 30px 80px rgba(0,0,0,0.2),0 0 0 10px #1a1a2e,0 0 0 12px #2a2a4e", overflow:"hidden", position:"relative", flexShrink:0 }}>

        {/* STATUS BAR */}
        <div style={{ height:44, background:C.cream, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", fontSize:12, fontWeight:800, color:C.text }}>
          <span>9:41</span>
          <div style={{ display:"flex", gap:5, fontSize:13 }}><span>●●●</span><span>WiFi</span><span>🔋</span></div>
        </div>

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
            <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:`linear-gradient(160deg,${C.cream},${C.warm})` }}>
              <div style={{ fontSize:36, color:C.plum, letterSpacing:0, margin:"10px 0 8px 0", fontWeight:900, position:"relative", top:-40 }}>Mi psicólogo</div>
              <div style={{ fontSize:60, marginBottom:16 }}>🛋️</div>
              <div style={{ fontSize:12, color:C.light, fontWeight:600, marginBottom:32, textAlign:"center", lineHeight:1.6 }}><br/></div>
              <div style={{ width:"100%" }}>
                {[["Usuario","tu@correo.com","text"],["Contraseña","••••••••","password"]].map(([l,p,t]) => (
                  <div key={l}>
                    <div style={{ fontSize:12, fontWeight:800, color:C.text, marginBottom:5 }}>{l}</div>
                    <input type={t} placeholder={p} style={{ width:"100%", padding:"13px 15px", border:"2px solid rgba(0,0,0,0.08)", borderRadius:13, fontSize:13, marginBottom:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  </div>
                ))}
                {btn(() => showScreen("home"), "Iniciar sesión", { width:"100%", padding:15, background:C.plum, color:"white", borderRadius:15, fontSize:14, fontWeight:800 })}
              </div>
              <div style={{ marginTop:12, fontSize:12, color:C.light, fontWeight:600 }}>¿Olvidaste tu contraseña?</div>
            </div>
          )}

          {/* HOME */}
          {!notifPanel && screen === "home" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:`linear-gradient(145deg,${C.plum},#3D3055)`, padding:"20px 24px 76px", position:"relative" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>¡Buenos días,</div>
                <div style={{ fontSize:23, color:"white", fontWeight:900 }}>Sofía 👋</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:3 }}>Martes, 10 de marzo · Semana 11</div>
                <div style={{ position:"absolute", top:18, right:22, display:"flex", gap:10, alignItems:"center" }}>
                  <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer" }}>
                    <div style={{ fontSize:24 }}>🔔</div>
                    {unread > 0 && <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"white", border:"2px solid #3D3055" }}>{unread}</div>}
                  </div>
                  <div onClick={() => showScreen("perfil")} style={{ width:50, height:50, background:`linear-gradient(135deg,${C.amber},${C.gold})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border:"3px solid rgba(255,255,255,0.3)", cursor:"pointer" }}>{avatar}</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:18, padding:"12px 14px", marginTop:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>✨ Nivel 4 · Exploradora</span>
                    <span style={{ fontSize:11, color:C.amber, fontWeight:800 }}>620 / 1000 XP</span>
                  </div>
                  <div style={{ height:7, background:"rgba(255,255,255,0.15)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:"62%", background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:4 }}/>
                  </div>
                </div>
              </div>
              <div style={{ padding:"0 14px", marginTop:-42, position:"relative", zIndex:10 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[[`linear-gradient(135deg,${C.sage},${C.sageDark})`,"📝","Autoregistros","14","este mes",true],["white","🎯","Tareas","3/5","completadas",false],["white","📅","Próx. cita","Mar 15","10:00 AM",false],["white","🏅","Logros","8","desbloqueados",false]].map(([bg,ic,lb,val,sub,inv]) => (
                    <div key={lb} style={{ background:bg, borderRadius:18, padding:"16px 14px", boxShadow:"0 4px 14px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontSize:26, marginBottom:8 }}>{ic}</div>
                      <div style={{ fontSize:10, color:inv?"rgba(255,255,255,0.8)":C.light, fontWeight:700, textTransform:"uppercase" }}>{lb}</div>
                      <div style={{ fontSize:20, fontWeight:900, color:inv?"white":C.text, marginTop:2 }}>{val}</div>
                      <div style={{ fontSize:10, color:inv?"rgba(255,255,255,0.7)":C.light }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"linear-gradient(135deg,#FFF8EE,#FFF0DC)", border:`1.5px solid ${C.amber}`, borderRadius:18, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ fontSize:30 }}>🔥</div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:900, color:C.amberDark }}>5 días seguidos</div>
                    <div style={{ fontSize:11, color:C.light, fontWeight:600 }}>¡Sigue así! Estás en racha 💪</div>
                  </div>
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
              <div style={{ background:"white", padding:"14px 22px 0", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:21, fontWeight:900, color:C.text }}>Notas & Tareas</div>
                <div style={{ fontSize:11, color:C.light, fontWeight:600, marginBottom:10 }}>Tu espacio personal de registro</div>
                <div style={{ display:"flex", borderBottom:"2px solid rgba(0,0,0,0.06)" }}>
                  {[["📝 Mis Notas","notas"],["🎯 Tareas","tareas"]].map(([lb,id]) => (
                    <button key={id} onClick={() => setNoteTab(id)} style={{ flex:1, padding:"11px 0", fontSize:12, fontWeight:800, color:noteTab===id?C.plum:C.light, border:"none", background:"transparent", borderBottom:`3px solid ${noteTab===id?C.plum:"transparent"}`, marginBottom:-2, cursor:"pointer", fontFamily:"inherit" }}>
                      {lb}{id==="tareas" && pendientes > 0 && <span style={{ background:C.amber, color:"white", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20, marginLeft:6 }}>{pendientes}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:14, paddingBottom:80 }}>
                {noteTab === "notas" && (
                  <>
                    <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:12 }}>¿Cómo te sientes hoy?</div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        {[["😞","Mal"],["😕","Regular"],["😐","Neutro"],["🙂","Bien"],["😄","Genial"]].map(([e,l],i) => (
                          <div key={i} onClick={() => { setMood(i); if(i >= 3) showNotif("¡Buen ánimo!", `Registraste que te sientes ${l}`, "😊"); }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"7px 9px", borderRadius:11, background:mood===i?C.warm:"transparent" }}>
                            <span style={{ fontSize:24 }}>{e}</span>
                            <span style={{ fontSize:9, color:C.light, fontWeight:700 }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {[["Hoy · 8:42 AM","Mañana tranquila ☀️","Me desperté sin ansiedad. Hice los ejercicios de respiración.",C.sage,["😌 Calma","🧘 Respiración"]],["Ayer · 7:15 PM","Momento difícil en el trabajo","Conflicto con mi jefe. Usé el registro ABC.",C.red,["😰 Ansiedad","💼 Trabajo"]],["8 Mar · 9:00 PM","Reflexión antes de dormir","Logré no catastrofizar cuando me atrasé al gimnasio.",C.blue,["🌙 Noche","✅ Logro"]]].map(([date,title,text,color,tags]) => (
                      <div key={title} style={{ background:"white", borderRadius:18, padding:16, marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${color}` }}>
                        <div style={{ fontSize:11, color:C.light, fontWeight:700, marginBottom:4 }}>{date}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4 }}>{title}</div>
                        <div style={{ fontSize:12, color:C.light, lineHeight:1.5 }}>{text}</div>
                        <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap" }}>
                          {tags.map(t => <span key={t} style={{ background:C.warm, color:C.amberDark, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {noteTab === "tareas" && (
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
                    <div style={{ background:"white", borderRadius:18, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${C.green}`, opacity:.75 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"white", flexShrink:0 }}>✓</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:C.light, textDecoration:"line-through" }}>Registro ABC de situación de estrés</div>
                          <div style={{ fontSize:10, color:C.light, marginTop:4 }}>✅ Completada el 8 Mar</div>
                        </div>
                      </div>
                    </div>
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

          {/* RECURSOS */}
          {!notifPanel && screen === "materiales" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:"white", padding:"14px 22px", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:21, fontWeight:900, color:C.text }}>Recursos 📚</div>
                <div style={{ fontSize:11, color:C.light, fontWeight:600 }}>Materiales enviados por Dr. García</div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ background:`linear-gradient(135deg,${C.plum},#3D3055)`, borderRadius:20, padding:20, marginBottom:16 }}>
                  <div style={{ fontSize:16, color:"white", lineHeight:1.5, fontStyle:"italic" }}>"El coraje no es la ausencia de miedo, sino la decisión de que algo más es más importante."</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:8, fontWeight:700 }}>— Dr. García · Esta semana</div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📄 Materiales</div>
                {[["📄","Técnicas de respiración diafragmática","PDF · Enviado hoy","🆕","#FFE8E8",true],["🎥","Meditación guiada 10 min","Video · Hace 3 días","Ver ›","#E8F0FF",false],["📄","Hoja de registro ABC","PDF · Hace 1 semana","Abrir ›","#FFE8E8",false],["🎧","Relajación muscular progresiva","Audio · Hace 2 semanas","Escuchar ›","#E8FFF0",false],["🔗","Artículo: Reestructuración cognitiva","Enlace · Hace 3 semanas","Leer ›","#FFF5E8",false]].map(([ic,title,sub,badge,bg,isNew]) => (
                  <div key={title} onClick={() => showNotif("Material abierto", title, ic)} style={{ background:"white", borderRadius:18, padding:"14px 16px", marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                    <div style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, background:bg, flexShrink:0 }}>{ic}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{title}</div>
                      <div style={{ fontSize:11, color:C.light, marginTop:1 }}>{sub}</div>
                    </div>
                    <div style={{ background:isNew?"#E8FFF0":C.warm, color:isNew?C.sageDark:C.amberDark, fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:10 }}>{badge}</div>
                  </div>
                ))}
              </div>
              {bnav("materiales")}
            </div>
          )}

          {/* CALENDARIO */}
          {!notifPanel && screen === "calendario" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:`linear-gradient(145deg,${C.sageDark},${C.sage})`, padding:"18px 22px 22px" }}>
                <div style={{ fontSize:23, fontWeight:900, color:"white" }}>Marzo 2026</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>Vista paciente</div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:5 }}>
                  {["Lu","Ma","Mi","Ju","Vi","Sa","Do"].map(d => <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:800, color:C.light, padding:"3px 0" }}>{d}</div>)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:14 }}>
                  {[{d:"24",dim:true},{d:"25",dim:true},{d:"26",dim:true},{d:"27",dim:true},{d:"28",dim:true},{d:"1",dim:true},{d:"2",dim:true},{d:"3",ev:true},{d:"4"},{d:"5",cita:true},{d:"6"},{d:"7"},{d:"8"},{d:"9"},{d:"10",today:true},{d:"11"},{d:"12"},{d:"13"},{d:"14"},{d:"15",cita:true},{d:"16"},{d:"17"},{d:"18"},{d:"19",ev:true},{d:"20"},{d:"21"},{d:"22"},{d:"23",cita:true},{d:"24"},{d:"25"},{d:"26"},{d:"27"},{d:"28"},{d:"29"},{d:"30"},{d:"31",cita:true}].map(({d,dim,today,ev,cita},i) => (
                    <div key={i} style={{ aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", paddingTop:10, fontSize:12, fontWeight:700, borderRadius:9, position:"relative", color:today?"white":dim?"rgba(0,0,0,0.25)":C.text, background:today?C.plum:"transparent", cursor:"pointer" }}>
                      {d}
                      {(ev||cita) && <div style={{ position:"absolute", bottom:2, width:4, height:4, borderRadius:"50%", background:cita?C.sageDark:C.amber }}/>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>Tus citas — Marzo</div>
                <div style={{ background:"white", borderRadius:14, padding:"12px 14px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                    <div style={{ width:4, height:34, borderRadius:2, background:C.sageDark, flexShrink:0 }}/>
                    <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>Sesión con Dr. García</div><div style={{ fontSize:11, color:C.light }}>Sáb 15 · 10:00 AM · Presencial</div></div>
                    <div style={{ marginLeft:"auto", fontSize:17 }}>📋</div>
                  </div>
                  {citaStatus === "pending" ? (
                    <div style={{ display:"flex", gap:7 }}>
                      {btn(() => setModal("confirm-accept"), "✓ Confirmar", { flex:1, padding:"7px 0", borderRadius:9, background:C.green, color:"white", fontWeight:800, fontSize:11 })}
                      {btn(() => setModal("confirm-cancel"), "✕ Cancelar", { flex:1, padding:"7px 0", borderRadius:9, background:"#FFE5E5", color:C.red, fontWeight:800, fontSize:11 })}
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", fontSize:10, fontWeight:800, padding:6, borderRadius:8, background:citaStatus==="confirmed"?"#E6FAF0":"#FFE5E5", color:citaStatus==="confirmed"?C.sageDark:C.red }}>
                      {citaStatus==="confirmed"?"✅ Confirmada por ti":"❌ Cancelada · Dr. García fue notificado"}
                    </div>
                  )}
                </div>
                <div style={{ background:"white", borderRadius:14, padding:"12px 14px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <div style={{ width:4, height:34, borderRadius:2, background:C.sageDark }}/>
                    <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>Sesión con Dr. García</div><div style={{ fontSize:11, color:C.light }}>Lun 23 · 10:00 AM · Virtual</div></div>
                    <div style={{ marginLeft:"auto", fontSize:17 }}>💻</div>
                  </div>
                  <div style={{ textAlign:"center", fontSize:10, fontWeight:800, padding:6, borderRadius:8, background:"#E6FAF0", color:C.sageDark }}>✅ Confirmada</div>
                </div>
              </div>
              {mdl("confirm-accept", (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>✅</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Confirmar cita</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>¿Confirmas tu asistencia el <strong>sáb 15 de marzo a las 10:00 AM</strong>?</div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "No aún", { flex:1, padding:12, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setCitaStatus("confirmed"); setModal(null); showNotif("Cita confirmada", "Nos vemos el sáb 15 de marzo 🗓️", "✅"); }, "✓ Confirmar", { flex:1, padding:12, background:C.green, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {mdl("confirm-cancel", (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>❌</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Cancelar cita</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>¿Deseas cancelar la sesión del <strong>sáb 15 de marzo</strong>?</div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "Volver", { flex:1, padding:12, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setCitaStatus("cancelled"); setModal(null); showNotif("Cita cancelada", "Dr. García fue notificado", "❌"); }, "Sí, cancelar", { flex:1, padding:12, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
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
                <div style={{ fontSize:19, fontWeight:900, color:"white" }}>Sofía Martínez</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:700 }}>Nivel 4 · Exploradora</div>
              </div>
              <div style={{ padding:"0 14px 14px" }}>
                <div style={{ background:"white", margin:"-14px 0 14px", borderRadius:18, padding:16, boxShadow:"0 4px 18px rgba(0,0,0,0.1)", position:"relative", zIndex:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:12, fontWeight:800, color:C.text }}>✨ Nivel 4 — Exploradora</span>
                    <span style={{ fontSize:12, fontWeight:800, color:C.amberDark }}>620 / 1000 XP</span>
                  </div>
                  <div style={{ height:11, background:C.warm, borderRadius:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:"62%", background:`linear-gradient(90deg,${C.amber},${C.gold})`, borderRadius:5 }}/>
                  </div>
                  <div style={{ fontSize:10, color:C.light, marginTop:5 }}>380 XP para Nivel 5 · Guerrera 💪</div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>🏅 Mis logros</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[["🌱","Primer Paso","Primer autoregistro","+50 XP",false],["🔥","En Racha","5 días seguidos","+100 XP",false],["💬","Comunicativa","10 sesiones","+150 XP",false],["📚","Lectora","5 recursos leídos","+80 XP",false],["⚔️","Guerrera","Nivel 5","🔒",true],["🌟","Constancia","30 días","🔒",true]].map(([ic,name,desc,xp,locked]) => (
                    <div key={name} style={{ background:"white", borderRadius:16, padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", textAlign:"center", opacity:locked?.4:1, filter:locked?"grayscale(1)":"none" }}>
                      <div style={{ fontSize:30, marginBottom:7 }}>{ic}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:C.text }}>{name}</div>
                      <div style={{ fontSize:10, color:C.light, marginTop:2 }}>{desc}</div>
                      <div style={{ display:"inline-block", background:C.warm, color:C.amberDark, fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, marginTop:5 }}>{xp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERFIL */}
          {!notifPanel && screen === "perfil" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:"white", padding:22, textAlign:"center", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                <div onClick={() => setModal("avatar")} style={{ fontSize:60, marginBottom:4, cursor:"pointer" }}>{avatar}</div>
                <div style={{ fontSize:10, color:C.light, fontWeight:700, marginBottom:5 }}>Toca para cambiar</div>
                <div style={{ fontSize:21, fontWeight:900, color:C.text }}>Sofía Martínez</div>
                <div style={{ fontSize:12, color:C.light, fontWeight:600 }}>Miembro desde Enero 2026</div>
                <div style={{ display:"flex", justifyContent:"center", gap:7, marginTop:10, flexWrap:"wrap" }}>
                  {["✨ Nivel 4","🔥 Racha 5d","🏅 8 logros"].map(b => <span key={b} style={{ background:C.warm, borderRadius:9, padding:"5px 10px", fontSize:10, fontWeight:800, color:C.amberDark }}>{b}</span>)}
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
                  {[["Nombre","Sofía"],["Apellido","Martínez"],["Correo","sofia@correo.com"]].map(([l,v]) => (
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
              {bnav("perfil")}
            </div>
          )}

          {/* ADMIN HOME */}
          {!notifPanel && screen === "admin-home" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"18px 22px 22px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:34 }}>🛡️</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:19, fontWeight:900, color:"white" }}>Dashboard · NOOS</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>Dr. Danilo Rincón</div>
                </div>
                <div onClick={() => setNotifPanel(true)} style={{ position:"relative", cursor:"pointer" }}>
                  <div style={{ fontSize:24 }}>🔔</div>
                  {unread > 0 && <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"white", border:`2px solid ${C.plum}` }}>{unread}</div>}
                </div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:18 }}>
                  {[["68","Pacientes"],["5","Citas hoy"],["3","Sin actividad"]].map(([n,l]) => (
                    <div key={l} style={{ background:"white", borderRadius:14, padding:13, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize:21, fontWeight:900, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📅 Citas próximas</div>
                <div style={{ background:"white", borderRadius:14, padding:"12px 14px", marginBottom:9, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                    <div style={{ width:4, height:34, borderRadius:2, background:C.plum }}/>
                    <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>Sofía Martínez</div><div style={{ fontSize:11, color:C.light }}>Lun 23 · 10:00 AM · Virtual</div></div>
                    <div style={{ marginLeft:"auto", fontSize:17 }}>💻</div>
                  </div>
                  {adminCitaStatus === "pending" ? (
                    <div style={{ display:"flex", gap:7 }}>
                      {btn(() => { setAdminCitaStatus("confirmed"); showNotif("Cita confirmada", "Sofía fue notificada ✅", "✅"); }, "✓ Confirmar", { flex:1, padding:"7px 0", borderRadius:9, background:C.green, color:"white", fontWeight:800, fontSize:11 })}
                      {btn(() => setModal("admin-cancel"), "✕ Cancelar", { flex:1, padding:"7px 0", borderRadius:9, background:"#FFE5E5", color:C.red, fontWeight:800, fontSize:11 })}
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", fontSize:10, fontWeight:800, padding:6, borderRadius:8, background:adminCitaStatus==="confirmed"?"#E6FAF0":"#FFE5E5", color:adminCitaStatus==="confirmed"?C.sageDark:C.red }}>
                      {adminCitaStatus==="confirmed"?"✅ Confirmada · Sofía notificada":"❌ Cancelada · Sofía fue notificada"}
                    </div>
                  )}
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>👥 Pacientes</div>
                {[["🦋","Sofía Martínez","Autoregistro hace 2h · Nivel 4","Activa",false],["🦁","Carlos Ruiz","Tarea pendiente · Nivel 2","Activo",false],["🌸","Ana Torres","Sin actividad hace 3 días","⚠️ Inactiva",true]].map(([av,name,sub,status,alert]) => (
                  <div key={name} onClick={() => name==="Sofía Martínez" && showScreen("admin-paciente")} style={{ background:"white", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:7, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", cursor:"pointer" }}>
                    <div style={{ fontSize:26, width:42, height:42, background:C.warm, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center" }}>{av}</div>
                    <div><div style={{ fontSize:13, fontWeight:800, color:C.text }}>{name}</div><div style={{ fontSize:10, color:C.light }}>{sub}</div></div>
                    <div style={{ marginLeft:"auto", background:alert?"#FFE0E0":"#A8C5B5", color:alert?C.red:C.sageDark, fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>{status}</div>
                  </div>
                ))}
                <div style={{ fontSize:15, fontWeight:800, color:C.text, margin:"16px 0 10px" }}>⚡ Acciones rápidas</div>
                {[["📅","Agendar cita"],["📢","Notificación grupal"],["📊","Ver reportes"],["➕","Agregar paciente"]].map(([ic,lb]) => mitem(ic, lb, () => showNotif(lb, "Función disponible en la versión final", ic)))}
              </div>
              {mdl("admin-cancel", (
                <div>
                  <div style={{ fontSize:44, textAlign:"center", marginBottom:10 }}>⚠️</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Cancelar sesión</div>
                  <div style={{ fontSize:13, color:C.light, textAlign:"center", marginBottom:18, lineHeight:1.5 }}>¿Cancelar sesión con <strong>Sofía Martínez</strong> el lun 23?</div>
                  <div style={{ display:"flex", gap:9 }}>
                    {btn(() => setModal(null), "No cancelar", { flex:1, padding:12, background:C.warm, color:C.text, borderRadius:11, fontSize:12, fontWeight:800 })}
                    {btn(() => { setAdminCitaStatus("cancelled"); setModal(null); showNotif("Sesión cancelada", "Sofía fue notificada ❌", "❌"); }, "Sí, cancelar", { flex:1, padding:12, background:C.red, color:"white", borderRadius:11, fontSize:12, fontWeight:800 })}
                  </div>
                </div>
              ))}
              {anav("admin-home")}
            </div>
          )}

          {/* ADMIN PACIENTE */}
          {!notifPanel && screen === "admin-paciente" && (
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},${C.plum})`, padding:"16px 22px 20px", display:"flex", alignItems:"center", gap:14 }}>
                <div onClick={() => showScreen("admin-home")} style={{ fontSize:20, cursor:"pointer", color:"rgba(255,255,255,0.8)" }}>←</div>
                <div style={{ fontSize:32, width:50, height:50, background:"rgba(255,255,255,0.15)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>🦋</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:900, color:"white" }}>Sofía Martínez</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Nivel 4 · 14 autoregistros</div>
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
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📝 Autoregistros recientes</div>
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
                {mitem("📅", "Agendar cita", () => showNotif("Cita agendada", "Se agendó nueva cita con Sofía", "📅"))}
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
            <div style={{ height:"100%", overflowY:"auto", paddingBottom:80 }}>
              <div style={{ background:`linear-gradient(145deg,${C.dark},#3D3055)`, padding:"24px 22px 28px", textAlign:"center" }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
                  <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, border:"3px solid rgba(255,255,255,0.3)", margin:"0 auto" }}>👨‍⚕️</div>
                  <div onClick={() => setModal("edit-psico")} style={{ position:"absolute", bottom:0, right:0, width:24, height:24, background:C.amber, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, cursor:"pointer", border:"2px solid white" }}>✏️</div>
                </div>
                <div style={{ fontSize:20, fontWeight:900, color:"white", marginBottom:3 }}>Dr. Carlos García</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>Psicólogo Clínico</div>
                <div style={{ display:"inline-block", background:"rgba(255,255,255,0.15)", color:"white", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, marginTop:8 }}>🧠 TCC · Mindfulness</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:10, fontStyle:"italic", lineHeight:1.5 }}>"Cada pequeño paso que das cuenta. Estoy aquí para acompañarte."</div>
              </div>
              <div style={{ padding:14 }}>
                {btn(() => setModal("edit-psico"), "✏️ Editar mi perfil profesional", { width:"100%", padding:13, background:C.plum, color:"white", borderRadius:13, fontSize:13, fontWeight:800, marginBottom:16, display:"block" })}
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>ℹ️ Información profesional</div>
                <div style={{ background:"white", borderRadius:16, padding:16, marginBottom:16, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                  {[["🎓","Formación","Psicología Clínica · Uni. Nacional"],["⏳","Experiencia","12 años de práctica clínica"],["🔬","Enfoque","TCC · Mindfulness · Aceptación"],["📧","Contacto","dr.garcia@noos.app"]].map(([ic,lb,val]) => (
                    <div key={lb} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize:16, width:28, textAlign:"center" }}>{ic}</div>
                      <div><div style={{ fontSize:10, fontWeight:700, color:C.light, textTransform:"uppercase" }}>{lb}</div><div style={{ fontSize:13, fontWeight:700, color:C.text }}>{val}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>📊 Mi actividad</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:16 }}>
                  {[["68","Pacientes"],["847","Sesiones"],["4.9⭐","Rating"]].map(([n,l]) => (
                    <div key={l} style={{ background:"white", borderRadius:14, padding:13, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize:17, fontWeight:900, color:C.plum }}>{n}</div>
                      <div style={{ fontSize:9, color:C.light, fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:10 }}>⚙️ Configuración</div>
                {[["🔔","Notificaciones automáticas"],["📅","Horarios de disponibilidad"],["🏆","Sistema de logros"],["📊","Exportar datos"]].map(([ic,lb]) => mitem(ic, lb, () => showNotif(lb, "Función disponible en la versión final", ic)))}
                {mitem("🚪", "Cerrar sesión", () => showScreen("login"), true)}
              </div>
              {mdl("edit-psico", (
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.text, marginBottom:14, textAlign:"center" }}>Editar perfil</div>
                  {[["Nombre","Dr. Carlos García"],["Especialidad","Psicología Clínica · TCC"],["Experiencia","12 años"]].map(([l,v]) => (
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
