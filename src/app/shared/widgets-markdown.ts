// src/app/shared/widgets-markdown.ts

import { type MarkdownIt as Parser } from 'markdown-it';
import contenedor from 'markdown-it-container';

/**
 * Widgets con la sintaxis ::: (estilos en components/pages/contenido/widgets.css). Lo de dentro es Markdown normal:
 *   ::: stepper bordered success
 *   1. **Paso uno**
 *      Texto del paso.
 *   :::
 * La primera palabra es el widget y el resto, sus modificadores (clases widget-<modificador>). Se convierte en:
 *   <div data-widget="stepper" class="widget-bordered widget-success"> … </div>
 *
 * Casi todos los widgets son solo CSS. Los que necesitan algo más tienen aquí su función:
 * - details: usa <details> y su título es el <summary> que se pulsa.
 * - checklist: convierte los [ ] / [x] de la lista en casillas.
 * - tabs: cada línea solo en negrita abre una pestaña.
 * - youtube: convierte el enlace en el vídeo incrustado.
 *
 * Uso: mdParser.use(widgets)
 */
export function widgets(md: Parser): void {
  const abiertos: string[] = []; // Widgets abiertos, para saber cómo cerrar cada uno

  md.use(contenedor, 'widget', {
    validate: (parametros: string) => /^[a-z][\w-]*(\s+[\w-]+)*\s*$/i.test(parametros.trim()),
    render: (tokens: any[], indice: number) => {
      // Cierre del widget
      if (tokens[indice].nesting !== 1) {
        const nombre = abiertos.pop();
        if (nombre === 'details') return '</details>\n';
        if (nombre === 'checklist') return BOTONES_CHECKLIST + '</div>\n';
        if (nombre === 'tabs') return '</div>\n</div>\n'; // cierra la última pestaña y el widget
        if (nombre === 'youtube') return '</figure>\n';
        return '</div>\n';
      }

      // Apertura del widget
      const [nombre, ...modificadores]: string[] = tokens[indice].info.trim().split(/\s+/);
      abiertos.push(nombre);
      const escapar = md.utils.escapeHtml;
      const clases = modificadores.map(modificador => `widget-${modificador}`).join(' ');
      const atributos = `data-widget="${escapar(nombre)}"${clases ? ` class="${escapar(clases)}"` : ''}`;
      const conTitulo = marcarTitulo(tokens, indice);

      if (nombre === 'details') return abrirDetails(tokens, indice, atributos, conTitulo);
      if (nombre === 'checklist') marcarTareas(tokens, indice);
      if (nombre === 'tabs') {
        const barra = prepararPestanas(md, tokens, indice);
        if (barra) return `<div ${atributos}>\n${barra}`;
        abiertos[abiertos.length - 1] = 'tabs-vacio'; // sin pestañas: se cierra como un <div> normal
      }
      if (nombre === 'youtube') {
        const video = prepararYoutube(md, tokens, indice);
        if (video) return `<figure ${atributos}>\n${video}`;
        abiertos[abiertos.length - 1] = 'youtube-vacio'; // sin enlace válido: se ve lo que haya dentro
      }
      return `<div ${atributos}>\n`;
    }
  });
}

/**
 * Título del widget (común a todos): si lo primero es un párrafo con solo una negrita (**Título**), se marca con la
 * clase "widget-titulo" (cada widget le da su estilo). Así no hace falta un ### que saldría en el índice.
 * Devuelve si el widget tiene título.
 */
function marcarTitulo(tokens: any[], indice: number): boolean {
  const parrafo = tokens[indice + 1], contenido = tokens[indice + 2];
  if (parrafo?.type !== 'paragraph_open' || contenido?.type !== 'inline') return false;

  const partes = (contenido.children ?? []).filter((t: any) => !(t.type === 'text' && t.content.trim() === ''));
  if (partes.length !== 3 || partes[0].type !== 'strong_open' || partes[2].type !== 'strong_close') return false;

  parrafo.attrJoin('class', 'widget-titulo');
  return true;
}

/**
 * Widget "details" (desplegable): el título pasa a ser el <summary> (lo que se ve cerrado y se pulsa) y el resto,
 * el contenido. Sin título, pone "Más información".
 */
function abrirDetails(tokens: any[], indice: number, atributos: string, conTitulo: boolean): string {
  if (!conTitulo) return `<details ${atributos}>\n<summary>Más información</summary>\n`;

  tokens[indice + 1].tag = 'summary'; // apertura del párrafo del título
  tokens[indice + 3].tag = 'summary'; // cierre del párrafo del título
  return `<details ${atributos}>\n`;
}

/** Botones "Marcar todo", "Desmarcar todo" y "Restablecer" al final de cada checklist (los maneja contenido.ts > alternarTarea) */
const BOTONES_CHECKLIST =
  '<div class="widget-acciones">' +
  '<button type="button" data-accion="marcar-todo"><i class="pi pi-check-square"></i> Marcar todo</button>' +
  '<button type="button" data-accion="desmarcar-todo"><i class="pi pi-stop"></i> Desmarcar todo</button>' +
  '<button type="button" data-accion="restablecer"><i class="pi pi-undo"></i> Restablecer</button>' +
  '</div>\n';

/**
 * Widget "checklist" (lista de tareas): en los elementos de lista que empiezan por [ ] o [x], quita esa marca y le
 * pone al <li> la clase "widget-tarea" (y "widget-tarea-hecha" si está marcada). Las casillas las pinta widgets.css;
 * al pulsarlas se marcan o desmarcan (contenido.ts > alternarTarea).
 */
function marcarTareas(tokens: any[], inicio: number): void {
  let profundidad = 0; // para no salirse del widget (puede haber otros widgets dentro)
  for (let i = inicio + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'container_widget_open') profundidad++;
    if (token.type === 'container_widget_close' && profundidad-- === 0) return;

    // Elemento de lista: list_item_open → paragraph_open → inline (el texto)
    if (token.type !== 'inline' || tokens[i - 1]?.type !== 'paragraph_open' || tokens[i - 2]?.type !== 'list_item_open') continue;
    const texto = token.children?.[0];
    const marca = texto?.type === 'text' ? /^\[([ xX])\]\s+/.exec(texto.content) : null;
    if (!marca) continue;

    texto.content = texto.content.slice(marca[0].length);
    tokens[i - 2].attrJoin('class', marca[1] === ' ' ? 'widget-tarea' : 'widget-tarea widget-tarea-hecha');
    if (marca[1] !== ' ') tokens[i - 2].attrSet('data-hecha', ''); // marcada en el .md (para "Restablecer")

    // El texto de la tarea, en un <span> propio (para tacharlo sin tachar las tareas de dentro)
    for (const parrafo of [tokens[i - 1], tokens[i + 1]]) {
      parrafo.tag = 'span';
      parrafo.hidden = false;
    }
    tokens[i - 1].attrJoin('class', 'widget-tarea-texto');
  }
}

/**
 * Widget "tabs" (pestañas): cada párrafo solo en negrita (al primer nivel del widget) abre una pestaña, y lo que
 * va debajo, hasta la siguiente, es su contenido. Si el título empieza por "pi-algo", es su icono de PrimeIcons:
 *   **pi-windows Windows**
 * Cambia esos párrafos por los paneles (<div class="widget-pestana-panel">; solo el primero visible) y devuelve la
 * barra de pestañas (botones). Sin pestañas, devuelve "". Al pulsarlas: contenido.ts > cambiarPestana.
 */
function prepararPestanas(md: Parser, tokens: any[], inicio: number): string {
  const nivel = tokens[inicio].level + 1; // el primer nivel dentro del widget (no dentro de listas, citas…)
  const botones: string[] = [];

  for (let i = inicio + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'container_widget_close' && token.level === nivel - 1) break; // fin del widget

    // Título de pestaña: párrafo de primer nivel con solo una negrita
    const contenido = tokens[i + 1];
    if (token.type !== 'paragraph_open' || token.level !== nivel || contenido?.type !== 'inline') continue;
    const titulo = /^\*\*(.+)\*\*$/.exec(contenido.content.trim());
    if (!titulo || titulo[1].includes('**')) continue;

    // Icono (pi-algo) y texto del título
    const icono = /^(pi-[\w-]+)\s+/.exec(titulo[1]);
    const texto = md.renderInline(icono ? titulo[1].slice(icono[0].length) : titulo[1]);
    const n = botones.length;
    botones.push(`<button type="button" role="tab" class="widget-pestana" aria-selected="${n === 0}">` +
      (icono ? `<i class="pi ${icono[1]}"></i>` : '') + `<span>${texto}</span></button>`);

    // El párrafo del título se cambia por el cierre del panel anterior y la apertura del suyo
    token.type = 'html_block';
    token.content = (n === 0 ? '' : '</div>\n') +
      `<div class="widget-pestana-panel" role="tabpanel"${n === 0 ? '' : ' hidden'}>\n`;
    contenido.type = 'html_block';
    contenido.content = '';
    tokens[i + 2].type = 'html_block'; // cierre del párrafo
    tokens[i + 2].content = '';
    i += 2;
  }

  return botones.length ? `<div class="widget-pestanas" role="tablist">${botones.join('')}</div>\n` : '';
}

/**
 * Widget "youtube": busca dentro el enlace del vídeo (cualquier forma: watch?v=, youtu.be/, shorts/, embed/, live/;
 * con t= o start=, empieza ahí) y una línea solo en negrita (opcional): si va antes del enlace, sale como cabecera
 * del vídeo; si va después, como pie. Oculta lo de dentro y
 * devuelve el vídeo incrustado: sin cookies hasta reproducir (youtube-nocookie), relacionados solo del mismo canal
 * (rel=0; YouTube no permite quitarlos del todo) y carga diferida. Sin enlace válido, devuelve "".
 */
function prepararYoutube(md: Parser, tokens: any[], inicio: number): string {
  const nivel = tokens[inicio].level;
  let fin = inicio + 1;
  while (fin < tokens.length && !(tokens[fin].type === 'container_widget_close' && tokens[fin].level === nivel)) fin++;
  const interior = tokens.slice(inicio + 1, fin);

  // El enlace (el primero que haya) y el texto (la primera línea solo en negrita), y en qué orden van
  const textos = interior.filter(t => t.type === 'inline').map(t => t.content.trim());
  const enlaces = textos.map(t => /https?:\/\/[^\s)>\]]+/.exec(t)?.[0]);
  const negritas = textos.map(t => /^\*\*(.+)\*\*$/.exec(t)?.[1]);
  const posEnlace = enlaces.findIndex(Boolean), posTexto = negritas.findIndex(Boolean);
  const video = posEnlace >= 0 ? datosYoutube(enlaces[posEnlace]!) : null;
  if (!video) return '';
  const pie = negritas[posTexto];
  const arriba = posTexto >= 0 && posTexto < posEnlace;

  // Lo de dentro no se pinta (ya está en el vídeo)
  for (const token of interior) {
    token.type = 'html_block';
    token.content = '';
  }

  const parametros = `rel=0${video.inicio ? `&start=${video.inicio}` : ''}`;
  const titulo = md.utils.escapeHtml(pie ? pie.replace(/[*_`]/g, '') : 'Vídeo de YouTube');
  const iframe = `<div class="widget-video"><iframe src="https://www.youtube-nocookie.com/embed/${video.id}?${parametros}" ` +
    `title="${titulo}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe></div>\n`;
  const franja = pie ? `<figcaption><i class="pi pi-youtube"></i><span>${md.renderInline(pie)}</span></figcaption>\n` : '';
  return arriba ? franja + iframe : iframe + franja;
}

/** Saca de un enlace de YouTube el id del vídeo y el segundo de inicio (t=90, t=1m30s, start=90…) */
function datosYoutube(enlace: string): { id: string, inicio: number } | null {
  let url: URL;
  try { url = new URL(enlace); } catch { return null; }
  const host = url.hostname.replace(/^(www|m)\./, '');

  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') ?? /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1] ?? null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null;

  // Inicio: "90", "90s", "1m30s", "1h2m3s"
  const t = url.searchParams.get('t') ?? url.searchParams.get('start') ?? '';
  const partes = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t);
  const inicio = partes ? (+(partes[1] ?? 0)) * 3600 + (+(partes[2] ?? 0)) * 60 + (+(partes[3] ?? 0)) : 0;
  return { id, inicio };
}

