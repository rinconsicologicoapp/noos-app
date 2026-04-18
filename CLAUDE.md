# Mi Psicólogo — World-Class Design System

> Referencias: Linear · Apple HIG · Stripe · Vercel · Calm · Headspace · Raycast · Craft

## Stack
- React 19 + Vite 8 PWA · Firebase (Auth, Firestore, FCM) · Inline CSS-in-JS
- Colores definidos inline en JSX · Touch-first, sin hover-only · Sin Tailwind, sin libs CSS externas

---

# I. FUNDAMENTOS DE DISEÑO ESPACIAL

El diseño de clase mundial no es plano — existe en el **eje Z**. Cada elemento tiene una posición en el espacio: qué está "encima", qué "flota", qué está "hundido".

## Capas (Z-space)

| Capa | Uso | Fondo | Blur |
|------|-----|-------|------|
| 0 – Base | Fondo de pantalla | `#07060F` radial-gradient | — |
| 1 – Surface | Cards, contenedores | `rgba(255,255,255,.028)` | `blur(20px)` |
| 2 – Raised | Modales, sheets | `rgba(255,255,255,.048)` | `blur(32px)` |
| 3 – Overlay | Toasts, tooltips | `rgba(18,14,32,.92)` | `blur(40px)` |
| 4 – Floating | Botones CTA hero | gradiente sólido | sombra dura |

Regla: nunca dos elementos del mismo nivel visualmente compitiendo. Siempre hay un ganador claro.

## Sombras que crean profundidad real (como Linear/Vercel)

```css
/* Objeto flotando — usa SIEMPRE dos capas de sombra */
box-shadow:
  0 1px 2px rgba(0,0,0,.40),      /* sombra de contacto */
  0 8px 32px rgba(0,0,0,.35),     /* sombra de altura */
  inset 0 1px 0 rgba(255,255,255,.08); /* borde luz superior */

/* Card elevada (modal, sheet) */
box-shadow:
  0 2px 4px rgba(0,0,0,.4),
  0 16px 48px rgba(0,0,0,.5),
  0 0 0 1px rgba(255,255,255,.06),
  inset 0 1px 0 rgba(255,255,255,.10);

/* Glow de acento — sutil, no excesivo */
box-shadow:
  0 0 0 1px rgba(255,123,90,.25),
  0 0 24px rgba(255,123,90,.12),
  0 8px 32px rgba(0,0,0,.4);
```

---

# II. TIPOGRAFÍA DE NIVEL MUNDIAL

La tipografía no es "poner texto" — es **arquitectura visual**.

## Sistema de escala óptica

```
Display:  48–72px / weight 900 / tracking -0.03em / leading 1.0
Hero:     36–48px / weight 800 / tracking -0.025em / leading 1.05
Title:    24–28px / weight 700 / tracking -0.02em / leading 1.1
Subtitle: 18–20px / weight 600 / tracking -0.015em / leading 1.25
Body:     15–16px / weight 400 / tracking -0.005em / leading 1.6
Secondary:13–14px / weight 400 / tracking  0em     / leading 1.55
Caption:  11–12px / weight 500 / tracking  0.04em  / leading 1.4
Label:    9–11px  / weight 700 / tracking  0.14em  / leading 1
```

## Reglas ópticas (lo que separa a Apple del resto)

- Headings grandes: `letter-spacing: -0.025em` — el kerning matemático se ve suelto a tamaños grandes
- Texto ALL CAPS: siempre `letter-spacing: 0.12–0.20em` — sin esto se ve apretado
- Nunca `font-weight: 500` suelto — usar 400 o 600, el 500 en muchas fuentes es invisible
- Line-height en botones: exactamente `1` — nunca dejar que el texto respire dentro del botón
- Gradiente en texto hero: `-webkit-background-clip: text` con `linear-gradient(135deg, #FF9B7A 0%, #FFD080 38%, #6EEDDF 100%)`
- Máximo 2 fuentes de peso contrastante por pantalla visible
- Contraste de tamaño entre niveles: mínimo 1.25× (idealmente 1.5×)

## Composición tipográfica (como Stripe/Vercel)

```
EYEBROW (9-10px, 700, caps, tracking .18em, opacidad .35)
    ↓
HEADLINE (36-48px, 900, tracking -.025em)
    ↓
SUBHEAD (15-16px, 400, opacidad .6, leading 1.7)
    ↓
CTA (15px, 700, tracking -.005em)
```

---

# III. PALETA AURORA CÁLIDA — Uso avanzado

## Valores base

```
coral-bright  #FF9B7A    — highlights, estados hover
coral         #FF7B5A    — acción principal, psicólogo
coral-deep    #D04428    — sombras de coral, estados pressed
teal-bright   #6EEDDF    — highlights de teal
teal          #4ECDC4    — acción secundaria, paciente
teal-deep     #1E8880    — sombras de teal, estados pressed
amber         #FFB347    — warnings, estrellas, calor
gold          #FFD080    — spark, punto de conexión
bg-void       #04030C    — negro profundo del fondo
bg-base       #07060F    — fondo de pantalla principal
bg-surface    #0D0B1E    — surface de primer nivel
bg-raised     #131028    — surface elevada
border-sub    rgba(255,255,255,.04)
border-base   rgba(255,255,255,.065)
border-strong rgba(255,255,255,.10)
border-accent rgba(255,123,90,.20)
```

## Gradientes oficiales

```css
/* Texto hero */
background: linear-gradient(135deg, #FF9B7A 0%, #FFD080 38%, #6EEDDF 100%);

/* Botón CTA coral */
background: linear-gradient(135deg, #FF8B6A 0%, #FF6040 100%);

/* Botón CTA teal */
background: linear-gradient(135deg, #6AEDE4 0%, #28B0A8 100%);

/* Fondo pantalla (siempre radial, nunca plano) */
background: radial-gradient(ellipse 80% 60% at 50% -10%, #1A0D28 0%, #07060F 60%);

/* Aura de calor (abrazos, momentos emocionales) */
background: radial-gradient(ellipse at 50% 50%, rgba(255,208,128,.18) 0%, rgba(255,123,90,.06) 40%, transparent 70%);

/* Glass card */
background: rgba(255,255,255,.028);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,.065);
```

## Color como emoción
- **Coral** → calidez, energía, acción, el terapeuta activo
- **Teal** → calma, confianza, escucha, el espacio seguro
- **Amber/Gold** → conexión, el momento del encuentro, logros
- **Fondo oscuro** → intimidad, seguridad, el espacio terapéutico privado
- Nunca mezclar coral y teal en el mismo texto — uno siempre domina

---

# IV. PWA TOUCH-FIRST — Estándar Apple HIG

## Targets táctiles
- Mínimo absoluto: **44×44px** (Apple HIG) — recomendado: **48×56px**
- Padding interno vs altura: si el texto es 15px, el botón mínimo es 48px de altura
- Entre targets: mínimo **8px** de separación para evitar toques accidentales
- `touch-action: manipulation` en TODOS los elementos interactivos — elimina el delay de 300ms

## Feedback táctil visual (como Things 3 / Craft)

```css
/* Botón primario */
.btn {
  transition: transform 120ms cubic-bezier(.22,1,.36,1),
              box-shadow 120ms ease,
              background 120ms ease;
}
.btn:active {
  transform: scale(.97);
  box-shadow: 0 1px 4px rgba(0,0,0,.4);  /* sombra colapsa = presionado */
}

/* Card / item de lista */
.card:active {
  transform: scale(.985);
  background: rgba(255,255,255,.04);     /* se ilumina al tocar */
}

/* Elemento destructivo */
.btn-danger:active {
  background: rgba(255,80,80,.2);
  transform: scale(.96);
}
```

## Gestos y scroll
- `scroll-behavior: smooth` siempre
- `-webkit-overflow-scrolling: touch` en listas largas
- Indicadores de scroll solo cuando hay contenido fuera de vista
- Overscroll: `overscroll-behavior: contain` en modales para no activar pull-to-refresh del browser

---

# V. MOTION DESIGN (como Linear / Framer)

La animación no es decoración — **comunica estado y relación**.

## Curvas de easing por tipo de movimiento

```css
/* Entradas (algo aparece) — empieza rápido, frena suave */
cubic-bezier(.22, 1, .36, 1)       /* spring-like, para cards/modales */
cubic-bezier(0, 0, .2, 1)          /* ease-out, para overlays */

/* Salidas (algo desaparece) — empieza suave, termina rápido */
cubic-bezier(.4, 0, 1, 1)          /* ease-in */

/* Micro-interacciones (botones, toggles) */
cubic-bezier(.34, 1.56, .64, 1)    /* slight overshoot = spring */

/* Transiciones de pantalla */
cubic-bezier(.22, 1, .36, 1)
```

## Duraciones estándar

```
50ms   — micro (ripple, dot pulse)
120ms  — feedback táctil (scale en :active)
200ms  — micro-interacción (toggle, checkbox)
280ms  — elemento UI (dropdown, tooltip)
380ms  — componente (modal, sheet, card)
500ms  — transición de pantalla
700ms  — animación hero/entrada principal
```

## Principios de motion (Apple / Linear)

1. **Nunca animar width/height** — solo `transform` y `opacity` (60fps garantizado)
2. **Entradas en cascada**: elementos del mismo grupo con `animation-delay` de 40–60ms entre sí
3. **Continuidad física**: si algo sale por la derecha, debe entrar por la derecha
4. **Reducir movimiento**: siempre proveer `@media (prefers-reduced-motion: reduce)` con `transition: none`
5. **Looping animations**: usar `animation-fill-mode: both` y asegurar que el loop sea invisible (inicio = final)

## Animaciones del sistema

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(.94); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes breathe {
  0%,100% { transform: scale(1); opacity: .85; }
  50%     { transform: scale(1.04); opacity: 1; }
}
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
@keyframes glow {
  0%,100% { filter: drop-shadow(0 0 4px rgba(255,179,71,.3)); }
  50%     { filter: drop-shadow(0 0 14px rgba(255,179,71,.65)); }
}
```

---

# VI. COMPONENTES DE CLASE MUNDIAL

## Botón primario (nivel Stripe)

```jsx
<button style={{
  height: 52,
  padding: '0 28px',
  background: 'linear-gradient(135deg, #FF8B6A 0%, #FF5A36 100%)',
  borderRadius: 14,
  border: 'none',
  color: '#fff',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 120ms cubic-bezier(.34,1.56,.64,1), box-shadow 120ms ease',
  boxShadow: '0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(255,90,54,.35), inset 0 1px 0 rgba(255,255,255,.2)',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
}}>
  Texto del botón
</button>
```

## Input de texto (nivel Linear)

```jsx
<input style={{
  height: 52,
  padding: '0 16px',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 12,
  color: '#F5EEE8',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 200ms ease, box-shadow 200ms ease, background 200ms ease',
  // :focus aplicado via JS con onFocus/onBlur:
  // border: '1px solid rgba(255,123,90,.5)'
  // box-shadow: '0 0 0 3px rgba(255,123,90,.12)'
  // background: 'rgba(255,255,255,.06)'
}}/>
```

## Card (nivel Vercel)

```jsx
<div style={{
  background: 'rgba(255,255,255,.028)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,.065)',
  borderRadius: 20,
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 280ms cubic-bezier(.22,1,.36,1), border-color 200ms ease, box-shadow 200ms ease',
  boxShadow: '0 1px 2px rgba(0,0,0,.3), 0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)',
  // :active:
  // transform: 'scale(.985)'
  // background: 'rgba(255,255,255,.04)'
}}/>
```

## Skeleton loader (nivel Gmail / Notion)

```jsx
<div style={{
  background: 'linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 8,
}}/>
```

## Toast / Notificación (nivel Linear)

```jsx
<div style={{
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(18,14,32,.92)',
  backdropFilter: 'blur(32px)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 14,
  padding: '12px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  boxShadow: '0 4px 24px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.06)',
  fontSize: 14,
  fontWeight: 500,
  color: '#F5EEE8',
  animation: 'fadeUp 280ms cubic-bezier(.22,1,.36,1) both',
  zIndex: 9999,
}}/>
```

---

# VII. LAYOUTS Y COMPOSICIÓN

## Espaciado — sistema de 4pt base (como Figma/Linear)

```
4px   — separación mínima (badges internos, gaps de íconos)
8px   — separación pequeña (entre labels y valores)
12px  — separación entre elementos relacionados
16px  — separación estándar (padding interno de cards)
20px  — separación media
24px  — padding lateral de pantalla móvil (MÍNIMO)
32px  — separación entre secciones pequeñas
40px  — separación entre secciones medianas
48px  — separación entre secciones grandes
64px  — separación entre bloques principales
```

## Grid de pantalla móvil
- Contenedor máximo: 100% con `max-width: 428px` (iPhone 14 Pro Max)
- Padding lateral: 24px (nunca menos)
- Safe area: `padding-bottom: env(safe-area-inset-bottom)` — SIEMPRE en elementos pegados al fondo
- Status bar: `padding-top: env(safe-area-inset-top)` en headers fijos

## Composición áurea
- El elemento más importante va en el **tercio superior** de la pantalla (no el centro geométrico)
- Espacio vacío intencional: si algo se ve "lleno", quitar un elemento antes de achicar espaciados
- Alineación invisible: los elementos deben tener un eje de alineación claro (left edge, center, etc.)

---

# VIII. ESTADOS Y MICROINTERACCIONES

Todo elemento interactivo tiene 5 estados. Diseñar los 5, no solo el default:

1. **Default** — estado de reposo
2. **Hover** (solo desktop) — ligero brightness o border change
3. **Active/Pressed** — scale(.96–.98) + sombra colapsa + background oscurece
4. **Focus** — anillo de foco visible `box-shadow: 0 0 0 3px rgba(255,123,90,.35)`
5. **Disabled** — `opacity: .35`, `cursor: not-allowed`, sin pointer events

## Loading states (nivel Superhuman)
- Skeleton antes que spinner — el esqueleto da contexto de lo que está cargando
- Si el spinner es inevitable: tamaño 20px, borde 2px, color coral, 600ms/loop
- Nunca bloquear UI completa — loading debe ser granular al elemento que carga
- Optimistic UI: mostrar el resultado antes de confirmar (revertir si falla)

## Error states
- Inline, no modal — el error va al lado del campo que lo causó
- Color `#FF6B6B`, ícono SVG de 14px a la izquierda del mensaje
- El campo en error: `border-color: rgba(255,107,107,.5)`, `box-shadow: 0 0 0 3px rgba(255,107,107,.12)`
- Nunca texto de error genérico — siempre específico y con solución sugerida

---

# IX. ACCESIBILIDAD DE CLASE MUNDIAL

No es opcional — es parte del diseño.

## Contraste
- Texto primario sobre bg-base: mínimo **7:1** (AAA)
- Texto secundario (.50 opacidad): mínimo **4.5:1** (AA)
- Texto en botones de color: verificar siempre — coral con blanco = ✓, amber con blanco = verificar
- Nunca texto funcional por debajo de .45 opacidad

## Semántica
- `role="button"` en divs que actúan como botones
- `aria-label` en íconos sin texto visible
- `aria-live="polite"` en zonas que actualizan dinámicamente (mensajes, notificaciones)
- `aria-disabled` en lugar de solo visual disabled

## Focus management
- Focus visible siempre — nunca `outline: none` sin reemplazo
- En modales: focus va al primer elemento interactivo al abrir, regresa al trigger al cerrar
- Tab order lógico: sigue el orden visual

---

# X. ICONOGRAFÍA SVG — Sistema de diseño

## Reglas de construcción

- Grid: siempre 24×24px viewBox para íconos UI · 120×120px o 200×200px para logos
- Stroke: `stroke-linecap: round; stroke-linejoin: round` — nunca square/miter
- Peso: 1.5px stroke para íconos de 24px · 2px para 20px · 1px para 16px
- Nunca mezclar fill y stroke en el mismo ícono excepto para énfasis deliberado

## Iluminación 3D en SVG (para logo del abrazo)

```svg
<!-- Esfera 3D (cabeza) -->
<radialGradient id="sphere" cx="35%" cy="28%" r="65%">
  <stop offset="0%"   stop-color="#FFCFB8"/>   <!-- highlight especular -->
  <stop offset="40%"  stop-color="#FF8060"/>   <!-- color base -->
  <stop offset="100%" stop-color="#C03018"/>   <!-- shadow -->
</radialGradient>

<!-- Cilindro 3D (cuerpo/brazo) — gradiente horizontal -->
<linearGradient id="cylinder" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0%"   stop-color="#9A2010"/>   <!-- shadow lateral -->
  <stop offset="30%"  stop-color="#FF7050"/>   <!-- color base -->
  <stop offset="60%"  stop-color="#FF9878"/>   <!-- highlight -->
  <stop offset="100%" stop-color="#9A2010"/>   <!-- shadow lateral -->
</linearGradient>

<!-- Highlight especular (ellipse en zona top-left) -->
<ellipse cx="... -5" cy="... -8" rx="5" ry="7" fill="white" opacity=".16"/>
```

## Filtros SVG para profundidad

```svg
<!-- Glow suave (no usar CSS filter en SVG animado) -->
<filter id="softGlow">
  <feGaussianBlur stdDeviation="2.5" result="b"/>
  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>

<!-- Glow de acento fuerte -->
<filter id="accentGlow">
  <feGaussianBlur stdDeviation="5" result="b"/>
  <feColorMatrix in="b" type="saturate" values="2" result="c"/>
  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```

---

# XI. DISEÑO EMOCIONAL (Calm / Headspace level)

Para una app de salud mental, el diseño debe **sentirse como un abrazo**.

## Principios emocionales
1. **Calma antes que eficiencia** — si hay que elegir entre una pantalla rápida y una que "respira", elegir la que respira
2. **Nunca urgencia visual** — sin rojos agresivos, sin badges de número grande, sin alertas estridentes
3. **Progreso visible pero no presionado** — mostrar avance sin crear ansiedad de completitud
4. **Vocabulario cálido** — los textos del UI deben sentirse como un psicólogo los escribiría: directo pero gentil
5. **Momentos de quietud** — animaciones lentas (3–5s) para elementos de fondo, que den sensación de ambiente y no de velocidad

## Patrones de delight (toques que distinguen apps de 5 estrellas)
- Transición de pantalla con fade suave (280ms) + leve scale desde .98 hasta 1
- Primer carga: animación de entrada escalonada de los elementos (cada uno 50ms después)
- Completar una sesión/tarea: pequeña animación de confetti o ícono que "celebra"
- Empty states: ilustración SVG + texto empático + CTA claro — nunca una pantalla vacía
- Scroll feedback: leve haptic-like bounce en los extremos del scroll

---

# XII. LO QUE NUNCA HAGO (anti-patterns)

```
✗ hover-only interactions en PWA
✗ colores planos en fondos — siempre gradiente o glass
✗ text-shadow decorativo — solo para legibilidad sobre imagen
✗ border-radius inconsistente dentro de la misma pantalla
✗ más de 2 fuentes en el mismo peso visible al mismo tiempo
✗ animaciones con width/height — siempre transform
✗ outline: none sin reemplazo accesible
✗ z-index arbitrarios — usar el sistema de capas definido arriba
✗ !important — señal de arquitectura CSS rota
✗ pantallas vacías sin estado de empty state
✗ errores genéricos ("Algo salió mal") sin especificidad
✗ botones de menos de 44px de altura
✗ loading que bloquea toda la UI
✗ texto en más de 3 niveles de opacidad en la misma pantalla
✗ gradientes de más de 3 colores sin un propósito claro
✗ scroll horizontal accidental (overflow-x: hidden en body)
✗ safe-area-inset ignorado en iPhone con notch
✗ fuentes externas (Google Fonts) — solo system fonts
```

---

# XIII. CHECKLIST ANTES DE ENTREGAR CUALQUIER UI

- [ ] ¿El fondo es un gradiente (nunca plano)?
- [ ] ¿Las cards tienen glassmorphism + doble capa de sombra?
- [ ] ¿Los botones tienen 48px+ de altura y responden en :active?
- [ ] ¿Los textos hero tienen gradiente y tracking negativo?
- [ ] ¿Las animaciones usan transform/opacity (no width/height)?
- [ ] ¿Hay un único elemento hero por pantalla?
- [ ] ¿El espaciado es múltiplo de 4pt?
- [ ] ¿Los estados de error, loading y empty están diseñados?
- [ ] ¿safe-area-inset está aplicado donde corresponde?
- [ ] ¿El contraste de texto es mínimo 4.5:1?

---

# XIV. ESTADO DEL PROYECTO

**Logo:** Pendiente selección entre 4 variaciones → `mockups/abrazo-premium.html`
**Login:** Migración pendiente a Aurora Cálida → `src/App.jsx:3207`
**Servidor mockups:** `npx serve -p 3030 mockups/`
