import { Injectable } from '@angular/core';
import { Tema, Temario } from '../models/temario.model';
import { TEMARIO } from '../shared/constantes';
import { MenuItem } from 'primeng/api';

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

  /**
   * Devuelve los temas listos para un menú de PrimeNG.
   * Si mostrarBloquesEnMenu es true devuelve la estructura con bloques,
   * si no la devuelve todos los temas en plano.
   */
  public getTemasAsMenuItems(): MenuItem[] {

    // 1. Comprueba si queremos mostrar los bloques en el menú o no (si no existe el atributo, el valor por defecto será true y mostraremos los bloques)
    if (TEMARIO.mostrarBloquesEnMenu ?? true) {

      // --- Lógica para el menú AGRUPADO ---
      return TEMARIO.bloques
        .sort((a, b) => a.orden - b.orden)
        .map(bloque => ({
          label: bloque.titulo,
          icon: bloque.icon,
          disabled: !bloque.habilitado,
          items: bloque.temas
            .sort((a, b) => a.orden - b.orden)
            .map(tema => ({
              label: tema.titulo,
              icon: tema.icon,
              routerLink: `/tema/${tema.id}`,
              disabled: !tema.habilitado
            }))
        }));

    } else {

      // --- Lógica para el menú PLANO ---
      // Primero ordenamos los bloques, y luego aplanamos.
      return TEMARIO.bloques
        .sort((bloqueA, bloqueB) => bloqueA.orden - bloqueB.orden) // 1. Ordena los bloques primero
        .flatMap(bloque => bloque.temas)                           // 2. AHORA aplana. Los temas de cada bloque se añadirán en orden.
        .map(tema => ({
          label: tema.titulo,
          icon: tema.icon,
          routerLink: `/tema/${tema.id}`,
          disabled: !tema.habilitado
        }));
    }
  }


  // getTemasAsMenuItems(): MenuItem[] {
  //   return TEMARIO.bloques
  //     .sort((a, b) => a.orden - b.orden) // Ordena los bloques
  //     .map(bloque => ({
  //       label: bloque.titulo, // El título del bloque es el elemento principal del menú
  //       icon: bloque.icon,
  //       disabled: !bloque.habilitado, // Deshabilita el bloque entero si está marcado
  //       items: bloque.temas // Los temas del bloque son los sub-items
  //         .sort((a, b) => a.orden - b.orden) // Ordena los temas dentro del bloque
  //         .map(tema => ({
  //           label: tema.titulo,
  //           icon: tema.icon,
  //           routerLink: `/tema/${tema.id}`,
  //           disabled: !tema.habilitado // Deshabilita el tema si está marcado
  //         }))
  //     }));
  // }


}