// Elige el curso activo creando el enlace "contenido" que apunta a su carpeta.
//
// Uso:
//   npm run curso                       -> menú para elegir curso (cursores + Intro)
//   npm run curso sqlite                -> usa el curso cursos/sqlite (por nombre de carpeta)
//   npm run curso ../cursos/sqlite      -> usa el curso que está en esa ruta
//   npm run curso demo                  -> vuelve al curso demo (contenido-demo)
//   npm run curso desenchufar           -> igual que "demo"
//   npm run curso descargar             -> clona todos los cursos del listado que falten
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
const palabrasDescargar = ['descargar'];

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
  npm run curso descargar          ${gris('clona todos los cursos del listado que falten (no cambia el curso enchufado)')}
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

// ─── Menú interactivo ────────────────────────────────────────────────────────
// Dos grupos: los cursos que hay EN ESTE EQUIPO y los que están SOLO EN GITHUB
// (en el listado, sin descargar). Si faltan cursos, al final hay una opción para
// descargarlos todos.
// Devuelve { tipo: 'curso', curso }, { tipo: 'descargar' } o null si se cancela.
async function menu(conBanner = true) {
  const cursos = await listarCursos();
  const locales = cursos.filter(curso => curso.descargado);
  const remotos = cursos.filter(curso => !curso.descargado);
  const activo = rutaReal(enlace);

  // Líneas del menú (títulos, cursos, separadores y acciones). Solo cursos y acciones se pueden elegir.
  const lineas = [{ tipo: 'titulo', texto: 'EN ESTE EQUIPO' }];
  for (const curso of locales) lineas.push({ tipo: 'curso', curso });
  lineas.push({ tipo: 'vacia' }, { tipo: 'titulo', texto: 'SOLO EN GITHUB (sin descargar)' });
  if (remotos.length === 0) {
    lineas.push({ tipo: 'aviso', texto: 'Sin elementos (todos los cursos de GitHub están descargados)' });
  } else {
    for (const curso of remotos) lineas.push({ tipo: 'curso', curso });
    lineas.push({ tipo: 'vacia' }, { tipo: 'separador' });
    lineas.push({ tipo: 'descargar', texto: `⬇ Descargar todos los de GitHub que faltan (${remotos.length})` });
  }

  const elegibles = lineas.map((linea, i) => i).filter(i => ['curso', 'descargar'].includes(lineas[i].tipo));
  const posicionActivo = elegibles.findIndex(i => lineas[i].curso?.descargado && rutaReal(lineas[i].curso.carpeta) === activo);
  let posicion = Math.max(posicionActivo, 0); // posición dentro de "elegibles"

  const anchoId = Math.max(...cursos.map(curso => curso.id.length));
  const anchoNombre = Math.max(...cursos.map(curso => curso.nombre.length));

  const etiquetaDe = (curso) => {
    if (curso.descargado && rutaReal(curso.carpeta) === activo) return verde('● enchufado');
    if (curso.descargado && !curso.repo && curso.id !== 'demo') return amarillo('⚠ no está en GitHub');
    return '';
  };

  const textoDe = (linea, marcado) => {
    const flecha = marcado ? cian('❯') : ' ';
    switch (linea.tipo) {
      case 'titulo': return `  ${negrita(linea.texto)}`;
      case 'vacia': return '';
      case 'aviso': return gris(`    ${linea.texto}`);
      case 'separador': return gris('  ' + '─'.repeat(anchoId + anchoNombre + 8));
      case 'descargar': return `  ${flecha} ${marcado ? cian(negrita(linea.texto)) : amarillo(linea.texto)}`;
      case 'curso': {
        const id = linea.curso.id.padEnd(anchoId);
        const nombre = linea.curso.nombre.padEnd(anchoNombre);
        return `  ${flecha} ${marcado ? cian(negrita(id)) : id}   ${gris(nombre)}   ${etiquetaDe(linea.curso)}`;
      }
    }
  };

  const pintar = (repintar) => {
    if (repintar) process.stdout.write(`\x1b[${lineas.length}A`); // subimos el cursor al principio del menú
    lineas.forEach((linea, i) => {
      process.stdout.write(`\x1b[2K${textoDe(linea, i === elegibles[posicion])}\n`);
    });
  };

  if (conBanner) mostrarBanner();
  else console.log();
  console.log(gris('  ↑↓ para moverte · Intro para elegir · Esc para salir\n'));
  process.stdout.write('\x1b[?25l'); // ocultamos el cursor mientras se usa el menú
  pintar(false);

  return new Promise(resolve => {
    prepararTeclado();
    const alPulsar = (_tecla, info) => {
      if (!info) return;
      if (info.name === 'up' || info.name === 'down') {
        const paso = info.name === 'up' ? -1 : 1;
        posicion = (posicion + paso + elegibles.length) % elegibles.length;
        pintar(true);
        return;
      }
      const elegir = info.name === 'return';
      const cancelar = info.name === 'escape' || info.name === 'q' || (info.ctrl && info.name === 'c');
      if (!elegir && !cancelar) return;

      process.stdin.off('keypress', alPulsar);
      soltarTeclado();
      process.stdout.write('\x1b[?25h'); // volvemos a mostrar el cursor
      console.log();
      if (!elegir) return resolve(null);
      const linea = lineas[elegibles[posicion]];
      resolve(linea.tipo === 'descargar' ? { tipo: 'descargar' } : { tipo: 'curso', curso: linea.curso });
    };
    process.stdin.on('keypress', alPulsar);
  });
}

// ─── Clonar un curso del listado ─────────────────────────────────────────────
function comprobarGit() {
  if (spawnSync('git', ['--version'], { stdio: 'ignore' }).status !== 0) {
    console.error(rojo('❌ No encuentro git instalado. No se puede clonar ningún curso.'));
    process.exit(1);
  }
}

// Clona el curso. Devuelve true si todo fue bien (no termina el programa si falla).
function clonar(curso) {
  console.log(gris(`\n  git clone ${curso.repo} ${curso.carpeta}\n`));
  const resultado = spawnSync('git', ['clone', curso.repo, curso.carpeta], { stdio: 'inherit' });
  if (resultado.status !== 0) {
    console.error(rojo(`\n❌ No se pudo clonar "${curso.id}" (revisa la URL del repo y la conexión).`));
    return false;
  }
  if (!esCursoValido(curso.carpeta)) {
    console.error(rojo(`\n❌ "${curso.id}" se ha clonado, pero no parece un curso: le faltan ${archivosObligatorios.join(' o ')}.`));
    return false;
  }
  console.log(verde(`\n✅ Curso "${curso.id}" clonado.`));
  return true;
}

// Clona todos los cursos del listado que no estén descargados (sin cambiar el curso enchufado).
// Devuelve el número de cursos que dieron error.
async function descargarTodos() {
  const pendientes = (await listarCursos()).filter(curso => !curso.descargado);
  const yaEstaban = (await leerListado()).length - pendientes.length;

  if (pendientes.length === 0) {
    console.log(verde(`✅ Todos los cursos del listado ya están descargados (${yaEstaban}).`));
    return 0;
  }

  comprobarGit();
  console.log(`Cursos por descargar: ${pendientes.map(curso => negrita(curso.id)).join(', ')}`);

  let clonados = 0;
  let errores = 0;
  for (const curso of pendientes) {
    if (clonar(curso)) clonados++;
    else errores++;
  }

  console.log(`\n${verde(`✅ ${clonados} clonados`)} · ${gris(`⏭ ${yaEstaban} ya estaban`)} · ${errores ? rojo(`❌ ${errores} con error`) : gris('❌ 0 con error')}`);
  return errores;
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
  comprobarGit();
  if (!clonar(curso)) {
    console.error(rojo('   No se ha cambiado el curso activo.'));
    process.exit(1);
  }
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
} else if (argumento && palabrasDescargar.includes(argumento.toLowerCase())) {
  const errores = await descargarTodos();
  if (errores) process.exit(1);
} else if (argumento) {
  const curso = await resolverArgumento(argumento);
  await asegurarDescargado(curso);
  enchufar(curso.carpeta);
} else if (process.stdin.isTTY) {
  // El menú se repite mientras se descargan cursos; termina al enchufar uno o al salir (Esc)
  let primeraVez = true;
  while (true) {
    const eleccion = await menu(primeraVez);
    primeraVez = false;

    if (!eleccion) {
      console.log(gris('  Sin cambios.'));
      break;
    }
    if (eleccion.tipo === 'descargar') {
      await descargarTodos();
      continue; // volvemos al menú: los cursos descargados ya salen en "EN ESTE EQUIPO"
    }
    const curso = eleccion.curso;
    if (!curso.descargado) {
      const clonarlo = await preguntarSiNo(`El curso ${negrita(curso.id)} no está descargado. ¿Clonarlo desde ${cian(curso.repo)}?`);
      if (clonarlo) {
        comprobarGit();
        clonar(curso);
      }
      continue; // solo se descarga; para enchufarlo, se elige después en el menú
    }
    enchufar(curso.carpeta);
    break;
  }
} else {
  // Sin terminal interactiva (p. ej. en Netlify) no se puede mostrar el menú
  console.error(rojo('❌ No hay terminal interactiva para mostrar el menú. Indica el curso:'));
  mostrarAyuda();
  process.exit(1);
}
