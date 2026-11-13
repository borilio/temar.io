// Utilidades compartidas por los scripts de temar.io (colores, banner y preguntas s/n).

import readline from 'node:readline';

// ─── Colores de la terminal (se desactivan si no es una terminal real) ──────
const conColor = process.stdout.isTTY && !process.env.NO_COLOR;
const color = (codigo) => (texto) => conColor ? `\x1b[${codigo}m${texto}\x1b[0m` : texto;
export const naranja = color('38;5;208');
export const cian = color('36');
export const verde = color('32');
export const amarillo = color('33');
export const rojo = color('31');
export const gris = color('90');
export const negrita = color('1');

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

export function mostrarBanner(subtitulo) {
  console.log();
  for (let fila = 0; fila < 5; fila++) {
    console.log('  ' + naranja(letras.map(letra => letra[fila]).join('')));
  }
  console.log(gris(`  ${subtitulo}\n`));
}

// ─── Pregunta de sí/no con una sola tecla (s / n; Esc = no) ─────────────────
let tecladoPreparado = false;

export function preguntarSiNo(pregunta) {
  return new Promise(resolve => {
    process.stdout.write(`${pregunta} ${gris('(s/n)')} `);
    if (!tecladoPreparado) {
      readline.emitKeypressEvents(process.stdin);
      tecladoPreparado = true;
    }
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const alPulsar = (_tecla, info) => {
      if (!info) return;
      const respuesta = info.name === 's' ? true
        : (info.name === 'n' || info.name === 'escape' || (info.ctrl && info.name === 'c')) ? false
        : null;
      if (respuesta === null) return;
      process.stdin.off('keypress', alPulsar);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.log(respuesta ? 's' : 'n');
      resolve(respuesta);
    };
    process.stdin.on('keypress', alPulsar);
  });
}
