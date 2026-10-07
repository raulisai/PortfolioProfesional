# Portafolio — Raul Monroy · AI Product Engineer & AI Engineer

Plan de implementación. Objetivo: un sitio **súper rápido, súper simple, minimalista y dinámico**, hecho con Astro, donde los proyectos se agregan editando datos y no código.

**Enfoque:** todo gira alrededor de los **proyectos**: ahí se demuestran tus capacidades. El resto (experiencia, contacto) es breve y de apoyo.

---

## 1. Principios

- **Rápido:** HTML estático por defecto, casi cero JavaScript. Meta: Lighthouse ≥ 95 en todo.
- **Simple:** una sola página (`/`) con 4 secciones a pantalla completa.
- **Escalable por datos:** cada proyecto y cada experiencia es un archivo de contenido. Agregar un proyecto = agregar un archivo `.md` y una imagen.
- **Minimalista pero dinámico:** paleta reducida, mucha tipografía y espacio en blanco; el movimiento viene de transiciones suaves y scroll, no de adornos.

---

## 2. Stack tecnológico

| Área | Tecnología | Por qué |
|---|---|---|
| Framework | **Astro 5** | Genera HTML estático, cero JS por defecto, ideal para portafolios |
| Estilos | **Tailwind CSS 4** (vía `@tailwindcss/vite`) | Rápido de escribir, CSS final muy pequeño |
| Datos | **Astro Content Collections** + `zod` | Proyectos y experiencia tipados y validados |
| Imágenes | **`astro:assets`** (`<Image />`) | Convierte a WebP/AVIF, tamaños responsivos, lazy loading |
| Animaciones | **CSS puro** (`@keyframes`, `scroll-snap`, `IntersectionObserver` mínimo) | Sin librerías pesadas |
| Formulario de contacto | **Astro Actions** + **Resend** | Envía el mensaje directo a tu correo, sin exponer la dirección |
| Anti-spam | Campo honeypot + validación `zod` | Sin captchas molestos |
| Hosting | **Vercel** (adaptador `@astrojs/vercel`) | Gratis, deploy automático desde GitHub, soporta la función del formulario |
| Tipografía | 1 fuente variable autoalojada (p. ej. *Inter* o *Space Grotesk*) | Sin peticiones a terceros |

> Todo el sitio es estático excepto la acción del formulario, que corre como función serverless (`export const prerender = false` solo en esa ruta/acción).

---

## 3. Estructura del proyecto

```
PortfolioProfesional/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ actions/
│  │  └─ index.ts            # Acción "sendMessage" (Resend)
│  ├─ assets/
│  │  └─ projects/           # Imágenes de cada proyecto
│  ├─ components/
│  │  ├─ Navbar.astro        # Barra transparente: nombre + "Contáctame"
│  │  ├─ Intro.astro         # Animación de carga (nombre + títulos + zoom)
│  │  ├─ Projects.astro      # Sección de proyectos (lista + panel de detalle)
│  │  ├─ ProjectCard.astro
│  │  ├─ ProjectDetail.astro
│  │  ├─ Experience.astro
│  │  ├─ Contact.astro       # Texto + formulario
│  │  └─ Socials.astro
│  ├─ content/
│  │  ├─ projects/           # Un .md por proyecto
│  │  └─ experience/         # Un .md por experiencia
│  ├─ content.config.ts      # Esquemas de las colecciones
│  ├─ data/
│  │  └─ site.ts             # Nombre, título, redes sociales
│  ├─ layouts/
│  │  └─ Base.astro
│  ├─ pages/
│  │  └─ index.astro
│  └─ styles/
│     └─ global.css
├─ .env                      # RESEND_API_KEY, CONTACT_EMAIL (no se sube a git)
├─ astro.config.mjs
└─ package.json
```

---

## 4. Modelo de datos (escalable)

### 4.1 Proyectos — `src/content/projects/*.md`

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    cover: image(),                       // imagen del proyecto
    url: z.string().url(),                // a dónde lleva el clic
    repo: z.string().url().optional(),    // link al código si es libre
    problem: z.string(),                  // problema que resolvió
    stack: z.array(z.string()),           // tecnologías
    capabilities: z.array(z.string()).max(4), // qué demuestra de ti: "Agentes con LLMs", "RAG", "Producto end-to-end"...
    openSource: z.boolean().default(false),
    license: z.string().optional(),       // p. ej. "MIT"
    status: z.enum(['activo', 'terminado', 'en desarrollo']).default('terminado'),
    year: z.number(),
    order: z.number().default(0),         // para ordenar manualmente
    featured: z.boolean().default(true),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    start: z.string(),                    // "2024-03"
    end: z.string().optional(),           // vacío = actual
    summary: z.string().max(90),          // UNA línea concisa: qué hiciste / aprendiste
    order: z.number().default(0),
  }),
});

export const collections = { projects, experience };
```

Ejemplo de proyecto:

```md
---
title: "Asistente de Inventario con IA"
cover: "../../assets/projects/inventario.png"
url: "https://inventario.example.com"
repo: "https://github.com/raulisai/inventario-ai"
problem: "Las tiendas pequeñas perdían ventas por no saber qué reabastecer."
stack: ["Astro", "Python", "Claude API", "PostgreSQL"]
capabilities: ["Agentes con LLMs", "Producto end-to-end", "Integración de datos"]
openSource: true
license: "MIT"
status: "activo"
year: 2026
order: 1
---
Descripción opcional más larga (se puede mostrar en el panel de detalle).
```

### 4.2 Datos generales — `src/data/site.ts`

```ts
export const site = {
  name: 'Raul Monroy',
  navTagline: 'AI Maker',
  titles: ['AI Product Engineer', 'AI Engineer'],
  socials: [
    { label: 'GitHub',   href: 'https://github.com/...' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/...' },
    { label: 'X',        href: 'https://x.com/...' },
  ],
};
```

---

## 5. Diseño de la página

Una sola página. **Proyectos** ocupa `100dvh` completo; **Experiencia** y **Contacto** son más compactas. Scroll suave (`scroll-behavior: smooth`) para el enlace "Contáctame".

```
┌──────────────────────────────┐
│ 0. INTRO (overlay, ~7 s)     │  nombre → títulos → zoom → fade
├──────────────────────────────┤
│ NAVBAR fija y transparente   │  "Raul Monroy · AI Maker"   [Contáctame]
├──────────────────────────────┤
│ 1. PROYECTOS                 │  pantalla completa (lo principal)
├──────────────────────────────┤
│ 2. EXPERIENCIA               │  4 trabajos del CV, una pantalla
├──────────────────────────────┤
│ 2b. HABILIDADES              │  skills, estudios, idiomas, intereses
├──────────────────────────────┤
│ 3. CONTACTO + REDES          │  ← destino de "Contáctame"
└──────────────────────────────┘
```

### Estilo visual

- **Paleta (v2, "espacio oscuro"):** fondo `#05060a`, texto `#eef0f4`, gris `#8a8f9c`, acento lavanda `#a5adff` (títulos, línea de tiempo) y menta `#6ee7b7` (capacidades, progreso, botones).
- **Escena:** fondo espacial con planetas (`src/assets/scene/space.webp`) + montañas en primer plano (`mountains.webp`) como capas con parallax de mouse y scroll; estrellas fijas detrás de toda la página.
- **Proyectos:** captura dentro de un marco de dispositivo inclinado en 3D, contador 01/04, flechas, índice inferior con barra de progreso que hace autoplay (8 s, se pausa al pasar el mouse o fuera de vista). Swipe y flechas del teclado.
- **Tipografía:** títulos grandes (`clamp(2.5rem, 7vw, 6rem)`), cuerpo 16–18 px.
- **Movimiento:** transiciones de 300–600 ms con `ease-out`; elementos entran con fade + desplazamiento corto al hacer scroll. Todo se desactiva con `prefers-reduced-motion`.

---

## 6. Secciones en detalle

### 6.0 Intro — animación de carga (~7 s)

Overlay de pantalla completa, fondo oscuro, texto centrado. La animación tiene 5 tiempos:

| Tiempo | Qué pasa |
|---|---|
| **0.0 – 1.2 s** | Aparece **"Soy Raul Monroy"** (fade + sube 12 px). |
| **1.2 – 2.8 s** | Debajo se escribe progresivamente **"AI Product Engineer"** (efecto máquina de escribir, letra por letra, con cursor parpadeante). |
| **2.8 – 4.2 s** | Sigue escribiéndose **"& AI Engineer"** en el color de acento. |
| **4.2 – 5.4 s** | Pausa para leer. Aparece una línea pequeña: **"Sigue a Raul Monroy →"** (invitación a seguir viendo el portafolio). |
| **5.4 – 7.0 s** | **Zoom:** todo el bloque de texto crece (`scale 1 → 6`) mientras se desvanece; el overlay se vuelve transparente y revela los proyectos detrás. |

Reglas:
- **Clic, Esc o scroll** lo saltan en cualquier momento (va directo al fade final).
- Se muestra **una vez por sesión** (`sessionStorage`).
- Con `prefers-reduced-motion` no hay zoom ni escritura: el texto aparece completo 2 s y se desvanece.
- El contenido real ya está en el HTML debajo del overlay: buscadores y lectores de pantalla lo ven desde el inicio.

**Implementación:** CSS para fades y zoom + ~25 líneas de JS inline para la escritura progresiva y los tiempos.

```astro
<!-- Intro.astro -->
<div id="intro" class="fixed inset-0 z-50 grid place-items-center bg-bg" aria-hidden="true">
  <div class="intro-block text-center">
    <p class="intro-name text-5xl md:text-8xl font-semibold">Soy Raul Monroy</p>
    <p class="mt-4 text-2xl md:text-4xl text-muted">
      <span data-type="AI Product Engineer"></span>
      <span class="text-accent" data-type=" & AI Engineer"></span><span class="caret">|</span>
    </p>
    <p class="intro-follow mt-10 text-sm tracking-widest uppercase">Sigue a Raul Monroy →</p>
  </div>
</div>

<script is:inline>
  (() => {
    const el = document.getElementById('intro');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = null;
    try { seen = sessionStorage.getItem('intro'); sessionStorage.setItem('intro', '1'); } catch {}
    if (seen) return el.remove();

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const type = (node, start, speed = 70) =>
      [...node.dataset.type].forEach((c, i) => at(start + i * speed, () => (node.textContent += c)));

    const finish = () => {
      timers.forEach(clearTimeout);
      el.classList.add('intro-out');            // zoom + fade (CSS)
      setTimeout(() => el.remove(), 1600);
    };

    const [t1, t2] = el.querySelectorAll('[data-type]');
    if (reduce) { t1.textContent = t1.dataset.type; t2.textContent = t2.dataset.type; at(2000, finish); }
    else { type(t1, 1200); type(t2, 2800); at(5400, finish); }

    ['click', 'keydown', 'wheel', 'touchstart'].forEach((e) => addEventListener(e, finish, { once: true }));
  })();
</script>
```

```css
.intro-name   { opacity: 0; animation: rise .9s ease-out forwards; }
.intro-follow { opacity: 0; animation: rise .8s ease-out 4.2s forwards; }
.caret        { animation: blink 1s steps(1) infinite; }

#intro.intro-out             { background: transparent; opacity: 0; transition: opacity 1.6s ease-in, background .8s; pointer-events: none; }
#intro.intro-out .intro-block{ transform: scale(6); transition: transform 1.6s cubic-bezier(.7,0,.84,0); }

@keyframes rise  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes blink { 50% { opacity: 0; } }
```

### 6.0.1 Navbar — transparente y mínima

```
Raul Monroy · AI Maker                                    Contáctame
```

- `position: fixed`, arriba, **fondo transparente**, sin bordes ni sombras.
- **Izquierda:** "Raul Monroy" en peso semibold + "AI Maker" en gris. Clic → vuelve arriba.
- **Derecha:** solo un enlace **"Contáctame"** → `#contacto` (scroll suave a mensajes y redes). Subrayado animado en hover con el color de acento.
- Aparece con un fade cuando termina la intro.
- Para que se lea sobre las imágenes: `mix-blend-mode: difference` en el texto (o un degradado muy sutil de arriba hacia abajo). Sigue viéndose transparente.
- En mobile se mantiene igual: nombre a la izquierda, "Contáctame" a la derecha. No hay menú hamburguesa.

```astro
<!-- Navbar.astro -->
<header class="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference text-white">
  <a href="#top" class="font-semibold">Raul Monroy <span class="font-normal opacity-60">· AI Maker</span></a>
  <a href="#contacto" class="link-underline">Contáctame</a>
</header>
```

### 6.1 Proyectos — pantalla completa

**Layout (desktop):** dos columnas.

```
┌────────────────────────────────┬──────────────────────┐
│                                │  TÍTULO DEL PROYECTO │
│                                │  2026 · activo       │
│     IMAGEN GRANDE DEL          │                      │
│     PROYECTO (clic → link)     │  Problema            │
│                                │  Texto corto...      │
│                                │                      │
│                                │  Capacidades         │
│                                │  Agentes · RAG · ... │
│                                │                      │
│                                │  Tecnologías         │
│                                │  [Astro][Python]...  │
│                                │  Código libre ✓ MIT  │
│                                │  Ver sitio ↗ Repo ↗  │
├────────────────────────────────┴──────────────────────┤
│  01  02  03  04  05   ← miniaturas / índice           │
└───────────────────────────────────────────────────────┘
```

- **Izquierda (~65%):** imagen del proyecto activo, enlazada a `url` (`target="_blank" rel="noopener"`). Hover: zoom sutil (`scale(1.02)`).
- **Derecha (~35%):** panel de detalle bien organizado con etiquetas fijas:
  - **Problema** que resolvió
  - **Capacidades** que demuestra (lo que sabes hacer, destacado con el acento): aquí es donde el visitante entiende tu perfil
  - **Tecnologías** (chips)
  - **Código libre:** Sí/No + licencia + enlace al repo
  - **Estado** y **año**
- **Abajo:** índice numerado / miniaturas para cambiar de proyecto. También flechas ← → del teclado.
- El cambio de proyecto hace un crossfade de imagen y texto (≈400 ms).

**Mobile:** una columna. Carrusel horizontal con `scroll-snap-type: x mandatory`; cada tarjeta = imagen arriba, detalle abajo. Sin JS para el carrusel.

**Escalabilidad:** la sección lee `getCollection('projects')`, ordena por `order` y genera todo. 3 proyectos o 30, el diseño es el mismo (el índice inferior hace scroll horizontal si hay muchos).

**JS:** un script pequeño (vanilla, < 1 KB) que cambia el proyecto activo. Todos los proyectos se renderizan en el HTML; el script solo alterna clases `is-active`. Sin frameworks de UI.

### 6.2 Experiencia — muy corta

Objetivo: saber **dónde has trabajado sin hacer scroll**. Toda la sección cabe en una pantalla.

```
Experiencia

2024 — hoy   AI Product Engineer · Empresa X      Agentes de IA en producción para 10k usuarios
2022 — 2024  AI Engineer · Empresa Y              Pipelines de datos y modelos de NLP
2021 — 2022  Desarrollador · Empresa Z            Apps web full-stack con React y Node
```

- **Una fila por trabajo**: fechas · rol · empresa · **una sola frase** (máx. 90 caracteres, validado en el esquema).
- Sin viñetas, sin párrafos, sin logos.
- En desktop es una tabla de 3 columnas alineadas; en mobile cada fila se apila en 2 líneas.
- El trabajo actual lleva un punto con el color de acento.
- Las filas entran en cascada con un fade corto al llegar a la sección.
- Recomendado: máximo 4–5 entradas.

### 6.3 Contacto + redes — `<section id="contacto">`

**Texto:**
> **¿Quieres contratarme o necesitas asesoría para tu proyecto?**
> Escríbeme y te respondo pronto.

**Formulario** (campos mínimos):
- Nombre
- Correo
- Mensaje
- *(oculto)* honeypot `website` — si viene lleno, se descarta

Al enviar: botón pasa a "Enviando…", luego mensaje de éxito inline ("¡Mensaje enviado! Te contesto pronto.") o error claro. Sin recargar la página.

**Redes sociales:** fila de íconos/enlaces debajo del formulario, generada desde `site.socials`.

**Footer:** `© 2026 Raul Monroy` en una línea.

---

## 7. Formulario → tu correo (Astro Actions + Resend)

```ts
// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  sendMessage: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2).max(80),
      email: z.string().email(),
      message: z.string().min(10).max(2000),
      website: z.string().max(0).optional(), // honeypot
    }),
    handler: async ({ name, email, message }) => {
      const { error } = await resend.emails.send({
        from: 'Portafolio <contacto@tudominio.com>',
        to: import.meta.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `Nuevo mensaje de ${name}`,
        text: `${name} <${email}>\n\n${message}`,
      });
      if (error) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No se pudo enviar' });
      return { ok: true };
    },
  }),
};
```

**Variables de entorno** (`.env` local y en Vercel):

```
RESEND_API_KEY=re_xxx
CONTACT_EMAIL=tu-correo@ejemplo.com
```

- El correo destino nunca aparece en el HTML.
- `replyTo` = correo del visitante → respondes directo desde tu bandeja.
- Para enviar desde tu dominio hay que verificarlo en Resend; mientras tanto se puede usar `onboarding@resend.dev`.

> **Alternativa sin backend:** si prefieres sitio 100% estático, usar **Web3Forms** o **Formspree** (el formulario hace `POST` a su endpoint). Menos control, cero servidor.

---

## 8. Rendimiento y calidad

- Imágenes con `<Image />` (WebP/AVIF, `widths` responsivos); la primera imagen de proyectos con `loading="eager"` y `fetchpriority="high"`, el resto lazy.
- Fuente autoalojada con `font-display: swap` y `preload`.
- JS total en la página < 5 KB.
- SEO: `<title>`, `meta description`, Open Graph (imagen social), `sitemap` con `@astrojs/sitemap`.
- Accesibilidad: HTML semántico (`<section>`, `<nav>`, `<form>`), `alt` en imágenes, foco visible, contraste AA, `prefers-reduced-motion`.

---

## 9. Pasos de implementación

1. **Crear proyecto:** `npm create astro@latest` (plantilla mínima, TypeScript estricto).
2. **Integraciones:** `npx astro add tailwind vercel sitemap` y `npm i resend`.
3. **Layout base** (`Base.astro`): fuente, colores, `global.css`, meta tags, scroll suave.
4. **Colecciones de contenido:** `content.config.ts` + 2–3 proyectos y experiencias de ejemplo.
5. **Intro + Navbar:** animación de ~7 s (nombre → títulos escritos → "Sigue a Raul Monroy" → zoom y fade) y navbar transparente con "Contáctame".
6. **Proyectos:** layout de dos columnas, panel de detalle, índice, script de cambio, versión mobile.
7. **Experiencia:** tabla compacta de una línea por trabajo, cabe en una pantalla.
8. **Contacto:** formulario + acción con Resend + estados de envío + redes.
9. **Pulido:** responsive, reduced-motion, SEO, Lighthouse.
10. **Deploy:** repo en GitHub → conectar a Vercel → configurar variables de entorno → dominio.

---

## 10. Cómo agregar un proyecto nuevo (flujo diario)

1. Guardar la imagen en `src/assets/projects/mi-proyecto.png`.
2. Crear `src/content/projects/mi-proyecto.md` con el frontmatter de la sección 4.1.
3. `git push` → Vercel publica solo.

Si falta un campo o está mal escrito, el build falla con un mensaje claro (validación `zod`).

---

## Pendientes por definir

- [ ] Color de acento y fuente final
- [ ] Lista de proyectos con imágenes
- [ ] Experiencia: una frase por trabajo
- [ ] Links de redes sociales
- [ ] Correo destino y dominio (para Resend)
