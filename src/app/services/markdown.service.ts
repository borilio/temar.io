// src/app/services/markdown.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import MarkdownIt from 'markdown-it';

// Plugins correctos
import katex from 'markdown-it-katex';
import hljs from 'highlight.js';
import githubAlerts from 'markdown-it-github-alerts';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import tocDoneRight from 'markdown-it-toc-done-right';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private mdParser: MarkdownIt;
  private retardoActivo: boolean = true;

  constructor(private http: HttpClient) {
    // Creamos una función 'slugify' consistente para crear los enlaces ancla a las secciones del documento
    // Convierte espacios a guiones y luego codifica de forma segura CUALQUIER caracter restante.
    const slugify = (s: string) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));

    // Cargamos la configuración básica
    this.mdParser = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    // Usamos el plugin correcto para las alertas [!TIP]
    this.mdParser.use(githubAlerts);

    // Usamos el plugin de highlight.js 
    this.mdParser.use(markdownItHighlightjs, { hljs });

    // Usamos el plugin katex para las fórmulas
    this.mdParser.use(katex);

    // Usamos el plugin de anchor (hace que los enlaces internos de las cabeceras funcionen)
    this.mdParser.use(anchor, {
      slugify: slugify
    });

    // Usamos el generador de TOC (tabla de contenidos)
    this.mdParser.use(tocDoneRight, {
      slugify: slugify,
      listType: 'ul'
    });

    // Usamos el plugin que permite añadir atributos al markdown (usado para darle estilos a las imágenes)
    this.mdParser.use(attrs);
  }


  /**
   * Convierte un archivo Markdown (.md) a HTML usando markdown-it.
   * @param url Ruta relativa dentro de /assets/md/
   * @returns HTML renderizado como string
   */
  async convertirMarkdownHTML(url: string): Promise<string> {
    // Obtenemos el contenido markdown
    const markdown = await firstValueFrom(this.http.get(url, { responseType: "text" }));

    // Usamos una función para arreglar posibles errores en las rutas
    const markdownConRutasCorregidas = this.convertirSintaxisImagen(markdown);

    //Añadimos un retardo artificial a la consulta, para probar barras de progreso
    if (this.retardoActivo) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de espera
    }

    return this.mdParser.render(markdownConRutasCorregidas);

  }

  // Función que limpia la url de las imágenes en url válidas
  private convertirSintaxisImagen(markdown: string): string {
    // Expresión regular mejorada para capturar URLs con y sin título.
    const regex = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)"|)\)/g;

    return markdown.replace(
      regex,
      (match, altText, filePath, title) => {
        // 1. Reemplaza las barras invertidas por barras normales (en algunos casos en el temario los he visto)
        const normalizedPath = filePath.replace(/\\/g, '/');

        // 2. Codifica la URL (les añade %20 en los espacios y cosas parecidas)
        const encodedPath = encodeURI(normalizedPath);

        // 3. Vuelve a montar la cadena. Si hay título, lo incluye. por si hay este formato ![desc](url "title")
        const titlePart = title ? ` "${title}"` : '';

        return `![${altText}](${encodedPath}${titlePart})`;
      }
    );
  }

}
