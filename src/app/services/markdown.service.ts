// src/app/services/markdown.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import MarkdownIt from 'markdown-it';
import katex from 'markdown-it-katex';
import hljs from 'highlight.js';

// Plugins correctos
import githubAlerts from 'markdown-it-github-alerts';
import markdownItHighlightjs from 'markdown-it-highlightjs';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private mdParser: MarkdownIt;
  private retardoActivo: boolean = true;

  constructor(private http: HttpClient) {
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
  }


  /**
   * Convierte un archivo Markdown (.md) a HTML usando markdown-it.
   * @param url Ruta relativa dentro de /assets/md/
   * @returns HTML renderizado como string
   */
  async convertirMarkdownHTML(url: string): Promise<string> {
    const markdown = await firstValueFrom(this.http.get(url, { responseType: "text" }));

    //Añadimos un retardo artificial a la consulta, para probar barras de progreso
    if (this.retardoActivo) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de espera
    }

    return this.mdParser.render(markdown);

  }

}
