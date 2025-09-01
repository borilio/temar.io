import { Injectable } from '@angular/core';
import { Config, Data, Theme } from '../models/config.model';
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
   * Devuelve el objeto con las cosas para el footer y el copyright
   * @returns El objeto de tipo Data (contiene las imágenes y los enlaces)
   */
  getData(): Data {
    return CONFIG.data;
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
