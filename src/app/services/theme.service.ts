import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Import de la configuración
import { Theme } from '../models/config.model';
import { ConfigService } from './config.service';


@Injectable({ providedIn: 'root' })
export class ThemeService {
  private activeTheme$: BehaviorSubject<Theme>;
  public currentTheme$ : Observable<Theme>;


  constructor(private configService: ConfigService) {
    // Obtenemos el tema por defecto del config.json. Si no existe o el curso no lo ofrece,
    // usamos el primero de los temas disponibles
    const defaultId = this.configService.getFullConfig().defaultThemeId;
    let defaultTheme = this.getThemeById(defaultId);
    if (!defaultTheme) {
      defaultTheme = this.getAvailableThemes()[0];
      console.warn(`config.json > defaultThemeId: "${defaultId}" no está entre los temas disponibles. Se usa "${defaultTheme.id}"`);
    }

    // Inicializamos los observables del tema actual y el tema activo
    this.activeTheme$ = new BehaviorSubject<Theme>(defaultTheme);
    this.currentTheme$ = this.activeTheme$.asObservable();

    // Aplica el tema inicial al arrancar
    this.setTheme(defaultTheme.id);

  }


  /** Devuelve la lista de todos los temas disponibles, usando el servicio */
  getAvailableThemes(): Theme[] {
    return this.configService.getThemes();
  }

  /** Devuelve un tema específico por su ID */
  private getThemeById(id: string): Theme | undefined {
    return this.configService.getThemes().find(t => t.id === id);
  }

  /** Establece el tema activo para toda la aplicación */
  public setTheme(id: string): void {
    const theme = this.getThemeById(id);
    // Si existe ese tema lo aplicamos, si no mostramos un error por consola para poder depurar
    if (theme) {
      this.activeTheme$.next(theme);

      // 1. Aplica el modo global (clase y atributo en <html>)
      const isDark = theme.baseMode === 'dark';
      document.documentElement.classList.toggle('dark-mode', isDark);
      document.documentElement.setAttribute('data-theme', theme.baseMode);

      // 2. Carga dinámicamente las hojas de estilo
      this.loadStylesheet('markdown-theme', `/assets/themes/markdown/${theme.markdownThemeFile}`);
      this.loadStylesheet('highlight-theme', `/assets/themes/highlight/${theme.highlightThemeFile}`);

    } else {
      console.error("No se ha podido cargar el theme con id:", id);
    }
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