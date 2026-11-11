import { Injectable } from '@angular/core';
import { Caducidad, Config, Data, EnlacesExternos, Theme } from '../models/config.model';
import { CONFIG } from '../shared/constantes';
import { CATALOGO_TEMAS } from '../shared/temas';

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
   * Devuelve los temas que ofrece este curso: los del catálogo de la app (temas.ts)
   * filtrados y ordenados según "temasDisponibles" del config.json.
   * Si el curso no indica "temasDisponibles", devuelve el catálogo completo.
   * @returns Un array de Themes
   */
  getThemes(): Theme[] {
    const ids = CONFIG.temasDisponibles;
    if (!ids || ids.length === 0) {
      return CATALOGO_TEMAS;
    }

    const temas: Theme[] = [];
    for (const id of ids) {
      const tema = CATALOGO_TEMAS.find(t => t.id === id);
      if (tema) {
        temas.push(tema);
      } else {
        console.warn(`config.json > temasDisponibles: el tema "${id}" no existe en el catálogo (temas.ts)`);
      }
    }

    // Si ningún id era válido, mejor ofrecer todos que dejar la app sin temas
    return temas.length > 0 ? temas : CATALOGO_TEMAS;
  }

  /**
   * Devuelve el nombre del curso (config.json > nombreCurso), o una cadena vacía si no hay
   */
  getNombreCurso(): string {
    return CONFIG.nombreCurso?.trim() ?? '';
  }

  /**
   * Devuelve el objeto EnlacesExternos. Contiene un array con los enlaces
   * externos que se usarán en el curso. 
   * @returns El objeto EnlacesExternos
   */
  getEnlacesExternos(): EnlacesExternos {
    return CONFIG.enlacesExternos;
  }

  /**
   * Retorna la caducidad del curso, que incluye fecha, días de aviso, y mensajes
   * @returns El objeto Caducidad
   */
  getCaducidad(): Caducidad {
    return CONFIG.caducidad;
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
