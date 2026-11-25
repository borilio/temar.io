import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { PRIMENG_IMPORTS } from '../../../shared/primeng.imports';
import { ConfigService } from '../../../services/config.service';

// QR propio del curso: si existe este archivo (img/qrcode.png en la carpeta img/ del curso), se usa en vez de generarlo
const QR_PROPIO = 'img/qrcode.png';
// Logo del centro del QR generado (imagen de la app)
const LOGO_QR = 'img/logo-700x700.png';
// Tamaño interno del QR generado (en pantalla se ajusta con CSS)
const TAMANO_QR = 600;
// Velocidad de giro del degradado del QR generado (radianes por segundo: 4 ≈ una vuelta cada 1,5 s)
const VELOCIDAD_GIRO = 4;

/**
 * Página para compartir el curso (/qr), para proyectarla en clase:
 * título grande y un QR con la dirección del curso para abrirlo en el móvil.
 * Se llega desde el botón "Compartir curso" de "Acerca de".
 */
@Component({
  selector: 'app-compartir',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './compartir.html',
  styleUrl: './compartir.css'
})
export class Compartir implements AfterViewInit, OnDestroy {

  public nombreCurso: string;
  public direccion: string;        // Dirección completa del curso (la del propio sitio, así vale para cualquier curso)
  public direccionVisible: string; // La misma, sin "https://", para leerla y teclearla mejor
  public qrPropio: string | null = null; // Ruta del QR propio del curso, si existe

  @ViewChild('lienzoQr') lienzoQr?: ElementRef<HTMLCanvasElement>;
  @ViewChild('marcoQr') marcoQr?: ElementRef<HTMLElement>;
  private fotograma = 0; // Animación del degradado del QR generado
  private fotogramaSombra = 0;
  private quitarSombra?: () => void;

  constructor(private configService: ConfigService, private zona: NgZone) {
    this.nombreCurso = this.configService.getNombreCurso();
    this.direccion = window.location.origin;
    this.direccionVisible = window.location.host;
  }

  ngAfterViewInit(): void {
    // Si el curso tiene su propio img/qrcode.png, se usa ese; si no, se genera.
    // Se comprueba cargándolo como imagen: si el archivo no existe, el servidor devuelve la página principal
    // (con npm start y en Netlify), así que no basta con preguntar si existe
    const imagen = new Image();
    imagen.onload = () => this.qrPropio = QR_PROPIO;
    imagen.onerror = () => this.generarQr();
    imagen.src = QR_PROPIO;
  }

  /**
   * Genera el QR en el canvas: con la máxima corrección de errores (permite tapar el centro con el logo),
   * los puntos con un degradado oscuro del color del tema que gira despacio (los puntos siempre son oscuros,
   * así que se sigue leyendo bien) y el logo en el centro.
   */
  private async generarQr(): Promise<void> {
    const lienzo = this.lienzoQr?.nativeElement;
    if (!lienzo) return;

    // 1. El QR en negro sobre blanco, en un canvas aparte: es la "plantilla" que se colorea en cada fotograma
    const plantilla = document.createElement('canvas');
    await toCanvas(plantilla, this.direccion, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: TAMANO_QR,
      color: { dark: '#000000', light: '#ffffff' }
    });
    lienzo.width = plantilla.width;
    lienzo.height = plantilla.height;
    const contexto = lienzo.getContext('2d');
    if (!contexto) return;

    // Colores del degradado (dos tonos oscuros del tema) y el logo
    const estilos = getComputedStyle(document.documentElement);
    const colorInicio = estilos.getPropertyValue('--p-primary-700').trim() || '#1f2937';
    const colorFin = estilos.getPropertyValue('--p-primary-950').trim() || '#000000';
    const logo = await cargarImagen(LOGO_QR).catch(() => null);

    // 2. Se dibuja una vez y, si no se pide reducir el movimiento, se anima girando el degradado.
    //    Fuera de Angular: así no se lanza la detección de cambios en cada fotograma
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dibujar = (angulo: number) => this.dibujarQr(contexto, plantilla, angulo, colorInicio, colorFin, logo);
    dibujar(Math.PI / 4);
    if (sinMovimiento) return;
    this.seguirRatonConLaSombra();
    this.zona.runOutsideAngular(() => {
      const inicio = performance.now();
      const fotograma = (ahora: number) => {
        dibujar(Math.PI / 4 + (ahora - inicio) / 1000 * VELOCIDAD_GIRO);
        this.fotograma = requestAnimationFrame(fotograma);
      };
      this.fotograma = requestAnimationFrame(fotograma);
    });
  }

  /** Dibuja el QR con el degradado en el ángulo indicado y el logo en el centro */
  private dibujarQr(contexto: CanvasRenderingContext2D, plantilla: HTMLCanvasElement, angulo: number,
                    colorInicio: string, colorFin: string, logo: HTMLImageElement | null): void {
    const ancho = plantilla.width;
    const centro = ancho / 2;

    // a) El QR en negro sobre blanco
    contexto.globalCompositeOperation = 'source-over';
    contexto.drawImage(plantilla, 0, 0);

    // b) Degradado del tema solo sobre los puntos: con "lighten", el negro toma el color del degradado
    //    y el blanco se queda blanco
    const dx = Math.cos(angulo) * centro, dy = Math.sin(angulo) * centro;
    const degradado = contexto.createLinearGradient(centro - dx, centro - dy, centro + dx, centro + dy);
    degradado.addColorStop(0, colorInicio);
    degradado.addColorStop(1, colorFin);
    contexto.globalCompositeOperation = 'lighten';
    contexto.fillStyle = degradado;
    contexto.fillRect(0, 0, ancho, ancho);
    contexto.globalCompositeOperation = 'source-over';

    // c) El logo en el centro, sobre un cuadrado blanco redondeado (alrededor de un 20 % del QR)
    if (!logo) return;
    const lado = ancho * 0.22;
    const margen = lado * 0.12;
    const x = (ancho - lado) / 2;
    contexto.fillStyle = '#ffffff';
    contexto.beginPath();
    contexto.roundRect(x - margen, x - margen, lado + margen * 2, lado + margen * 2, lado * 0.2);
    contexto.fill();
    contexto.drawImage(logo, x, x, lado, lado);
  }

  /**
   * Sombra proyectada: el ratón hace de foco de luz y la sombra del QR cae hacia el lado contrario,
   * más larga cuanto más lejos está el cursor. Fuera de Angular y como mucho una vez por fotograma
   */
  private seguirRatonConLaSombra(): void {
    const marco = this.marcoQr?.nativeElement;
    if (!marco) return;
    const DISTANCIA_MAXIMA = 45; // px de desplazamiento de la sombra como mucho
    const mover = (evento: PointerEvent) => {
      if (evento.pointerType !== 'mouse') return;
      cancelAnimationFrame(this.fotogramaSombra);
      this.fotogramaSombra = requestAnimationFrame(() => {
        const r = marco.getBoundingClientRect();
        const limitar = (valor: number) => Math.max(-DISTANCIA_MAXIMA, Math.min(DISTANCIA_MAXIMA, valor));
        // Del cursor al centro del QR, y la sombra hacia el otro lado
        const x = limitar(-(evento.clientX - (r.left + r.width / 2)) * 0.08);
        const y = limitar(-(evento.clientY - (r.top + r.height / 2)) * 0.08);
        marco.style.setProperty('--sombra-x', `${x}px`);
        marco.style.setProperty('--sombra-y', `${y}px`);
      });
    };
    this.zona.runOutsideAngular(() => window.addEventListener('pointermove', mover));
    this.quitarSombra = () => window.removeEventListener('pointermove', mover);
  }

  ngOnDestroy(): void {
    // Paramos las animaciones al salir de la página
    cancelAnimationFrame(this.fotograma);
    cancelAnimationFrame(this.fotogramaSombra);
    this.quitarSombra?.();
  }

}

/** Carga una imagen y la devuelve cuando está lista */
function cargarImagen(ruta: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = reject;
    imagen.src = ruta;
  });
}
