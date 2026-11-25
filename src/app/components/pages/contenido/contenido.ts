import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CodeHeader } from '../../layout/code-header/code-header'; // Componente code-header (cabecera para los bloques de código)
import { PRIMENG_IMPORTS } from '../../../shared/primeng.imports';
import { MarkdownService } from '../../../services/markdown.service';
import { MessageService } from 'primeng/api';
import { Image } from 'primeng/image';

// Importamos DomSanitizer para evitar que Angular elimine los estilos
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EstadoTema, TemarioService } from '../../../services/temario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

// Patrones decorativos de la cabecera y el pie (definidos en contenido.css: patron-a … patron-n)
const PATRONES = 'abcdefghijklmn';
const ESQUINAS = 4; // esquina-0 … esquina-3

// Índice fijo a la izquierda: solo en pantallas anchas (fijado u oculto es una preferencia: PreferenciasService)
const ANCHO_INDICE_FIJO = '(min-width: 1200px)';

/** Un apartado del índice lateral */
interface EntradaIndice {
  id: string;     // id del título en el contenido (tal cual, puede ir codificado)
  texto: string;  // texto del título
  nivel: number;  // 1 = principal, 2 = subapartado…
}

/** Texto sin tildes y en minúsculas, para buscar sin distinguirlas ("Fórmulas" = "formulas") */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Escapa el HTML de un texto (para pintarlo con innerHTML sin riesgos) */
const escaparHtml = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
import { Subscription } from 'rxjs';
import { ConfigService } from '../../../services/config.service';
import { PreferenciasService } from '../../../services/preferencias.service';
import { Tema } from '../../../models/temario.model';

// Clave en sessionStorage donde se guarda el tema y la posición del scroll antes de recargar
const CLAVE_SCROLL = 'temario-scroll';

@Component({
  selector: 'app-contenido',
  imports: [PRIMENG_IMPORTS, NgTemplateOutlet],
  providers: [MessageService],
  templateUrl: './contenido.html',
  styleUrls: [
    './contenido.css',     // estilos del componente
    './contenido-md.css',  // estilos sobrescritos para el markdown
    './widgets.css'        // estilos de los widgets
  ],
  encapsulation: ViewEncapsulation.None //Es para aplicar los estilos de forma "global", no me gusta, pero parece que no había otra forma
})
export class Contenido implements OnInit {
  public contenidoHTML: SafeHtml;
  public cargandoContenido: boolean;
  public hayError: boolean;
  public fraseCargando: string = "Cargando contenidos..."; // Se cambia por una al azar en el constructor
  private routeSuscripcion!: Subscription; // Para estar al corriente de los cambios que se hacen de url

  // Para la navegación, tener info del tema actual, siguiente y anterior
  public temaActual: Tema | undefined;
  public estadoTema: EstadoTema = 'normal'; // normal (su .md), construccion o noDisponible (pantallas fijas), noExiste
  public temaSiguiente: Tema | null = null;
  public temaAnterior: Tema | null = null;
  public bloqueCabecera: string | null = null; // Título del bloque en la cabecera (solo si aporta algo)
  // Estilo de los botones anterior/siguiente (cabecera y pie), definidos en contenido.css:
  // a = blanco relleno · b = con borde · c = enlace subrayado · d = enlace con cápsula al pasar el ratón · e = cristal
  public estiloNavegacion = 'd';
  public clasePatron = ''; // Patrón decorativo y esquina de la cabecera y el pie (siempre los mismos para cada tema)

  // Índice lateral (solo si el .md tiene [TOC]): se construye a partir de los enlaces del TOC de markdown-it
  public mostrarDrawer: boolean; // Para mostrar el índice lateral
  public entradasIndice: EntradaIndice[] = []; // Apartados del tema (vacío si el .md no tiene [TOC])
  public filtroIndice = ''; // Texto del buscador del índice
  public idActivo: string | null = null; // Apartado que se está leyendo ("Estás aquí")
  private titulosIndice: HTMLElement[] = []; // Los títulos del tema, en el mismo orden que entradasIndice
  private fotogramaScroll = 0;
  private focoEnBuscador = false; // Al abrir el panel, poner el cursor en el buscador (solo si se abrió con Ctrl+I)
  public seleccionIndice = 0; // Resultado elegido con ↑ ↓ en el buscador (Intro salta a él)
  public buscadorConFoco = false; // La marca del resultado elegido solo se ve mientras se usa el buscador
  public pantallaAncha = false; // La pantalla es lo bastante ancha para el índice fijo
  private consultaAncho?: MediaQueryList;
  private alCambiarAncho = (evento: MediaQueryListEvent) => this.pantallaAncha = evento.matches;

  // Al recargar la página (al guardar el .md con "npm start", o con F5) se vuelve a donde se estaba
  private scrollRestaurado = false; // solo se intenta en la primera carga tras recargar

  constructor(
    private markdownService: MarkdownService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
    // Para la navegación dinámica...
    private temarioService: TemarioService,
    private route: ActivatedRoute,
    private router: Router,
    // Para la configuración...
    public configService: ConfigService, //Tiene que ser público, para poder usarlo desde HTML
    private preferencias: PreferenciasService

  ) {
    this.contenidoHTML = "";
    this.cargandoContenido = true;
    this.hayError = false;
    this.mostrarDrawer = false;
    
    // Inicializamos el array con frases aleatorias 
    this.fraseCargando = this.elegirFrase();

  }

  ngOnInit(): void {
    // Vigilamos el ancho de la pantalla para mostrar u ocultar el índice fijo
    this.consultaAncho = window.matchMedia(ANCHO_INDICE_FIJO);
    this.pantallaAncha = this.consultaAncho.matches;
    this.consultaAncho.addEventListener('change', this.alCambiarAncho);


    // Nos suscribimos a los cambios de URL
    this.routeSuscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Guarda el tema actual, siguiente y anterior (para la navegación y cabecera)
        this.temaActual = this.temarioService.getTemaById(id);
        this.temaAnterior = this.temarioService.getTemaAnterior(id);
        this.temaSiguiente = this.temarioService.getTemaSiguiente(id);
        this.bloqueCabecera = this.temarioService.getBloqueParaCabecera(id);
        this.clasePatron = this.calcularPatron(id);

        // Cargamos el contenido md de la id del tema que tenemos en la url
        this.cargarContenidoDelTema(id);
      }
    });
  }

  /**
   * Método que retorna una frase de inicialización de contenidos al azar
   * @returns string aleatorio que se mostrará al cargar el contenido
   */
  private elegirFrase(): string {
    const frases: string[] = [
      "Cargando contenidos...",
      "Descargando conocimientos...",
      "Compilando apuntes...",
      "Afinando píxeles educativos...",
      "Despertando a los servidores...",
      "Preparando café para el procesador ☕",
      "Buscando el punto y coma perdido...",
      "Ordenando bits y bytes...",
      "Conectando cables imaginarios...",
      "Actualizando neuronas digitales...",
      "Encendiendo el modo estudiante...",
      "Instalando sabiduría...",
      "Cifrando conocimiento...",
      "Desfragmentando ideas...",
      "Puliendo ejercicios prácticos...",
      "Abriendo la caja de herramientas...",
      "Sincronizando competencias digitales...",
      "Convenciendo al WiFi de colaborar...",
      "Preparando comandos secretos...",
      "Reiniciando la creatividad...",
      "Cargando toneladas de informática...",
      "Ejecutando scripts educativos...",
      "Limpiando el polvo del teclado...",
      "Calibrando el ratón...",
      "Invocando a los dioses del CSS...",
      "Convirtiendo café en contenido...",
      "Recopilando conocimientos ancestrales...",
      "Escaneando memes educativos...",
      "Formateando la paciencia...",
      "Subiendo de nivel académico..."
    ];

    const indice = Math.floor(Math.random() * frases.length);
    return frases[indice];
  }

  /**
   * Método que inicia la acción de abrir el drawer para mostrar el TOC.
   * @param desdeTeclado true si se abre con Ctrl+I: entonces se pone el cursor en el buscador.
   *   Con un clic o tocando la brújula no (en el móvil abriría el teclado y taparía el índice)
   */
  public abrirDrawer(desdeTeclado = false) {
    // Con el índice fijo a la vista, solo ponemos el cursor en su buscador
    if (this.indiceFijoVisible) {
      document.querySelector<HTMLInputElement>('.indice-fijo .indice-buscador input')?.focus();
      return;
    }
    //Si tiene TOC abrimos el drawer, si no mostramos el toast
    if (this.entradasIndice.length > 0) {
      this.focoEnBuscador = desdeTeclado;
      this.mostrarDrawer = true;
    } else {
      this.messageService.add({
        severity: "info",
        summary: "Sin índice",
        detail: "Este contenido no tiene índices",
        life: 4000
      });
    }
  }

  /**
   * Método que inicia la acción de ir al siguiente contenido
   */
  public irSiguiente() {
    if (this.temaSiguiente) {
      this.router.navigate(["/tema/", this.temaSiguiente.id]);
    }
  }

  /**
   * Patrón decorativo y esquina de la cabecera y el pie, a partir del id del tema.
   * El id no cambia nunca (es la URL), así que cada tema tiene siempre el mismo dibujo.
   * Un "hash" sencillo del id: del mismo número sale el patrón (14) y la esquina (4).
   */
  private calcularPatron(id: string): string {
    let hash = 0;
    for (const caracter of id) {
      hash = (hash * 31 + caracter.charCodeAt(0)) >>> 0; // >>> 0: se queda en un entero positivo
    }
    const patron = PATRONES[hash % PATRONES.length];
    const esquina = Math.floor(hash / PATRONES.length) % ESQUINAS;
    return `con-patron patron-${patron} esquina-${esquina}`;
  }

  /** Vuelve al índice (desde las pantallas de "no existe" y "no disponible") */
  public volverAlIndice() {
    this.router.navigate(["/"]);
  }

  /**
   * Método que inicia la acción de ir al anterior contenido
   */
  public irAnterior() {
    if (this.temaAnterior) {
      this.router.navigate(["/tema/", this.temaAnterior.id]);
    }
  }

  // Vuelca el contenido HTML según la id de un tema recibido
  private cargarContenidoDelTema(id: string) {
    // Vamos a cargar contenido, por lo que iniciamos la animación de carga...
    this.cargandoContenido = true;
    this.hayError = false;

    // Si el tema no existe, no está disponible o está en construcción, no se descarga su .md:
    // se muestra la pantalla fija que corresponda (ver contenido.html)
    this.estadoTema = this.temarioService.getEstadoTema(id);
    if (this.estadoTema !== 'normal') {
      this.contenidoHTML = "";
      this.vaciarIndice();
      this.hayError = this.estadoTema === 'noExiste';
      this.cargandoContenido = false;
      return;
    }

    // Obtenemos el nombre del archivo md que tenemos que cargar
    const archivoMd = this.temarioService.getTemaById(id)?.archivoMd;

    // Si no se pudo obtener un nombre de archivo.md válido, nos vamos de la función,
    // y no intentamos convertir nada a json. Esto solo pasa si ponen manualmente una url no válida
    if (!archivoMd) {
      this.hayError = true;
      this.cargandoContenido = false;
      //
      return;
    }
    const urlCompleta = `assets/temario/${archivoMd}`;
    console.log("Mostrando el archivo", urlCompleta);

    // Convertimos el md a HTML
    this.markdownService.convertirMarkdownHTML(urlCompleta)
      .then(html => {
        // Guarda el html convertido en el atributo this.contenidoHTML
        // En el html, usamos la propiedad innerHTML del elemento contenedor para rellenar el contenido.
        // Pero primero sanitizamos el html resultante de forma segura (para que no nos quite etiquetas style)
        this.contenidoHTML = this.sanitizer.bypassSecurityTrustHtml(html);
        this.hayError = false;
        this.cargandoContenido = false;

        // Aunque creas que no hace falta, setTimeout(..., 0) es el paso que garantiza que tu código de manipulación del DOM se ejecute después de que el navegador haya tenido la oportunidad de renderizarlo.
        setTimeout(() => {
          this.mejorarBloquesDeCodigo(); // Mejora los bloques de código del HTML generado original
          this.construirIndice(); // Construye el índice lateral a partir del [TOC] del tema
          this.transformarImagenesPreview();
          this.restaurarScrollTrasRecarga(id); // Si venimos de recargar la página, vuelve a donde se estaba
        }, 0);

      })
      .catch(error => {
        // Si hay algún error, mostramos info detallada por consola, un toast y el hayError a true, para que no se muestre la barra de progreso
        console.error("Error al parsear el archivo md a html", error);
        this.hayError = true;
        this.cargandoContenido = false;
        this.messageService.add(
          {
            sticky: true,
            severity: "error",
            summary: "Error",
            detail: "No se pudo convertir el contenido a HTML. Probablemente haya un error en el archivo temario.json. \n\nMás info en consola.",
          }
        );
      }
      );
  }

  /** Justo antes de recargar la página, guardamos el tema actual y la posición del scroll */
  @HostListener('window:pagehide')
  guardarScroll(): void {
    if (!this.temaActual) return;
    try {
      sessionStorage.setItem(CLAVE_SCROLL, JSON.stringify({ id: this.temaActual.id, y: window.scrollY }));
    } catch { /* si el navegador no deja usar sessionStorage, no pasa nada */ }
  }

  /** Si la página viene de una recarga y es el mismo tema, vuelve a la posición guardada */
  private restaurarScrollTrasRecarga(id: string): void {
    if (this.scrollRestaurado) return;
    this.scrollRestaurado = true;

    let guardado: { id: string; y: number } | null = null;
    try {
      guardado = JSON.parse(sessionStorage.getItem(CLAVE_SCROLL) ?? 'null');
      sessionStorage.removeItem(CLAVE_SCROLL);
    } catch { return; }

    const navegacion = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!guardado || guardado.id !== id || navegacion?.type !== 'reload') return;

    // Esperamos a que carguen las imágenes (si no, la página aún es más corta), como mucho 3 segundos,
    // y a que se pinte el siguiente fotograma (las cabeceras de los bloques de código se pintan después)
    const imagenes: HTMLImageElement[] = Array.from(this.elementRef.nativeElement.querySelectorAll('.markdown-body img'));
    const cargadas = imagenes.map(img => img.complete ? Promise.resolve() : new Promise(fin => {
      img.addEventListener('load', fin, { once: true });
      img.addEventListener('error', fin, { once: true });
    }));
    const limite = new Promise(fin => setTimeout(fin, 3000));
    const y = guardado.y;
    Promise.race([Promise.all(cargadas), limite])
      .then(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' })));
  }

  /**
   * Función que crea un div que envuelve a los bloques de código y le añade el componente code-header 
   * (una cabecera con una etiqueta con el nombre del lenguaje y un botón para copiar al portapapeles.
   */
  private mejorarBloquesDeCodigo(): void {
    const preElements: NodeListOf<HTMLElement> = this.elementRef.nativeElement.querySelectorAll('.markdown-body pre');

    preElements.forEach(pre => {
      const code = pre.querySelector('code');
      if (!code || pre.parentElement?.classList.contains('code-block-wrapper')) {
        return;
      }

      const componentRef = this.viewContainerRef.createComponent(CodeHeader);
      const languageClass = Array.from(code.classList).find(c => c.startsWith('language-'));
      componentRef.instance.lenguaje = languageClass ? languageClass.replace('language-', '') : 'shell';
      componentRef.instance.codeToCopy = code.innerText;

      const wrapper = this.renderer.createElement('div');
      this.renderer.addClass(wrapper, 'code-block-wrapper');

      const headerHost = this.renderer.createElement('div');
      this.renderer.addClass(headerHost, 'code-block-header'); // Añadimos la clase aquí
      this.renderer.appendChild(headerHost, componentRef.location.nativeElement);

      this.renderer.insertBefore(pre.parentNode, wrapper, pre);
      this.renderer.appendChild(wrapper, headerHost);
      this.renderer.appendChild(wrapper, pre);
    });
  }


  // ─── Índice lateral ────────────────────────────────────────────────────────

  /**
   * Construye el índice lateral a partir del TOC que markdown-it pone en el tema (solo si el .md tiene [TOC]).
   * Cada enlace del TOC es una entrada: su texto, el id del título al que apunta y su nivel (por anidación).
   * El TOC original sigue en el contenido, pero oculto (ver contenido-md.css).
   */
  private construirIndice(): void {
    this.vaciarIndice();
    const toc: HTMLElement | null = this.elementRef.nativeElement.querySelector('.markdown-body .table-of-contents');
    if (!toc) return; // El .md no tiene [TOC]: al pulsar la brújula saldrá el aviso "Sin índice"

    toc.querySelectorAll('a').forEach(enlace => {
      const href = enlace.getAttribute('href') ?? '';
      const id = href.substring(href.lastIndexOf('#') + 1); // Puede estar codificado (%C3%A9…): así está también en el título
      const titulo = id ? document.getElementById(id) : null;
      if (!titulo) return;

      // Nivel = cuántas listas (<ul>) hay entre el enlace y el TOC (1 = principal)
      let nivel = 0;
      for (let el: HTMLElement | null = enlace; el && el !== toc; el = el.parentElement) {
        if (el.tagName === 'UL') nivel++;
      }
      this.entradasIndice.push({ id, texto: enlace.textContent?.trim() ?? '', nivel: Math.max(nivel, 1) });
      this.titulosIndice.push(titulo);
    });
    this.actualizarApartadoActivo();
  }

  /** Deja el índice vacío (al cambiar de tema o si el tema no tiene contenido) */
  private vaciarIndice(): void {
    this.entradasIndice = [];
    this.titulosIndice = [];
    this.idActivo = null;
    this.filtroIndice = '';
    this.seleccionIndice = 0;
  }

  /** Entradas que coinciden con el buscador (sin distinguir tildes ni mayúsculas) */
  public get entradasFiltradas(): EntradaIndice[] {
    const filtro = normalizar(this.filtroIndice.trim());
    if (!filtro) return this.entradasIndice;
    return this.entradasIndice.filter(entrada => normalizar(entrada.texto).includes(filtro));
  }

  /** Texto de una entrada con la parte buscada resaltada (<mark>), ya escapado para usarlo en innerHTML */
  public resaltar(texto: string): string {
    const filtro = normalizar(this.filtroIndice.trim());
    const posicion = filtro ? normalizar(texto).indexOf(filtro) : -1;
    if (posicion === -1) return escaparHtml(texto);
    return escaparHtml(texto.slice(0, posicion))
      + '<mark>' + escaparHtml(texto.slice(posicion, posicion + filtro.length)) + '</mark>'
      + escaparHtml(texto.slice(posicion + filtro.length));
  }

  /**
   * Al abrir el panel del índice: buscador vacío, la lista situada en el apartado que se está leyendo
   * y el cursor en el buscador solo si se abrió con Ctrl+I
   */
  public alAbrirIndice(): void {
    this.filtroIndice = '';
    this.seleccionIndice = 0;
    setTimeout(() => {
      if (this.focoEnBuscador) {
        document.querySelector<HTMLInputElement>('.drawer-indice .indice-buscador input')?.focus();
      }
      document.querySelector('.drawer-indice .indice-enlace.activo')?.scrollIntoView({ block: 'center' });
    });
  }

  /** El índice fijo a la izquierda se ve: está activado, la pantalla es ancha y el tema tiene [TOC] */
  public get indiceFijoVisible(): boolean {
    return this.preferencias.indiceFijado && this.pantallaAncha && this.entradasIndice.length > 0;
  }

  /** Fija el índice a la izquierda (true) o lo oculta (false). Es una preferencia (ver PreferenciasService) */
  public fijarIndice(fijar: boolean): void {
    this.preferencias.indiceFijado = fijar;
    if (fijar) this.mostrarDrawer = false;
  }

  /** En el índice fijo, mueve su lista (no la página) para que el apartado activo quede a la vista */
  private situarIndiceFijo(): void {
    const lista = document.querySelector<HTMLElement>('.indice-fijo .indice-lista');
    const activo = lista?.querySelector<HTMLElement>('.indice-enlace.activo');
    if (lista && activo) this.mostrarEnLista(lista, activo);
  }

  /** Salta al apartado elegido y cierra el índice */
  public irAEntrada(evento: Event, entrada: EntradaIndice): void {
    evento.preventDefault(); // El enlace tiene href solo para que se vea la URL al pasar el ratón
    document.getElementById(entrada.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.mostrarDrawer = false;
  }

  /** Intro en el buscador: salta al resultado elegido con ↑ ↓ (si no se ha movido, al primero) */
  public irAlSeleccionado(evento: Event): void {
    const entrada = this.entradasFiltradas[this.seleccionIndice] ?? this.entradasFiltradas[0];
    if (entrada) this.irAEntrada(evento, entrada);
  }

  /** ↑ ↓ en el buscador: mueve la selección por los resultados (da la vuelta al llegar al final) */
  public moverSeleccion(evento: Event, paso: number): void {
    evento.preventDefault(); // que el cursor no se mueva dentro del texto
    const total = this.entradasFiltradas.length;
    if (total === 0) return;
    this.seleccionIndice = (this.seleccionIndice + paso + total) % total;
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.indice-lista').forEach(lista => {
        const elegido = lista.querySelector<HTMLElement>('.indice-enlace.seleccionado');
        if (elegido) this.mostrarEnLista(lista, elegido);
      });
    });
  }

  /** Desplaza una lista del índice (no la página) para que se vea ese apartado */
  private mostrarEnLista(lista: HTMLElement, elemento: HTMLElement): void {
    const arriba = elemento.offsetTop - lista.offsetTop, abajo = arriba + elemento.offsetHeight;
    if (arriba < lista.scrollTop || abajo > lista.scrollTop + lista.clientHeight) {
      lista.scrollTop = arriba - lista.clientHeight / 2;
    }
  }

  /** URL de un apartado (para el href de los enlaces del índice) */
  public urlApartado(id: string): string {
    return window.location.pathname + '#' + id;
  }

  /** "Estás aquí": al hacer scroll, marca el último título que ya ha pasado por la parte de arriba */
  @HostListener('window:scroll')
  alHacerScroll(): void {
    if (this.titulosIndice.length === 0) return;
    cancelAnimationFrame(this.fotogramaScroll);
    this.fotogramaScroll = requestAnimationFrame(() => this.actualizarApartadoActivo());
  }

  private actualizarApartadoActivo(): void {
    const margen = 120; // la barra de navegación fija tapa la parte de arriba
    let activo: string | null = this.entradasIndice[0]?.id ?? null;
    this.titulosIndice.forEach((titulo, i) => {
      if (titulo.getBoundingClientRect().top <= margen) activo = this.entradasIndice[i].id;
    });
    if (activo !== this.idActivo) {
      this.idActivo = activo;
      if (this.indiceFijoVisible) setTimeout(() => this.situarIndiceFijo()); // tras pintar la nueva marca
    }
  }

  /**
   * Busca imágenes marcadas y las reemplaza por p-image con preview
   */
  private transformarImagenesPreview(): void {
    // Buscamos todas las imágenes que tengan la clase img-preview
    const imagesToTransform: NodeListOf<HTMLImageElement> =
      this.elementRef.nativeElement.querySelectorAll('img.img-preview');

    // Sustituimos todos los img.img-preview por p-image.
    imagesToTransform.forEach(imgElement => {
      // Crea una instancia del componente p-image
      const componentRef = this.viewContainerRef.createComponent(Image);

      // Pasa las propiedades del <img> original al nuevo componente
      componentRef.instance.src = imgElement.src;
      componentRef.instance.alt = imgElement.alt;
      componentRef.instance.preview = true;

      // Reemplaza el <img> del DOM por el nuevo componente <p-image>
      imgElement.parentNode?.replaceChild(componentRef.location.nativeElement, imgElement);
    });
  }

  /**
   * Método que captura los eventos de teclado al pulsar teclas. Si coincide las teclas pulsadas con nuestra combinación, lanzamos la función que queramos
   * @param evento Evento de teclado que recibe la función
   */
  /** El foco está en un campo de texto (input, textarea, select o contenido editable) */
  private escribiendoEnCampo(evento: KeyboardEvent): boolean {
    const elemento = evento.target as HTMLElement | null;
    return !!elemento && (['INPUT', 'TEXTAREA', 'SELECT'].includes(elemento.tagName) || elemento.isContentEditable);
  }

  /** Hay abierto el índice lateral, un diálogo (p. ej. la configuración o una imagen ampliada) o un desplegable */
  private hayVentanaAbierta(): boolean {
    return this.mostrarDrawer || !!document.querySelector('[role="dialog"], .p-select-overlay, .p-overlay');
  }

  @HostListener("window:keydown", ["$event"])
  capturarEventoTeclado(evento: KeyboardEvent) {
    // Control + i
    if (evento.ctrlKey && evento.key.toLocaleLowerCase() === 'i') {
      evento.preventDefault();
      this.abrirDrawer(true); // desde el teclado: con el cursor en el buscador
    }

    // Flechas ← y → (sin teclas modificadoras): tema anterior y siguiente.
    // No actúan si se está escribiendo en un campo (p. ej. un buscador) ni con Alt (atrás/adelante del navegador)
    if (!evento.ctrlKey && !evento.altKey && !evento.metaKey && !evento.shiftKey
        && !this.escribiendoEnCampo(evento) && !this.hayVentanaAbierta()) {
      if (evento.key === 'ArrowLeft' && this.temaAnterior) {
        evento.preventDefault();
        this.irAnterior();
      } else if (evento.key === 'ArrowRight' && this.temaSiguiente) {
        evento.preventDefault();
        this.irSiguiente();
      }
    }

    // Puedes crear más eventos de teclado

  }


  ngOnDestroy(): void {
    // Limpiamos la suscripción para evitar fugas de memoria
    if (this.routeSuscripcion) {
      this.routeSuscripcion.unsubscribe();
    }
    this.consultaAncho?.removeEventListener('change', this.alCambiarAncho);
  }

}
