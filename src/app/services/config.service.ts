import { Injectable } from '@angular/core';
import { Config, Data, EnlacesExternos, Theme } from '../models/config.model';
import { CONFIG } from '../shared/constantes';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
 
  private _mostrarLigaduras: boolean = CONFIG.mostrarLigadurasFuentes;

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

  /**
   * Devuelve el objeto EnlacesExternos. Contiene un array con los enlaces
   * externos que se usarán en el curso. 
   * @returns El objeto EnlacesExternos
   */
  getEnlacesExternos(): EnlacesExternos {
    return CONFIG.enlacesExternos;
  }

  
  isDevMode(): boolean {
    return CONFIG.devMode;
  }

  // Retorna lo que valga su atributo (es mutable, puede cambiar, pero será temporal)
  get mostrarLigaduras(): boolean {
    return this._mostrarLigaduras;
  }

  // Establece un nuevo valor para mostrarLigaduras
  set mostrarLigaduras(valor: boolean) {
    this._mostrarLigaduras = valor;
  }



}
