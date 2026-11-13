// Comprime las imágenes de un curso (temario/img e img), manteniendo nombre y formato.
//
// Uso:
//   npm run comprimir sqlite             -> curso cursos/sqlite (por nombre de carpeta)
//   npm run comprimir ../cursos/sqlite   -> curso de esa ruta
//   npm run comprimir demo               -> curso demo (contenido-demo)
//
// Funcionamiento:
//   1. Comprime una copia de cada imagen en una carpeta temporal (el curso NO se toca).
//   2. Muestra un resumen con lo que se ahorra.
//   3. Pregunta si aplicar los cambios: solo se sustituyen las imágenes que ocupan menos
//      (y, en los GIF, solo si conservan resolución, duración total y bucle).
//
// Necesita sharp-cli instalado de forma global (npm install -g sharp-cli@6). No es una
// dependencia de la app: si no está, el script ofrece instalarlo.
//
// Receta (probada con los cursos de Angular y Microsoft 365):
//   PNG  -> paleta de colores, calidad 80, compresión 9, esfuerzo máximo
//   GIF  -> animado, esfuerzo máximo, interFrameMaxError 8 (junta fotogramas repetidos)
//   JPG  -> mozjpeg, calidad 80
//   WebP y SVG no se tocan.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mostrarBanner, preguntarSiNo, cian, verde, amarillo, rojo, gris, negrita } from './comun.mjs';

// ─── Rutas (igual que en curso.mjs) ──────────────────────────────────────────
const raizApp = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const carpetaDemo = path.join(raizApp, 'contenido-demo');
const carpetaCursos = path.resolve(raizApp, '..', 'cursos');
const carpetasImagenes = ['temario/img', 'img'];
const versionSharpCli = '6';

const mb = (bytes) => (bytes / 1048576).toFixed(1) + ' MB';

// Traduce el argumento (demo, nombre de carpeta o ruta) a la carpeta del curso
function resolverCurso(argumento) {
  if (argumento.toLowerCase() === 'demo') return carpetaDemo;
  const esRuta = argumento.includes('/') || argumento.includes('\\') || argumento.startsWith('.');
  return esRuta ? path.resolve(raizApp, argumento) : path.join(carpetaCursos, argumento);
}

// ─── sharp: comprueba sharp-cli y carga su librería ──────────────────────────
function ejecutar(comando) {
  return spawnSync(comando, { shell: true, encoding: 'utf8' });
}

function cargarSharp() {
  if (ejecutar('sharp --version').status !== 0) return null;
  const raizGlobal = ejecutar('npm root -g').stdout?.trim();
  if (!raizGlobal) return null;
  const candidatos = [path.join(raizGlobal, 'sharp-cli', 'node_modules', 'sharp'), path.join(raizGlobal, 'sharp')];
  const requerir = createRequire(import.meta.url);
  for (const candidato of candidatos) {
    try { return requerir(candidato); } catch { /* probamos el siguiente */ }
  }
  return null;
}

async function asegurarSharp() {
  let sharp = cargarSharp();
  if (sharp) return sharp;

  console.log(amarillo('⚠️  Este script necesita sharp-cli instalado de forma global.'));
  if (!process.stdin.isTTY) {
    console.log(`   Instálalo con: ${cian(`npm install -g sharp-cli@${versionSharpCli}`)}`);
    process.exit(1);
  }
  const instalar = await preguntarSiNo(`   ¿Instalarlo ahora con ${cian(`npm install -g sharp-cli@${versionSharpCli}`)}?`);
  if (!instalar) {
    console.log(gris('\n  Sin cambios.'));
    process.exit(0);
  }
  const resultado = spawnSync(`npm install -g sharp-cli@${versionSharpCli}`, { shell: true, stdio: 'inherit' });
  sharp = resultado.status === 0 ? cargarSharp() : null;
  if (!sharp) {
    console.error(rojo('❌ No se ha podido instalar o cargar sharp-cli.'));
    process.exit(1);
  }
  console.log(verde('✅ sharp-cli instalado.\n'));
  return sharp;
}

// ─── Imágenes del curso ──────────────────────────────────────────────────────
function listarImagenes(carpetaCurso) {
  const imagenes = [];
  const recorrer = (carpeta) => {
    for (const entrada of fs.readdirSync(carpeta, { withFileTypes: true })) {
      const ruta = path.join(carpeta, entrada.name);
      if (entrada.isDirectory()) recorrer(ruta);
      else if (['.png', '.gif', '.jpg', '.jpeg'].includes(path.extname(ruta).toLowerCase())) imagenes.push(ruta);
    }
  };
  for (const relativa of carpetasImagenes) {
    const carpeta = path.join(carpetaCurso, relativa);
    if (fs.existsSync(carpeta)) recorrer(carpeta);
  }
  return imagenes;
}

const sumaRetardos = (retardos) => (retardos || []).reduce((total, x) => total + x, 0);

async function comprimirImagen(sharp, original, extension) {
  if (extension === 'png') return sharp(original).png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 }).toBuffer();
  if (extension === 'gif') return sharp(original, { animated: true, limitInputPixels: false }).gif({ effort: 10, interFrameMaxError: 8 }).toBuffer();
  return sharp(original).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}

// En los GIF, la versión comprimida debe conservar resolución, duración total y bucle
async function gifEquivalente(sharp, original, comprimido) {
  const opciones = { animated: true, limitInputPixels: false };
  const a = await sharp(original, opciones).metadata();
  const b = await sharp(comprimido, opciones).metadata();
  return a.width === b.width
    && (a.pageHeight || a.height) === (b.pageHeight || b.height)
    && sumaRetardos(a.delay) === sumaRetardos(b.delay)
    && a.loop === b.loop;
}

// ─── Programa principal ──────────────────────────────────────────────────────
mostrarBanner('Compresor de imágenes');

const argumento = process.argv[2];
if (!argumento) {
  console.log(`${negrita('Uso:')} npm run comprimir ${cian('<carpeta>')}  ${gris('(o una ruta, o "demo")')}`);
  process.exit(1);
}

const carpetaCurso = resolverCurso(argumento);
if (!fs.existsSync(path.join(carpetaCurso, 'json', 'config.json'))) {
  console.error(rojo(`❌ No encuentro un curso en: ${carpetaCurso}`));
  process.exit(1);
}

const sharp = await asegurarSharp();
const imagenes = listarImagenes(carpetaCurso);
if (imagenes.length === 0) {
  console.log(gris('  El curso no tiene imágenes PNG, GIF ni JPG que comprimir.'));
  process.exit(0);
}

console.log(`Curso: ${negrita(carpetaCurso)}`);
console.log(gris(`  ${imagenes.length} imágenes (PNG, GIF, JPG). WebP y SVG no se tocan.\n`));

// 1. Prueba en carpeta temporal
const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'temario-comprimir-'));
const resultados = []; // { ruta, temporal, antes, despues, sustituir }
const gifRechazados = [];
const errores = [];
const porTipo = {}; // extensión -> { antes, despues }

for (const [i, ruta] of imagenes.entries()) {
  if (process.stdout.isTTY) process.stdout.write(`\r  Comprimiendo (prueba)... ${i + 1}/${imagenes.length}`);
  const extension = path.extname(ruta).toLowerCase().slice(1).replace('jpeg', 'jpg');
  const original = fs.readFileSync(ruta);
  const tipo = (porTipo[extension] ??= { antes: 0, despues: 0 });
  tipo.antes += original.length;

  let despues = original.length;
  let sustituir = false;
  let temporal = null;
  try {
    const comprimido = await comprimirImagen(sharp, original, extension);
    if (comprimido.length < original.length) {
      if (extension === 'gif' && !(await gifEquivalente(sharp, original, comprimido))) {
        gifRechazados.push(path.relative(carpetaCurso, ruta));
      } else {
        temporal = path.join(carpetaTemporal, path.relative(carpetaCurso, ruta));
        fs.mkdirSync(path.dirname(temporal), { recursive: true });
        fs.writeFileSync(temporal, comprimido);
        despues = comprimido.length;
        sustituir = true;
      }
    }
  } catch (error) {
    errores.push(`${path.relative(carpetaCurso, ruta)}: ${error.message}`);
  }
  tipo.despues += despues;
  resultados.push({ ruta, temporal, antes: original.length, despues, sustituir });
}
if (process.stdout.isTTY) process.stdout.write('\r\x1b[2K');

// 2. Resumen
const total = resultados.reduce((t, r) => ({ antes: t.antes + r.antes, despues: t.despues + r.despues }), { antes: 0, despues: 0 });
const aSustituir = resultados.filter(r => r.sustituir);
const ahorro = total.antes > 0 ? 1 - total.despues / total.antes : 0;

console.log(negrita('Resumen de la prueba (el curso todavía no se ha tocado):'));
for (const [extension, tipo] of Object.entries(porTipo)) {
  const porcentaje = tipo.antes > 0 ? Math.round(100 * (1 - tipo.despues / tipo.antes)) : 0;
  console.log(`  ${extension.toUpperCase().padEnd(4)} ${mb(tipo.antes).padStart(9)} → ${mb(tipo.despues).padStart(9)}  ${gris(`(-${porcentaje} %)`)}`);
}
console.log(gris('  ' + '─'.repeat(36)));
console.log(cian(negrita(`  TOTAL${mb(total.antes).padStart(9)} → ${mb(total.despues).padStart(9)}  (-${Math.round(100 * ahorro)} %)`)));
console.log(`\n  ${verde(`${aSustituir.length} se sustituirían`)} · ${gris(`${resultados.length - aSustituir.length} se quedan como están (la comprimida no ocupa menos)`)}`);

const masAhorran = [...aSustituir].sort((a, b) => (b.antes - b.despues) - (a.antes - a.despues)).slice(0, 5);
if (masAhorran.length) {
  console.log(gris('\n  Las que más ahorran:'));
  for (const r of masAhorran) console.log(gris(`    ${mb(r.antes)} → ${mb(r.despues)}  ${path.relative(carpetaCurso, r.ruta)}`));
}
if (gifRechazados.length) {
  console.log(amarillo(`\n  ⚠️  ${gifRechazados.length} GIF se quedan sin comprimir (no conservaban resolución, duración o bucle):`));
  for (const gif of gifRechazados) console.log(amarillo(`    - ${gif}`));
}
if (errores.length) {
  console.log(rojo(`\n  ❌ ${errores.length} con error (se quedan como están):`));
  for (const error of errores) console.log(rojo(`    - ${error}`));
}
if (ahorro < 0.15) {
  console.log(amarillo('\n  ⚠️  El ahorro es muy pequeño: parece que el curso ya estaba comprimido.'));
  console.log(amarillo('     Volver a comprimir puede bajar un poco la calidad de algunos PNG sin apenas ahorrar espacio.'));
}

// 3. Aplicar (con confirmación)
const borrarTemporal = () => fs.rmSync(carpetaTemporal, { recursive: true, force: true });

if (aSustituir.length === 0) {
  console.log(gris('\n  No hay nada que sustituir.'));
  borrarTemporal();
  process.exit(0);
}
if (!process.stdin.isTTY) {
  console.log(gris('\n  Sin terminal interactiva: solo se muestra el resumen. No se ha cambiado nada.'));
  borrarTemporal();
  process.exit(0);
}

console.log();
const aplicar = await preguntarSiNo(`¿Aplicar los cambios y sustituir ${negrita(aSustituir.length)} imágenes del curso?`);
if (aplicar) {
  for (const r of aSustituir) fs.copyFileSync(r.temporal, r.ruta);
  console.log(verde(`\n✅ ${aSustituir.length} imágenes sustituidas. El curso ha pasado de ${mb(total.antes)} a ${mb(total.despues)} en imágenes.`));
} else {
  console.log(gris('\n  Sin cambios.'));
}
borrarTemporal();
