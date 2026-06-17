# IA local, LLMs y aprendizaje

Blog sobre IA en local, LLMs y aprendizaje: herramientas, noticias, conceptos, aprendizaje, base de conocimiento personal y pruebas con IA.

Construido con [Astro 6](https://astro.build) y desplegado automáticamente en GitHub Pages.

> **Sitio:** [https://domingollanes.github.io](https://domingollanes.github.io)
> **Sitio:** [https://blog.domingollanes.me](https://blog.domingollanes.me)

## Intención

El blog se organiza en siete ejes, con tono práctico y didáctico:

- **IA en local** — uso de modelos pequeños (2B, 4B, 8B) sobre hardware modesto, sin GPUs de cuatro cifras ni suscripciones a APIs.
- **Herramientas** — análisis, reviews, descubrimientos y pruebas de herramientas de IA para el día a día.
- **Noticias** — novedades, nuevos modelos y descubrimientos del sector.
- **Conceptos** — explicaciones didácticas de fundamentos y técnicas avanzadas, a partir de research previo y de la puesta en conjunto de los descubrimientos.
- **Aprendizaje** — el blog está pensado para aprender, con tono didáctico, paso a paso, sin dar nada por sentado.
- **Base de conocimiento personal** — todo lo que voy descubriendo, analizando y probando queda guardado con su contexto para encontrarlo fácilmente y tenerlo a mano.
- **Pruebas con IA** — resultados y conclusiones de las pruebas con modelos locales, como extensión natural de la base de conocimiento.

## Stack

- **[Astro 6](https://astro.build)** — generador de sitios estáticos
- **[Tailwind CSS 4](https://tailwindcss.com)** + **[daisyUI 5](https://daisyui.com)** — estilos y tema claro/oscuro
- **[Pagefind](https://pagefind.app)** — búsqueda estática generada en build
- **[Giscus](https://giscus.app)** — comentarios basados en GitHub Discussions
- **[KaTeX](https://katex.org)** — fórmulas matemáticas pre-renderizadas
- **[MDX](https://mdxjs.com)** — posts con componentes embebidos
- **[Expressive Code](https://expressive-code.com)** — bloques de código con título, copia, diffs y resaltado
- **[Astro Icon](https://github.com/natemoo-re/astro-icon)** — iconografía Lucide / Simple Icons

## Quick start

Requisitos: [Bun](https://bun.sh) >= 1.1.

```bash
git clone https://github.com/domingollanes/domingollanes.github.io.git
cd domingollanes.github.io
bun install
bun dev
```

Abre [http://localhost:4321](http://localhost:4321).

## Estructura

```
src/
├── config.ts              # Configuración global del sitio
├── content/
│   ├── posts/             # Posts del blog
│   │   └── es/            # Idioma por defecto (único activo)
│   └── pages/             # Páginas estáticas (about, privacy…)
├── pages/                 # Rutas generadas
├── layouts/               # Layouts de página y post
├── components/            # Componentes reutilizables
├── styles/                # Estilos globales (Tailwind v4)
├── plugins/               # Plugins remark/rehype personalizados
├── icons/                 # Iconos SVG locales
├── assets/                # Imágenes procesadas por Astro
└── types/                 # Tipos TypeScript del sitio
public/                    # Archivos servidos tal cual (favicons, etc.)
```

## Escribir un post

Crea un archivo en `src/content/posts/es/`:

```markdown
---
title: 'Mi nuevo post'
description: 'Resumen corto que aparece en listados y en la meta-descripción.'
pubDate: 2026-06-16
tags: [ia-local, llm]
categories: [Aprendizaje]
---

Contenido en Markdown. En el post puedes usar:

- Bloques de código con resaltado (` ```python `, ` ```ts `, etc.)
- Fórmulas KaTeX inline (`$E = mc^2$`) o en bloque (`$$…$$`) — requiere `math: true` en el frontmatter
- Componentes MDX importados desde `src/components/`
- Imágenes desde `src/assets/` (procesadas por Astro) o URLs externas
- Alertas con sintaxis GFM: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`
- Tablas, listas de tareas, tachado y todo lo de GitHub Flavored Markdown
```

Frontmatter disponible (ver `src/content/config.ts` para la lista completa):

- `title`, `description`, `pubDate`
- `updatedDate`, `tags`, `categories`
- `heroImage` — imagen destacada opcional; si se omite y `SITE.autoOgImage` está activo, se genera una OG image automáticamente
- `draft` — `true` excluye el post del build
- `unlisted` — el post se publica pero no aparece en listados ni en el sitemap
- `math` — habilita KaTeX en el post (carga los estilos solo donde hace falta)
- `comments` — desactiva Giscus solo en este post

## Configuración

### Variables de entorno

Copia `.env.example` a `.env` y rellena los valores que necesites. Las variables `PUBLIC_*` se exponen al bundle del cliente.

| Variable | Propósito | Por defecto |
| -------- | --------- | ----------- |
| `SITE_URL` | URL canónica del sitio (afecta a SEO y RSS) | `https://domingollanes.github.io` |
| `BASE_PATH` | Subruta del sitio en GitHub Pages | `/` (sitio de usuario) |
| `PUBLIC_GITHUB_HANDLE` | Perfil de GitHub en el sidebar | — |
| `PUBLIC_GITHUB_REPO` | Nombre del repositorio | `domingollanes.github.io` |
| `PUBLIC_TWITTER_HANDLE` | Twitter/X en el sidebar | — |
| `PUBLIC_CONTACT_EMAIL` | Email en el sidebar | — |
| `PUBLIC_GISCUS_ENABLED` | Activa los comentarios (`true`/`false`) | `false` |
| `PUBLIC_GISCUS_REPO` | `owner/repo` para Giscus | — |
| `PUBLIC_GISCUS_REPO_ID` | ID de [giscus.app](https://giscus.app) | — |
| `PUBLIC_GISCUS_CATEGORY` | Categoría de Discussions | `Announcements` |
| `PUBLIC_GISCUS_CATEGORY_ID` | ID de la categoría | — |

> Si una variable `PUBLIC_*` está vacía, la entrada correspondiente desaparece automáticamente del sidebar y no se renderiza ningún enlace roto.

### `src/config.ts`

Toda la configuración del sitio (título, descripción, autor, navegación, redes, footer, Giscus, Pagefind) vive en `src/config.ts`. Valores habituales que se suelen tocar:

- **Título y descripción** → `SITE.title`, `SITE.description`
- **Autor y bio** → `SITE.author.name`, `SITE.author.bio`
- **Posts por página** → `SITE.postsPerPage`
- **Navegación** → array `NAV`
- **Redes** → se construyen automáticamente desde las variables `PUBLIC_*`; deja vacías las que no uses
- **Footer** → `SITE.footer` (texto, créditos del tema, política de privacidad)
- **OG images** → `SITE.autoOgImage` genera imágenes con Satori para posts sin `heroImage`

### Imágenes del sitio

| Archivo | Uso |
| ------- | --- |
| `src/assets/images/site/avatar.png` | Avatar del sidebar |
| `src/assets/images/site/og-default.svg` | Imagen Open Graph por defecto |
| `src/assets/images/site/favicon.png` | Favicon principal |
| `public/img/favicons/*` | Favicons adicionales que se sirven sin procesar |

## Build y despliegue

### Build local

```bash
bun run build      # genera dist/ + índice de Pagefind
bun preview        # sirve dist/ en localhost
bun run serve      # build + preview en un solo paso
```

### Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y publica el sitio en cada `push` a `main`.

1. En GitHub: **Settings → Pages → Source → GitHub Actions** (solo la primera vez).
2. Opcional, en **Settings → Environments → github-pages → Environment variables**:
   - `SITE_URL` → `https://domingollanes.github.io`
   - `PUBLIC_GITHUB_HANDLE` → `domingollanes`
   - `PUBLIC_GISCUS_*` si quieres activar los comentarios
3. Push a `main` (o lanza el workflow manualmente desde la pestaña **Actions**).

El sitio queda disponible en `https://domingollanes.github.io/`.

> Si GitHub Pages aún no estaba habilitado cuando se ejecutó el primer build, el workflow construye el artefacto pero omite el deploy. Tras activar Pages, vuelve a lanzarlo (un nuevo push o **Run workflow**).

## Comandos

| Comando | Acción |
| ------- | ------ |
| `bun dev` | Servidor de desarrollo en `localhost:4321` |
| `bun run build` | Build de producción a `./dist/` + índice Pagefind |
| `bun preview` | Sirve el build localmente |
| `bun run serve` | `build` + `preview` |
| `bun run typecheck` | `astro check` |
| `bun run lint` | ESLint (sin warnings) |
| `bun run lint:fix` | ESLint con autofix |
| `bun run format` | Prettier write |
| `bun run format:check` | Prettier check (CI) |

## Características

- **Búsqueda estática** con Pagefind — el índice se genera en build, sin backend.
- **Comentarios** vía Giscus (GitHub Discussions) — opt-in global y por post.
- **Matemáticas** con KaTeX pre-renderizado; los estilos solo se cargan en posts con `math: true`.
- **Modo claro/oscuro** con toggle persistente en el sidebar (daisyUI themes).
- **Open Graph** automático para posts sin `heroImage`, vía Satori.
- **RSS** en `/rss.xml` y **sitemap** con `hreflang` para SEO.
- **Bloques de código** enriquecidos: títulos, botón de copia, diff, marcadores de línea, secciones colapsables.
- **i18n** preparado en el theme, pero con un único idioma activo (`es`); el switcher está deshabilitado.
- **Posts sin listar**: `unlisted: true` los mantiene accesibles por URL pero los excluye de listados y del sitemap.

## Licencia

MIT — ver [LICENSE](./LICENSE).
