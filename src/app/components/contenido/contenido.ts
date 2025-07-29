import { Component, ElementRef, OnInit, Renderer2, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CodeHeader } from '../code-header/code-header'; // Componente code-header (cabecera para los bloques de código)
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MarkdownService } from '../../services/markdown.service';
import { MessageService } from 'primeng/api';

// Importamos DomSanitizer para evitar que Angular elimine los estilos
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(
    private markdownService: MarkdownService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
  ) {
    this.contenidoHTML = "";
    this.cargandoContenido = true;
    this.hayError = false;
  }

  ngOnInit(): void {

    // Volcamos el contenido html 
    this.markdownService.convertirMarkdownHTML("assets/md/demo.md")
      .then(html => {
        // Guarda el html convertido en el atributo this.contenidoHTML
        // En el html, usamos la propiedad innerHTML del elemento contenedor para rellenar el contenido.
        // Pero primero sanitizamos el html resultante de forma segura (para que no nos quite etiquetas style)
        this.contenidoHTML = this.sanitizer.bypassSecurityTrustHtml(html);
        this.hayError = false;
        this.cargandoContenido = false;

        // Aunque creas que no hace falta, setTimeout(..., 0) es el paso que garantiza que tu código de manipulación del DOM se ejecute después de que el navegador haya tenido la oportunidad de renderizarlo.
        setTimeout(() => { this.mejorarBloquesDeCodigo(); }, 0);

      })
      .catch(error => {
        // Si hay algún error, mostramos info detallada por consola, un toast y el hayError a true, para que no se muestre la barra de progreso
        console.error("Error al parsear el archivo md a html", error);
        this.hayError = true;
        this.cargandoContenido = false;
        this.messageService.add(
          {
            severity: "error",
            summary: "Error",
            detail: "No se pudo obtener el contenido HTML. Más info en consola.",
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

}
