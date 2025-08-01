import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CodeHeader } from '../code-header/code-header'; // Componente code-header (cabecera para los bloques de código)
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MarkdownService } from '../../services/markdown.service';
import { MessageService } from 'primeng/api';

// Importamos DomSanitizer para evitar que Angular elimine los estilos
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TemarioService } from '../../services/temario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contenido',
  imports: [PRIMENG_IMPORTS],
  providers: [MessageService],
  templateUrl: './contenido.html',
  styleUrls: [
    './contenido.css',     // estilos del componente
    './contenido-md.css'   // estilos sobrescritos para el markdown
  ],
  encapsulation: ViewEncapsulation.None //Es para aplicar los estilos de forma "global", no me gusta, pero parece que no había otra forma
})
export class Contenido implements OnInit {
  public contenidoHTML: SafeHtml;
  public cargandoContenido: boolean;
  public hayError: boolean;
  public fraseCargando: string = "Cargando contenidos..."; //TODO hacer que salgan frases aleatorias
  private routeSuscripcion!: Subscription; // Para estar al corriente de los cambios que se hacen de url
  public mostrarBotonHaciaArriba: boolean;
  private scrollTimeout: any; // Para guardar la referencia del temporizador para mostrar el botón de arriba o no

  constructor(
    private markdownService: MarkdownService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
    private cd: ChangeDetectorRef, // Para el temporizador del botón scrollArriba
    // Para la navegación dinámica...
    private temarioService: TemarioService,
    private route: ActivatedRoute,
    private router: Router,

  ) {
    this.contenidoHTML = "";
    this.cargandoContenido = true;
    this.hayError = false;
    this.mostrarBotonHaciaArriba = false;
  }

  ngOnInit(): void {
    // Nos suscribimos a los cambios de URL
    this.routeSuscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Cargamos el contenido md de la id del tema que tenemos en la url
        this.cargarContenidoDelTema(id);
      }
    });
  }

  // Está al loro de cuando se hace scroll
  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Si estamos arriba del todo, el botón siempre está oculto.
    if (window.scrollY < 400) {
      this.mostrarBotonHaciaArriba = false;
      this.cd.detectChanges();
      return;
    }

    // 1. Muestra el botón y reinicia cualquier cuenta atrás anterior
    this.mostrarBotonHaciaArriba = true;
    clearTimeout(this.scrollTimeout);
    this.cd.detectChanges();

    // 2. Inicia una nueva cuenta atrás para ocultar el botón
    this.scrollTimeout = setTimeout(() => {
      this.mostrarBotonHaciaArriba = false;
      this.cd.detectChanges(); // Notifica a Angular que lo oculte
    }, 1500); // 1500ms = 1.5 segundos
  }
  
  // Movemos hasta arriba, suavesssito
  scrollHaciaArriba(): void {
    window.scrollTo({top:0, behavior: 'smooth'});
  }

  // Vuelca el contenido HTML según la id de un tema recibido
  private cargarContenidoDelTema(id: string) {
    // Vamos a cargar contenido, por lo que iniciamos la animación de carga...
    this.cargandoContenido = true;
    this.hayError = false;

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
          this.mejorarBloquesDeCodigo();
          this.gestionarEnlacesDelIndice();
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



  // Función que corrige todos los enlaces del TOC (haciendo magia)  
  private gestionarEnlacesDelIndice(): void {
    const enlacesDelIndice: NodeListOf<HTMLAnchorElement> =
      this.elementRef.nativeElement.querySelectorAll('.markdown-body .table-of-contents a');

    enlacesDelIndice.forEach(enlace => {
      this.renderer.listen(enlace, 'click', (event) => {
        event.preventDefault(); // Evitamos que el router navegue

        const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (!href) return;

        // Quitamos el '#' para obtener el ID limpio (aunque esté codificado)
        const idDelElemento = href.substring(1);

        // getElementById es el método más fiable para buscar, incluso con IDs codificados
        const elementoDestino = document.getElementById(idDelElemento);

        if (elementoDestino) {
          elementoDestino.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Este error ahora será muy útil para depurar si algo sigue fallando
          console.error(`Error definitivo: No se pudo encontrar el elemento con id: '${idDelElemento}'`);
        }
      });
    });
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción para evitar fugas de memoria
    if (this.routeSuscripcion) {
      this.routeSuscripcion.unsubscribe();
    }
  }

}
