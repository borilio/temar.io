import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Import de la configuración
import { CONFIG } from '../shared/constantes';
import { Theme } from '../models/config.model';


@Injectable({ providedIn: 'root' })
export class ThemeService {
  private activeTheme$ = new BehaviorSubject<Theme>(
    this.getThemeById(CONFIG.defaultThemeId) // Carga el tema por defecto
  );
  public currentTheme$ = this.activeTheme$.asObservable();

  constructor() {
    this.setTheme(CONFIG.defaultThemeId); // Aplica el tema inicial al arrancar
  }

  /** Devuelve la lista de todos los temas disponibles */
  getAvailableThemes(): Theme[] {
    return CONFIG.themes;
  }
  
  /** Devuelve un tema específico por su ID */
  private getThemeById(id: string): Theme {
    return CONFIG.themes.find(t => t.id === id) || CONFIG.themes[0];
  }

  /** Establece el tema activo para toda la aplicación */
  setTheme(id: string): void {
    const theme = this.getThemeById(id);
    this.activeTheme$.next(theme);

    // 1. Aplica el modo global (clase y atributo en <html>)
    const isDark = theme.baseMode === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', theme.baseMode);

    // 2. Carga dinámicamente las hojas de estilo
    this.loadStylesheet('markdown-theme',  `/assets/themes/markdown/${theme.markdownThemeFile}`);
    this.loadStylesheet('highlight-theme', `/assets/themes/highlight/${theme.highlightThemeFile}`);
  }

  /** Ayudante para inyectar o actualizar un <link> en el <head> */
  private loadStylesheet(id: string, href: string): void {
    let link = document.getElementById(id) as HTMLLinkElement;
    if (link) {
      // Si ya existe, solo actualiza la ruta
      link.href = href;
    } else {
      // Si no existe, lo crea y lo añade
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }
}