import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Import de la configuración
import { Theme } from '../models/config.model';
import { ConfigService } from './config.service';
import { PreferenciasService } from './preferencias.service';


@Injectable({ providedIn: 'root' })
export class ThemeService {
  private activeTheme$: BehaviorSubject<Theme>;
  public currentTheme$ : Observable<Theme>;


  constructor(private configService: ConfigService, private preferencias: PreferenciasService) {
    // Tema inicial: el que eligió el usuario (si el curso guarda las preferencias y lo ofrece);
    // si no, el de por defecto del curso
    const temaElegido = this.getThemeById(this.preferencias.valor('tema') ?? '');
    const temaInicial = temaElegido ?? this.getDefaultTheme();

    // Inicializamos los observables del tema actual y el tema activo
    this.activeTheme$ = new BehaviorSubject<Theme>(temaInicial);
    this.currentTheme$ = this.activeTheme$.asObservable();

    // Aplica el tema inicial al arrancar
    this.aplicarTema(temaInicial);

  }

  /**
   * Tema por defecto del curso (config.json > defaultThemeId). Si no existe o el curso no lo ofrece,
   * el primero de los temas disponibles
   */
  public getDefaultTheme(): Theme {
    const defaultId = this.configService.getFullConfig().defaultThemeId ?? '';
    const defaultTheme = this.getThemeById(defaultId);
    if (defaultTheme) return defaultTheme;
    const primero = this.getAvailableThemes()[0];
    console.warn(`config.json > defaultThemeId: "${defaultId}" no está entre los temas disponibles. Se usa "${primero.id}"`);
    return primero;
  }


  /** Devuelve la lista de todos los temas disponibles, usando el servicio */
  getAvailableThemes(): Theme[] {
    return this.configService.getThemes();
  }

  /** Devuelve un tema específico por su ID */
  private getThemeById(id: string): Theme | undefined {
    return this.configService.getThemes().find(t => t.id === id);
  }

  /** Establece el tema activo para toda la aplicación (y lo recuerda como preferencia del usuario) */
  public setTheme(id: string): void {
    const theme = this.getThemeById(id);
    // Si existe ese tema lo aplicamos, si no mostramos un error por consola para poder depurar
    if (theme) {
      this.aplicarTema(theme);
      this.preferencias.cambiar('tema', theme.id);
    } else {
      console.error("No se ha podido cargar el theme con id:", id);
    }
  }

  /** Vuelve al tema por defecto del curso (al restaurar las opciones predeterminadas) */
  public restaurarTema(): void {
    this.aplicarTema(this.getDefaultTheme());
  }

  /** Aplica un tema a la página (sin tocar las preferencias) */
  private aplicarTema(theme: Theme): void {
    this.activeTheme$.next(theme);

    // 1. Aplica el modo global (clase y atributo en <html>)
    const isDark = theme.baseMode === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', theme.baseMode);

    // 2. Carga dinámicamente las hojas de estilo
    this.loadStylesheet('markdown-theme', `/assets/themes/markdown/${theme.markdownThemeFile}`);
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