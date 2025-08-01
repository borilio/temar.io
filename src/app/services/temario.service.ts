import { Injectable } from '@angular/core';
import { Tema, Temario } from '../models/temario.model';
import { TEMARIO } from '../shared/constantes';
import { MenuItem } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class TemarioService {
  constructor() {}

  /** Devuelve el objeto completo del temario de forma síncrona */
  getTemario(): Temario {
    return TEMARIO;
  }

  /** Devuelve un tema específico de forma síncrona */
  getTemaById(id: string): Tema | undefined {
    return TEMARIO.temas.find(tema => tema.id === id);
  }

  /**
   * Devuelve los temas listos y ordenados para un menú de PrimeNG
   */
  getTemasAsMenuItems(): MenuItem[] {
    return TEMARIO.temas
      .sort((a, b) => a.orden - b.orden) // Ordena por el campo 'orden'
      .map(tema => ({
        label: tema.titulo,
        icon: tema.icono,
        routerLink: `/tema/${tema.id}`
      }));
  }
  
}