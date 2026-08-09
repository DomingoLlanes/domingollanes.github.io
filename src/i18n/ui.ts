/**
 * UI dictionaries.
 * Add new locales by adding a key to `messages` and to `SITE.locales` in
 * src/config.ts. All keys must exist for every locale (TypeScript enforces it).
 */

import type { Locale } from '../config';

export const messages = {
  es: {
    'site.skipToContent': 'Ir al contenido',
    'nav.home': 'Inicio',
    'nav.posts': 'Entradas',
    'nav.tags': 'Etiquetas',
    'nav.categories': 'Categorías',
    'nav.archives': 'Archivos',
    'nav.about': 'Acerca de',
    'nav.search': 'Búsqueda',
    'nav.toggleMenu': 'Abrir menú',
    'nav.subscribe': 'Suscribirse',

    'theme.toggle': 'Cambiar tema',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',

    'lang.switcher': 'Idioma',
    'lang.en': 'English',
    'lang.fr': 'French',
    'lang.es': 'Español',

    'post.publishedOn': 'Publicado el',
    'post.updatedOn': 'Actualizado el',
    'post.readingTime': 'minutos de lectura',
    'post.toc': 'En este artículo',
    'post.tags': 'Etiquetas',
    'post.categories': 'Categorías',
    'post.previous': 'Anterior',
    'post.next': 'Siguiente',
    'post.related': 'Sigue leyendo',
    'post.comments': 'Comentarios',
    'post.commentsDisabled': 'Los comentarios están desactivados para esta entrada.',
    'post.commentsSetupTitle': 'Los comentarios necesitan configuración',
    'post.commentsSetupBody':
      'Giscus está activado pero aún no está configurado. Añade los datos del repositorio abajo para empezar a recoger comentarios.',
    'post.commentsSetupStep1':
      'Visita `giscus.app` y selecciona tu repositorio público de GitHub (las Discussions deben estar activadas).',
    'post.commentsSetupStep2':
      'Copia los valores generados `data-repo-id`, `data-category` y `data-category-id`.',
    'post.commentsSetupStep3':
      'Define las variables `PUBLIC_GISCUS_ENABLED`, `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY` y `PUBLIC_GISCUS_CATEGORY_ID` en tu `.env`.',
    'post.commentsSetupStep4':
      'Reconstruye el sitio: este aviso será sustituido por el hilo de comentarios.',
    'post.commentsSetupDocs': 'Abrir giscus.app',
    'post.share': 'Compartir',
    'post.copyLink': 'Copiar enlace',
    'post.copied': '¡Copiado!',
    'post.author': 'Autor',

    'list.allPosts': 'Todas las entradas',
    'list.empty': 'No se encontraron entradas.',
    'list.tagPosts': 'Entradas etiquetadas',
    'list.categoryPosts': 'Entradas en',
    'list.totalPosts': 'entradas',
    'list.totalPostsOne': 'entrada',

    'pagination.previous': 'Página anterior',
    'pagination.next': 'Página siguiente',
    'pagination.page': 'Página',
    'pagination.of': 'de',

    'archives.title': 'Archivos',
    'archives.empty': 'Todavía no hay entradas.',

    'tags.title': 'Etiquetas',
    'tags.empty': 'Todavía no hay etiquetas.',

    'categories.title': 'Categorías',
    'categories.empty': 'Todavía no hay categorías.',

    'search.title': 'Búsqueda',
    'search.placeholder': 'Buscar en el sitio',
    'search.openLabel': 'Abrir búsqueda',
    'search.closeLabel': 'Cerrar búsqueda',
    'search.empty': 'Sin resultados.',
    'search.loading': 'Cargando búsqueda…',
    'search.typeToStart': 'Escribe para buscar…',
    'search.hintShortcut': 'Pulsa / en cualquier lugar para buscar',
    'search.searching': 'Buscando…',
    'search.noResultsFor': 'Sin resultados para',
    'search.resultsCount': 'resultados',
    'search.resultsCountOne': 'resultado',
    'search.hintNavigate': 'para navegar',
    'search.hintSelect': 'para abrir',
    'search.clearLabel': 'Borrar',

    'code.copy': 'Copiar',
    'code.copied': 'Copiado',

    '404.title': 'Página no encontrada',
    '404.description': 'La página que buscas se ha ido volando.',
    '404.cta': 'Volver al inicio',

    'footer.poweredBy': 'Hecho con',
    'footer.theme': 'Tema',
    'footer.privacy': 'Política de privacidad',
    'footer.copyright': 'Todos los derechos reservados.',
    'footer.connect': 'Conectar',
    'footer.tagline': 'cc-by-nc · contenido original',

    'home.kicker': 'Blog de inteligencia artificial',
    'home.titleA': 'Noticias, pruebas y conceptos de IA,',
    'home.titleB': 'probados y explicados sin humo.',
    'home.subtitle':
      'Un blog estático sobre inteligencia artificial: probamos modelos, medimos suscripciones, explicamos conceptos y montamos IA local. Escrito para leerse, no para hacer scroll.',
    'home.featured': 'Nuevo',
    'home.read': 'Leer',
    'home.latest': 'Últimas publicaciones',
    'home.rss': 'RSS feed',
    'home.conceptsKicker': 'Aprende a tu ritmo',
    'home.conceptsTitle': 'Los conceptos, sin fórmulas',
    'home.conceptsSub':
      'Un concepto explicado desde cero: qué es, para qué sirve y un ejemplo que se entiende.',
    'home.newsletterKicker': 'Suscripción · mensual',
    'home.newsletterTitle': 'Un correo al mes, sin ruido.',
    'home.newsletterCopy':
      'Modelos que merecen la pena, guías útiles y los errores que cometimos para que no los cometas tú. Sin patrocinios, sin listas de 47 enlaces.',
    'home.newsletterPlaceholder': 'tu@correo.com',
    'home.newsletterNote': 'Un correo al mes · borrar cuenta con un clic',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof messages)['es'];
