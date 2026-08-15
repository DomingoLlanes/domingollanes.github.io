---
title: "Qué es opencode y cómo empezar a usarlo"
description: "Qué es opencode, cómo funciona como agente de IA en el terminal, qué modelos soporta y cómo encajarlo en tu flujo de trabajo."
pubDate: 2026-08-17
categories: [Herramientas, Conceptos]
tags: [open source, agentes, LLM, ia-local, privacidad]
draft: true
toc: true
layout: PostLayout
translationKey: es
---

Si tu día a día es la terminal, las herramientas de IA para programar que ves por ahí se sienten como apps ajenas: pestañas, interfaces, segundo plano. ¿Y si la IA que programa contigo viviera **en tu consola**, compartiera tu shell y se enterara de lo mismo que tú? De eso va opencode.

En este post te explico qué es opencode, cómo funciona por dentro y cómo empezar a usarlo en tu flujo de trabajo. Sin venderlo como la panacea: lo que hace, lo que no hace y cuándo tiene sentido abrirlo.

## ¿Qué es opencode?

**opencode** es un agente de programación con IA que vive en el terminal. Es **open source** y está pensado para que un modelo de lenguaje lea tu código, lo entienda y lo modifique usando las mismas herramientas que tú ya usas a diario: la shell, el sistema de ficheros y, si quieres, integraciones externas.

Tres cosas lo distinguen de otras herramientas similares que ya conoces:

- **Es open source**. Puedes leer el código, auditarlo y, si te interesa, modificarlo. Importante si vas a darle acceso a tu código y a tus claves de API.
- **Es agnóstico de modelo**. Funciona con Claude, GPT, Gemini y más de 75 proveedores documentados (Anthropic, OpenAI, Google Vertex, AWS Bedrock, Groq, DeepSeek, GitHub Copilot, GitLab Duo, OpenRouter…), además de modelos locales en Ollama, LM Studio, llama.cpp o cualquier servidor compatible con la API de OpenAI. Hay modelos gratuitos incluidos y puedes entrar con tu cuenta de GitHub Copilot o de ChatGPT Plus/Pro sin necesidad de configurar claves.
- **Es agentico**. No se limita a autocompletar línea a línea: planifica, decide qué archivos leer, qué comandos lanzar y qué cambios aplicar. En modo `plan` te muestra el plan antes de tocar nada; en modo `build` aplica los cambios bajo el sistema de permisos que tengas configurado.

La idea central es sencilla: darte un par-programador con IA que se mueve por tu repo igual que tú. El terminal es la forma canónica (de ahí la TUI), pero opencode también tiene app de escritorio para macOS/Windows/Linux y extensión de IDE, además de `opencode serve` y `opencode web` para integraciones más allá del TUI. De aquí en adelante nos centramos en la consola.

## La analogía: el copiloto que comparte tu shell

Imagina que en tu terminal hay un copiloto que ve lo mismo que tú. Mientras tú escribes un comando, él está mirando: lee los mismos archivos, ejecuta los mismos `ls`, `grep` y `find` y propone cambios en los mismos ficheros que tú tocarías.

No es un chat al lado del editor. Es un **segundo usuario en tu máquina**, con sus propias manos (las herramientas), su propio criterio (el modelo) y un cuaderno donde apunta lo que va haciendo (la sesión). Tú decides qué le dejas tocar y qué no; él decide cómo resolver la tarea.

Esa es la sensación al usarlo: no estás "hablando con una IA", estás **trabajando con un par que vive en la consola**.

Como toda analogía, esta tiene sus límites. opencode no es una persona: no tiene memoria entre sesiones, no aprende de tus preferencias a largo plazo y se distrae cuando la tarea crece. La presencia del copiloto dura lo que dura tu sesión; cuando cierras el terminal, se va. Entender eso te evita dos trampas comunes: esperar que "recuerde" cosas de ayer o pedirle tareas que ya no caben en su contexto.

## ¿Cómo funciona por dentro?

opencode tiene cuatro piezas principales. Entenderlas te ayuda a configurarlo bien y a no frustrarte cuando algo no sale como esperabas.

### El modelo: el cerebro

El modelo de lenguaje es quien decide qué hacer en cada momento. opencode no entrena ni ajusta modelos: los **consume**. Tú le dices cuál usar (Claude, GPT, Gemini, un modelo local en Ollama, etc.) mediante una clave de API o un endpoint local, y opencode le envía tus instrucciones.

La consecuencia práctica es directa: **la calidad del resultado depende del modelo que elijas**. Cambiar de modelo en opencode es cambiar de "cerebro" sin tocar nada más. Los modelos grandes de frontera razonan mejor y planifican tareas largas con más acierto, pero cuestan más y dependen de un proveedor externo; los modelos locales (8B, 14B) son gratis y mantienen tus datos en tu máquina, pero se pierden antes en refactors de varios archivos.

Un matiz importante: el modelo razona con una **ventana de contexto** limitada, como el experto con pizarra que vimos en el [post sobre LLMs](que-es-un-llm). En sesiones largas —refactors de varias horas, tareas que tocan decenas de ficheros— la pizarra se llena y el modelo empieza a perder los primeros detalles. Por eso conviene ir confirmando checkpoints con el agente `plan` antes de seguir, en vez de lanzar una mega-tarea y esperar el resultado.

### Las herramientas: las manos

El modelo por sí solo no hace nada: solo genera texto. Para que pueda leer tu código, ejecutar comandos o aplicar cambios, opencode le da un conjunto de **herramientas**: leer y editar ficheros, buscar patrones en el código, listar directorios, correr comandos en la shell, hacer peticiones a una web, etc.

Cada vez que el modelo "quiere" hacer algo, en vez de decirlo, **llama a una herramienta**. opencode te muestra la llamada antes de ejecutarla (si requiere permisos), tú la apruebas o la rechazas y el resultado vuelve al modelo. Es un bucle: el modelo piensa, propone una acción, recibe el resultado, vuelve a pensar, hasta terminar la tarea o quedarse sin contexto.

Este bucle es lo que convierte un chatbot en un agente. Sin herramientas, el modelo solo responde texto; con herramientas, actúa sobre el mundo real.

Hay un detalle clave de seguridad: el sistema de **permisos** gobierna quién aprueba qué. Por defecto opencode **permite todas las operaciones sin pedir confirmación** (lee, edita ficheros y lanza comandos de shell por su cuenta); las restricciones se introducen declarándolas en `opencode.json`, donde cada categoría de herramienta (`bash`, `edit`, `read`, `webfetch`, `skill`…) acepta tres valores por clave: `allow`, `ask` o `deny`. Un ejemplo típico: dejar `bash` en `ask` y `read` en `allow`. Así ves cada comando antes de que corra sin renunciar a que el modelo lea todo lo que necesite.

### Las skills: instrucciones especializadas

Hay tareas recurrentes —auditar un post, generar un commit, revisar un cambio— que se benefician de instrucciones detalladas y repetibles. opencode resuelve esto con las **Agent Skills**: ficheros `SKILL.md` que viven en `.opencode/skills/<nombre>/SKILL.md` (con variantes en `~/.config/opencode/skills/` y compatibilidad con `.claude/skills/`) y que opencode descubre y expone al modelo a través de la herramienta nativa `skill`.

Cada `SKILL.md` lleva frontmatter obligatorio (`name` y `description`) y acepta permisos por nombre con tres valores —`allow`, `ask`, `deny`— y wildcards (puedes denegar todo lo que empiece por `experimental-`, por ejemplo). El agente ve las skills en la descripción de la herramienta y carga solo la que encaja con la tarea; tú no escribes el prompt cada vez.

Por ejemplo, una skill para "auditar el frontmatter de un post" puede decirle al modelo qué campos son obligatorios, qué categorías existen y cómo reportar los fallos. Tú no escribes el prompt cada vez; la skill lo trae y opencode la activa cuando corresponde.

### Los agentes: distintos modos de trabajar

opencode viene con agentes predefinidos y te deja crear los tuyos. Cada agente es una **personalidad con herramientas y permisos distintos**:

- **build**: el agente por defecto. Tiene acceso de lectura, escritura y shell y está pensado para tareas complejas: implementar features, refactorizar, aplicar cambios que tocan varios ficheros.
- **plan**: por defecto pide confirmación explícita antes de cualquier edición y de cualquier comando en shell (`ask` por defecto en `edit` y `bash`). Analiza el repo, propone un plan detallado y se detiene a esperar tu OK. Útil cuando quieres entender qué va a hacer antes de que lo haga.

Puedes añadir agentes propios: por ejemplo, un "revisor" que solo lea y comente, o un "documentador" que escriba docstrings sin tocar la lógica de negocio. Cada agente corre con su propio prompt y sus propios permisos, así que el mismo modelo se comporta de forma muy distinta según el agente activo.

### Los servidores MCP: enchufes externos

**MCP (Model Context Protocol)** es un estándar abierto para que un modelo use herramientas externas: bases de datos, navegadores, sistemas de tickets, diseños, lo que sea. opencode soporta MCP, así que puedes declarar servidores MCP en tu configuración y el modelo los usará como herramientas adicionales, igual que las nativas.

La consecuencia práctica: si tu equipo ya tiene un servidor MCP para su PostgreSQL, su Linear o su Figma, opencode lo enchufa sin que tengas que escribir integraciones a medida. Es el mismo concepto que ves en otros editores con IA, pero con un estándar abierto en vez de plugins propietarios.

## Un ejemplo concreto

Tareas típicas que opencode resuelve bien en el día a día de un proyecto:

- "Crea un post nuevo en `src/content/posts/es/` siguiendo el formato del blog, sobre el tema que te interese. Pasa la skill de validación al terminar."
- "Audita el último post que escribí: revisa el frontmatter, las categorías y los tags, y dime qué falla."
- "Genera el snippet de RSS para esa categoría y dime si falta algo."
- "Refactoriza el layout del header para que use las utilidades de Astro en vez de CSS a mano."
- "Explica este módulo en 200 palabras y dibuja un diagrama de cómo encaja con el resto."

En cada caso, el flujo es el mismo: tú escribes la tarea en lenguaje natural, opencode la descompone, hace las llamadas a herramientas que necesita (leer, buscar, editar, ejecutar) y te entrega el resultado —un fichero creado, un diff aplicado, un comando ejecutado—.

Un bucle real con permisos en modo conservador se ve así: el modelo decide que tiene que leer `package.json` antes de tocar nada; te muestra la llamada; la apruebas; lee el contenido y vuelve a pensar; decide que falta contexto del README y lo lee; propone un diff sobre dos ficheros; te lo enseña; tú lo apruebas; lo aplica; corre los tests del proyecto; te muestra la salida. Cada paso es una herramienta llamada por el modelo y validada por ti. El modelo no "adivina" qué hay en tu repo: lo pregunta con herramientas.

Lo importante: **tú mantienes el control**. Si opencode propone un cambio que no te gusta, lo rechazas; si vas a darle acceso a algo sensible (tu carpeta personal, tus claves SSH, tu config de producción), configuras permisos para que tenga que pedirte confirmación cada vez que los toque.

## Cómo se usa en la práctica

Instalación, configuración y primer uso en tres pasos.

### 1. Instalar opencode

La forma más rápida en macOS y Linux es el instalador oficial. Verifica primero la versión disponible en la documentación (opencode evoluciona rápido y los comandos pueden cambiar entre releases).

Tras instalarlo, autentica el modelo que vayas a usar. Si es un proveedor externo (Anthropic, OpenAI, Google), te pedirá la clave; si es un modelo local, le indicarás el endpoint (por ejemplo, el de Ollama en `http://localhost:11434/v1`).

### 2. Iniciar un proyecto

Dentro de la carpeta de tu proyecto, ejecuta `opencode` para arrancar el TUI. Al iniciar, opencode carga la configuración que encuentre (del proyecto o global) y, si quieres que entienda las convenciones de tu repo, lanza el slash command `/init`: analiza el proyecto y escribe un `AGENTS.md` en la raíz con el lenguaje, los comandos y la estructura detectados. Suele merecer la pena commitearlo al repo para sesiones futuras.

`opencode.json`, si quieres definir el modelo por defecto, los agentes y los servidores MCP del proyecto, es un fichero aparte que escribes a mano o heredas del global en `~/.config/opencode/opencode.json`.

### 3. Lanzar tareas

En modo interactivo escribes la tarea en lenguaje natural y opencode la ejecuta paso a paso. Para flujos automatizados, opencode ofrece `opencode serve` (servidor HTTP al que conectar clientes) y `opencode web` (UI en navegador), además de `opencode github` y `opencode gitlab` para integraciones de CI; los slash commands internos (`/init`, `/share`, `/undo`) cubren las acciones rápidas desde el TUI.

Si quieres ajustar el ruido de las confirmaciones, el sitio correcto es `opencode.json`. Por defecto opencode corre sin pedir permiso; tú afinas a partir de ahí.

### Configurar el comportamiento del proyecto

El fichero `opencode.json` del proyecto es donde ajustas el resto: el modelo por defecto, los agentes disponibles, las skills cargadas, los servidores MCP enchufados y, sobre todo, los **permisos**. Una configuración típica declara qué comandos son seguros de ejecutar sin confirmación (por ejemplo, `npm test`, `bun run build`, `pytest`) y qué rutas requieren tu visto bueno explícito (por ejemplo, `~/.ssh`, `/etc`, tu carpeta personal).

Si trabajas en equipo, este fichero se commitea al repositorio y cada persona puede afinar claves concretas en su `~/.config/opencode/opencode.json` sin tocar el compartido. La regla clave: las distintas capas no se machacan, se **combinan** (estilo `git config --local` + `--global`). El proyecto puede fijar defaults y el usuario sobreescribe solo lo que le interesa.

### Cuándo tiene sentido (y cuándo no)

Usa opencode cuando:

- Tu flujo principal es la terminal y no quieres cambiar de ventana para pedir ayuda a una IA.
- Quieres privacidad o evitar enviar código a servicios externos: con un modelo local, todo se queda en tu máquina.
- Estás aprendiendo un codebase nuevo y necesitas a alguien que lea y resuma por ti.
- Vas a darle tareas repetitivas bien definidas (auditar, formatear, generar boilerplate) y quieres automatizarlas.

Quizá no es para ti cuando:

- Prefieres una experiencia visual con chat lateral estilo Cursor, Copilot Chat o similar.
- Tus tareas son sobre todo autocompletar mientras escribes; para eso, una extensión de editor encaja mejor.
- Prefieres una experiencia IDE-first estilo Cursor o un IDE completo con IA nativa (opencode tiene su extensión, pero el grueso del flujo se vive en el TUI; aquí no llega).

## Lo que debes recordar

- **opencode es un agente de programación con IA para el terminal**, open source y agnóstico de modelo: usa Claude, GPT, Gemini o modelos locales en Ollama y compañía.
- **Funciona con un bucle de herramientas**: el modelo decide, llama a herramientas (leer, editar, shell, búsqueda), recibe el resultado y vuelve a decidir hasta cerrar la tarea.
- **Skills y MCP amplían lo que sabe hacer**: las skills aportan instrucciones especializadas; MCP enchufa herramientas externas (bases de datos, navegadores, etc.) con un estándar abierto.
- **Los agentes definen modos de trabajo**: `build` actúa, `plan` solo propone, y puedes crear agentes propios con permisos acotados.
- **Tú mantienes el control**: por defecto opencode ejecuta sin pedir permiso, pero los permisos se afinan por comando y por ruta (puedes dejarlo todo en `allow` para máxima autonomía o blindar lo sensible con `ask` o `deny`). Los modelos locales mantienen tus datos en tu máquina.
- **No es para todos los flujos**: si vives en la consola encaja sin fricción; si prefieres GUI o un IDE completo, hay herramientas más cómodas.

## Fuentes

- OpenCode (s.f.). *[Documentación oficial de OpenCode](https://opencode.ai/docs/)*. opencode.ai.
- Anomaly (s.f.). *[OpenCode en GitHub](https://github.com/anomalyco/opencode)*. GitHub.
- Model Context Protocol (2024). *[Especificación del MCP](https://modelcontextprotocol.io)*. modelcontextprotocol.io.

---

*Este contenido se generó con asistencia de IA.*
