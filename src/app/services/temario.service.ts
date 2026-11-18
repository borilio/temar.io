import { Injectable } from '@angular/core';
import { Bloque, Tema, Temario } from '../models/temario.model';
import { TEMARIO } from '../shared/constantes';
import { MenuItem } from 'primeng/api';

/**
 * Estado de un tema al abrirlo:
 * - normal: se muestra su .md
 * - construccion: se muestra la pantalla fija de "en construcción" (el tema o su bloque tienen enConstruccion)
 * - noDisponible: se muestra el aviso de "no disponible" (el tema o su bloque no están habilitados)
 * - noExiste: el id no corresponde a ningún tema
 */
export type EstadoTema = 'normal' | 'construccion' | 'noDisponible' | 'noExiste';

@Injectable({ providedIn: 'root' })
export class TemarioService {
  constructor() { }

  /** Devuelve el objeto completo del temario de forma síncrona */
  getFullTemario(): Temario {
    return TEMARIO;
  }

  /**
   * Busca un tema por su ID a través de todos los bloques.
   */
  getTemaById(id: string): Tema | undefined {
    // 1. Aplanamos todos los temas de todos los bloques en un solo array
    const todosLosTemas = TEMARIO.bloques.flatMap(bloque => bloque.temas);

    // 2. Buscamos en el array aplanado
    return todosLosTemas.find(tema => tema.id === id);
  }

  /** Devuelve el bloque que contiene el tema con esa ID */
  private getBloqueDeTema(id: string): Bloque | undefined {
    return TEMARIO.bloques.find(bloque => bloque.temas.some(tema => tema.id === id));
  }

  /** Estado del tema al abrirlo (ver EstadoTema). Tiene en cuenta también su bloque. */
  getEstadoTema(id: string): EstadoTema {
    const bloque = this.getBloqueDeTema(id);
    const tema = bloque?.temas.find(t => t.id === id);
    if (!bloque || !tema) return 'noExiste';
    if (!this.estaHabilitado(bloque, tema)) return 'noDisponible';
    if (this.estaEnConstruccion(bloque, tema)) return 'construccion';
    return 'normal';
  }

  /** El tema y su bloque están habilitados (si falta "habilitado", cuenta como deshabilitado) */
  estaHabilitado(bloque: Bloque, tema: Tema): boolean {
    return !!bloque.habilitado && !!tema.habilitado;
  }

  /** El tema o su bloque están en construcción */
  estaEnConstruccion(bloque: Bloque, tema: Tema): boolean {
    return !!bloque.enConstruccion || !!tema.enConstruccion;
  }

  /** El bloque (y el tema, si se indica) se muestran en el índice y en el menú (si falta "visible", sí) */
  private esVisible(bloque: Bloque, tema?: Tema): boolean {
    return (bloque.visible ?? true) && (tema?.visible ?? true);
  }

  /**
   * Bloques y temas tal como se muestran en el índice: ordenados por "orden" y sin los ocultos.
   * Devuelve copias (no modifica el temario original).
   */
  getBloquesVisibles(): Bloque[] {
    return [...TEMARIO.bloques]
      .sort((a, b) => a.orden - b.orden)
      .filter(bloque => this.esVisible(bloque))
      .map(bloque => ({
        ...bloque,
        temas: [...bloque.temas]
          .sort((a, b) => a.orden - b.orden)
          .filter(tema => this.esVisible(bloque, tema))
      }));
  }

  /** Texto del tema en el menú (con 🚧 si está en construcción) */
  private etiquetaMenu(bloque: Bloque, tema: Tema): string {
    return this.estaEnConstruccion(bloque, tema) ? `${tema.titulo} 🚧` : tema.titulo;
  }

  /** Convierte un tema en un elemento del menú de PrimeNG */
  private temaComoMenuItem(bloque: Bloque, tema: Tema): MenuItem {
    return {
      label: this.etiquetaMenu(bloque, tema),
      icon: tema.icon,
      routerLink: `/tema/${tema.id}`,
      disabled: !this.estaHabilitado(bloque, tema)
    };
  }

  /**
   * Devuelve los temas listos para un menú de PrimeNG (sin los ocultos).
   * Si mostrarBloquesEnMenu es true devuelve la estructura con bloques,
   * si no la devuelve todos los temas en plano.
   */
  public getTemasAsMenuItems(): MenuItem[] {
    const bloques = this.getBloquesVisibles();

    // 1. Comprueba si queremos mostrar los bloques en el menú o no (si no existe el atributo, el valor por defecto será true y mostraremos los bloques)
    if (TEMARIO.mostrarBloquesEnMenu ?? true) {

      // --- Lógica para el menú AGRUPADO ---
      return bloques.map(bloque => ({
        label: bloque.enConstruccion ? `${bloque.titulo} 🚧` : bloque.titulo,
        icon: bloque.icon,
        disabled: !bloque.habilitado,
        items: bloque.temas.map(tema => this.temaComoMenuItem(bloque, tema))
      }));

    } else {

      // --- Lógica para el menú PLANO PERO CON SEPARADORES ---
      return bloques.reduce((acumulador, bloque, indice) => {
        // 1. Añade los temas del bloque
        acumulador.push(...bloque.temas.map(tema => this.temaComoMenuItem(bloque, tema)));

        // 2. Si NO es el último bloque, añade un separador
        if (indice < bloques.length - 1) {
          acumulador.push({ separator: true });
        }
        return acumulador;
      }, [] as MenuItem[]);

    }
  }

  /**
   * Todos los temas en orden (bloques y temas por "orden"), indicando si se puede llegar a ellos
   * con anterior/siguiente: sí los normales y los que están en construcción; no los deshabilitados ni los ocultos.
   */
  private getTemasEnOrden(): { tema: Tema; navegable: boolean }[] {
    return [...TEMARIO.bloques]
      .sort((a, b) => a.orden - b.orden)
      .flatMap(bloque => [...bloque.temas]
        .sort((a, b) => a.orden - b.orden)
        .map(tema => ({ tema, navegable: this.estaHabilitado(bloque, tema) && this.esVisible(bloque, tema) })));
  }

  /**
   * Obtiene el siguiente tema disponible (salta los deshabilitados y los ocultos).
   * Devuelve null si no hay tema siguiente.
   */
  public getTemaSiguiente(id: string): Tema | null {
    const temas = this.getTemasEnOrden();
    const indiceActual = temas.findIndex(t => t.tema.id === id);
    if (indiceActual === -1) return null; // No existe el tema actual

    return temas.slice(indiceActual + 1).find(t => t.navegable)?.tema ?? null;
  }

  /**
   * Obtiene el tema anterior disponible (salta los deshabilitados y los ocultos).
   * Devuelve null si no hay tema anterior.
   */
  public getTemaAnterior(id: string): Tema | null {
    const temas = this.getTemasEnOrden();
    const indiceActual = temas.findIndex(t => t.tema.id === id);
    if (indiceActual <= 0) return null; // No existe el tema actual o es el primero

    return temas.slice(0, indiceActual).reverse().find(t => t.navegable)?.tema ?? null;
  }

}
