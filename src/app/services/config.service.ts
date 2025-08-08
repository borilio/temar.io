import { Injectable } from '@angular/core';
import { Config, Footer, Theme } from '../models/config.model';
import { CONFIG } from '../shared/constantes';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
 

  constructor() { }

  /**
   * Devuelve el objeto de configuración completo
   * @returns El objeto de tipo Config completo
   */
  getFullConfig(): Config {
    return CONFIG;
  }

  /**
   * Devuelve el objeto con el footer
   * @returns El objeto de tipo Footer (contiene las imágenes y los enlaces)
   */
  getFooter(): Footer {
    return CONFIG.footer;
  }

  /**
   * Devuelve un array con los objetos Theme que hay disponibles
   * @returns Un array de Themes
   */
  getThemes(): Theme[] {
    return CONFIG.themes;
  }

  isDevMode(): boolean {
    return CONFIG.devMode;
  }


}
