// Elige el curso activo creando el enlace "contenido" que apunta a su carpeta.
//
// Uso:
//   npm run curso                       -> menú para elegir curso (cursores + Intro)
//   npm run curso sqlite                -> usa el curso cursos/sqlite (por nombre de carpeta)
//   npm run curso ../cursos/sqlite      -> usa el curso que está en esa ruta
//   npm run curso demo                  -> vuelve al curso demo (contenido-demo)
//   npm run curso desenchufar           -> igual que "demo"
//   npm run curso ayuda                 -> muestra esta ayuda
//
// Los cursos salen de dos sitios: las carpetas de cursos/ y el archivo listado-cursos.mjs.
// Si un curso del listado no está descargado, se ofrece clonarlo con git.
//
// El enlace es una "junction" en Windows (no necesita permisos de administrador).
// Nunca se borra el contenido de ningún curso: solo se quita y se vuelve a crear el enlace.

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ─── Rutas (si cambia la estructura de carpetas, se ajusta aquí) ─────────────
const carpetaScripts = path.dirname(fileURLToPath(import.meta.url));
const raizApp = path.resolve(carpetaScripts, '..');
const enlace = path.join(raizApp, 'contenido');
const carpetaDemo = path.join(raizApp, 'contenido-demo');
const carpetaCursos = path.resolve(raizApp, '..', 'cursos');
const archivoListado = path.join(carpetaScripts, 'listado-cursos.mjs');

const archivosObligatorios = ['json/config.json', 'json/temario.json'];
const palabrasDemo = ['demo', 'desenchufar'];
const palabrasAyuda = ['ayuda', 'help'];

// ─── Colores de la terminal (se desactivan si no es una terminal real) ──────
const conColor = process.stdout.isTTY && !process.env.NO_COLOR;
const color = (codigo) => (texto) => conColor ? `\x1b[${codigo}m${texto}\x1b[0m` : texto;
const naranja = color('38;5;208');
const cian = color('36');
const verde = color('32');
const amarillo = color('33');
const rojo = color('31');
const gris = color('90');
const negrita = color('1');

// ─── Banner ──────────────────────────────────────────────────────────────────
const letras = [
  [" _____ ", "|_   _|", "  | |  ", "  | |  ", "  |_|  "],           // T
  ["      ", "  ___ ", " / _ \\", "|  __/", " \\___|"],               // e
  ["           ", " _ __ ___  ", "| '_ ` _ \\ ", "| | | | | |", "|_| |_| |_|"], // m
  ["       ", "  __ _ ", " / _` |", "| (_| |", " \\__,_|"],          // a
  ["      ", " _ __ ", "| '__|", "| |   ", "|_|   "],               // r
  ["    ", "    ", "    ", " _  ", "(_) "],                         // .
  [" _ ", "(_)", "| |", "| |", "|_|"],                              // i
  ["       ", "  ___  ", " / _ \\ ", "| (_) |", " \\___/ "],         // o
];

function mostrarBanner() {
  console.log();
  for (let fila = 0; fila < 5; fila++) {
    console.log('  ' + naranja(letras.map(letra => letra[fila]).join('')));
  }
  console.log(gris('  Selector de cursos\n'));
}

function mostrarAyuda() {
  console.log(`${negrita('Uso:')}
  npm run curso                    ${gris('menú para elegir curso (cursores + Intro)')}
  npm run curso ${cian('<carpeta>')}          ${gris('enchufa cursos/<carpeta> (si está en el listado y no se ha descargado, ofrece clonarlo)')}
  npm run curso ${cian('<ruta>')}             ${gris('enchufa el curso de esa ruta (p. ej. ../cursos/sqlite)')}
  npm run curso demo               ${gris('vuelve al curso demo (también: desenchufar)')}
  npm run curso ayuda              ${gris('muestra esta ayuda')}

  ${gris('Listado de cursos para clonar: scripts/listado-cursos.mjs')}
`);
}

// ─── Utilidades ──────────────────────────────────────────────────────────────
function esCursoValido(carpeta) {
  return archivosObligatorios.every(archivo => fs.existsSync(path.join(carpeta, archivo)));
}

function leerNombreCurso(carpeta) {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(carpeta, 'json/config.json'), 'utf8'));
    return config.nombreCurso || null;
  } catch {
    return null;
  }
}

// Ruta real normalizada, para comparar carpetas (en Windows sin distinguir mayúsculas)
function rutaReal(ruta) {
  try {
    const real = fs.realpathSync(ruta);
    return process.platform === 'win32' ? real.toLowerCase() : real;
  } catch {
    return null;
  }
}

// Lee scripts/listado-cursos.mjs. Si no existe, devuelve una lista vacía.
async function leerListado() {
  if (!fs.existsSync(archivoListado)) return [];
  try {
    const modulo = await import(pathToFileURL(archivoListado).href);
    const listado = Array.isArray(modulo.default) ? modulo.default : [];
    return listado.filter(entrada => {
      const valida = typeof entrada?.carpeta === 'string' && typeof entrada?.repo === 'string';
      if (!valida) console.warn(amarillo(`⚠️  Entrada ignorada en listado-cursos.mjs (necesita "carpeta" y "repo"): ${JSON.stringify(entrada)}`));
      return valida;
    });
  } catch (error) {
    console.error(rojo(`❌ Error en scripts/listado-cursos.mjs: ${error.message}`));
    process.exit(1);
  }
}

// Junta las carpetas de cursos/ y el listado. Cada curso:
// { id, carpeta, nombre, repo, descargado }
async function listarCursos() {
  const porId = new Map();

  // 1. Carpetas que ya están en cursos/
  if (fs.existsSync(carpetaCursos)) {
    for (const entrada of fs.readdirSync(carpetaCursos, { withFileTypes: true })) {
      const carpeta = path.join(carpetaCursos, entrada.name);
      if (entrada.isDirectory() && esCursoValido(carpeta)) {
        porId.set(entrada.name, { id: entrada.name, carpeta, repo: null, descargado: true });
      }
    }
  }

  // 2. Cursos del listado (si ya están descargados, solo les añadimos el repo)
  for (const { carpeta: id, repo } of await leerListado()) {
    const existente = porId.get(id);
    if (existente) existente.repo = repo;
    else porId.set(id, { id, carpeta: path.join(carpetaCursos, id), repo, descargado: false });
  }

  const cursos = [...porId.values()].sort((a, b) => a.id.localeCompare(b.id));
  for (const curso of cursos) curso.nombre = curso.descargado ? (leerNombreCurso(curso.carpeta) ?? '—') : '—';

  const demo = { id: 'demo', carpeta: carpetaDemo, nombre: leerNombreCurso(carpetaDemo) ?? 'Demo', repo: null, descargado: true };
  return [demo, ...cursos];
}

// Traduce el argumento (palabra, nombre de carpeta o ruta) a un curso
async function resolverArgumento(argumento) {
  if (palabrasDemo.includes(argumento.toLowerCase())) {
    return { id: 'demo', carpeta: carpetaDemo, descargado: true };
  }
  const esRuta = argumento.includes('/') || argumento.includes('\\') || argumento.startsWith('.');
  if (esRuta) {
    return { id: argumento, carpeta: path.resolve(raizApp, argumento), descargado: true };
  }
  const cursos = await listarCursos();
  return cursos.find(curso => curso.id === argumento)
    ?? { id: argumento, carpeta: path.join(carpetaCursos, argumento), descargado: true };
}

// ─── Teclado ─────────────────────────────────────────────────────────────────
let tecladoPreparado = false;
function prepararTeclado() {
  if (!tecladoPreparado) {
    readline.emitKeypressEvents(process.stdin);
    tecladoPreparado = true;
  }
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function soltarTeclado() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
}

// Pregunta de sí/no con una sola tecla (s / n; Esc = no)
function preguntarSiNo(pregunta) {
  return new Promise(resolve => {
    process.stdout.write(`${pregunta} ${gris('(s/n)')} `);
    prepararTeclado();
    const alPulsar = (_tecla, info) => {
      if (!info) return;
      const respuesta = info.name === 's' ? true
        : (info.name === 'n' || info.name === 'escape' || (info.ctrl && info.name === 'c')) ? false
        : null;
      if (respuesta === null) return;
      process.stdin.off('keypress', alPulsar);
      soltarTeclado();
      console.log(respuesta ? 's' : 'n');
      resolve(respuesta);
    };
    process.stdin.on('keypress', alPulsar);
  });
}

// ─── Menú interactivo: devuelve el curso elegido (o null si se cancela) ─────
async function menu() {
  const cursos = await listarCursos();
  const activo = rutaReal(enlace);
  const indiceActivo = cursos.findIndex(curso => curso.descargado && rutaReal(curso.carpeta) === activo);
  let seleccionado = Math.max(indiceActivo, 0);

  const anchoId = Math.max(...cursos.map(curso => curso.id.length));
  const anchoNombre = Math.max(...cursos.map(curso => curso.nombre.length));

  mostrarBanner();
  console.log(gris('  ↑↓ para moverte · Intro para enchufar · Esc para salir\n'));

  const etiquetaDe = (curso, i) => {
    if (i === indiceActivo) return verde(' ● activo');
    if (!curso.descargado) return amarillo(' ⬇ sin descargar');
    if (!curso.repo && curso.id !== 'demo') return gris(' solo local');
    return '';
  };

  const pintarLista = (repintar) => {
    if (repintar) process.stdout.write(`\x1b[${cursos.length}A`); // subimos el cursor al principio de la lista
    cursos.forEach((curso, i) => {
      const marcado = i === seleccionado;
      const flecha = marcado ? cian('❯') : ' ';
      const id = curso.id.padEnd(anchoId);
      const nombre = curso.nombre.padEnd(anchoNombre);
      process.stdout.write(`\x1b[2K  ${flecha} ${marcado ? cian(negrita(id)) : id}   ${gris(nombre)}${etiquetaDe(curso, i)}\n`);
    });
  };

  process.stdout.write('\x1b[?25l'); // ocultamos el cursor mientras se usa el menú
  pintarLista(false);

  return new Promise(resolve => {
    prepararTeclado();
    const alPulsar = (_tecla, info) => {
      if (!info) return;
      if (info.name === 'up' || info.name === 'down') {
        const paso = info.name === 'up' ? -1 : 1;
        seleccionado = (seleccionado + paso + cursos.length) % cursos.length;
        pintarLista(true);
        return;
      }
      const elegir = info.name === 'return';
      const cancelar = info.name === 'escape' || info.name === 'q' || (info.ctrl && info.name === 'c');
      if (!elegir && !cancelar) return;

      process.stdin.off('keypress', alPulsar);
      soltarTeclado();
      process.stdout.write('\x1b[?25h'); // volvemos a mostrar el cursor
      console.log();
      resolve(elegir ? cursos[seleccionado] : null);
    };
    process.stdin.on('keypress', alPulsar);
  });
}

// ─── Clonar un curso del listado ─────────────────────────────────────────────
function clonar(curso) {
  if (spawnSync('git', ['--version'], { stdio: 'ignore' }).status !== 0) {
    console.error(rojo('❌ No encuentro git instalado. No se puede clonar el curso.'));
    process.exit(1);
  }

  console.log(gris(`\n  git clone ${curso.repo} ${curso.carpeta}\n`));
  const resultado = spawnSync('git', ['clone', curso.repo, curso.carpeta], { stdio: 'inherit' });
  if (resultado.status !== 0) {
    console.error(rojo('\n❌ No se pudo clonar el curso (revisa la URL del repo y la conexión). No se ha cambiado el curso activo.'));
    process.exit(1);
  }

  if (!esCursoValido(curso.carpeta)) {
    console.error(rojo(`\n❌ Clonado, pero no parece un curso: le faltan ${archivosObligatorios.join(' o ')}. No se ha cambiado el curso activo.`));
    process.exit(1);
  }
  console.log(verde('\n✅ Curso clonado.'));
}

// Si el curso no está descargado, pregunta si clonarlo (solo con terminal interactiva)
async function asegurarDescargado(curso) {
  if (curso.descargado) return;

  if (!process.stdin.isTTY) {
    console.error(rojo(`❌ El curso "${curso.id}" no está descargado (y sin terminal interactiva no se clona).`));
    process.exit(1);
  }
  const clonarlo = await preguntarSiNo(`El curso ${negrita(curso.id)} no está descargado. ¿Clonarlo desde ${cian(curso.repo)}?`);
  if (!clonarlo) {
    console.log(gris('\n  Sin cambios.'));
    process.exit(0);
  }
  clonar(curso);
}

// ─── Enchufar: quita el enlace anterior y crea el nuevo ─────────────────────
function enchufar(destino) {
  // 1. Comprobamos que el curso de destino existe y tiene sus json
  for (const archivo of archivosObligatorios) {
    if (!fs.existsSync(path.join(destino, archivo))) {
      console.error(rojo(`❌ No encuentro "${archivo}" en: ${destino}`));
      process.exit(1);
    }
  }

  // 2. Si ya existe "contenido", solo lo quitamos si es un enlace (nunca una carpeta real)
  let infoEnlace = null;
  try { infoEnlace = fs.lstatSync(enlace); } catch { /* no existe, perfecto */ }

  if (infoEnlace) {
    if (!infoEnlace.isSymbolicLink()) {
      console.error(rojo(`❌ "${enlace}" es una carpeta real, no un enlace. No la toco: muévela o bórrala tú a mano.`));
      process.exit(1);
    }
    fs.unlinkSync(enlace); // Quita solo el enlace, no el contenido al que apunta
  }

  // 3. Creamos el enlace nuevo
  fs.symlinkSync(destino, enlace, 'junction');
  console.log(verde(`✅ Curso activo: ${destino}`));
  console.log('   Si tenías "npm start" en marcha, deberías ver los cambios en directo');
}

// ─── Programa principal ──────────────────────────────────────────────────────
const argumento = process.argv[2];

if (argumento && palabrasAyuda.includes(argumento.toLowerCase())) {
  mostrarBanner();
  mostrarAyuda();
} else if (argumento) {
  const curso = await resolverArgumento(argumento);
  await asegurarDescargado(curso);
  enchufar(curso.carpeta);
} else if (process.stdin.isTTY) {
  const curso = await menu();
  if (!curso) {
    console.log(gris('  Sin cambios.'));
  } else {
    await asegurarDescargado(curso);
    enchufar(curso.carpeta);
  }
} else {
  // Sin terminal interactiva (p. ej. en Netlify) no se puede mostrar el menú
  console.error(rojo('❌ No hay terminal interactiva para mostrar el menú. Indica el curso:'));
  mostrarAyuda();
  process.exit(1);
}
