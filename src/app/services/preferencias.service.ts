import { Injectable } from '@angular/core';
import { CONFIG } from '../shared/constantes';

/** Preferencias del usuario que se pueden cambiar en la ventana de configuración */
export interface Preferencias {
  tema?: string;          // id del tema visual
  ligaduras?: boolean;    // ligaduras de fuente en el código
  indiceFijado?: boolean; // índice fijo a la izquierda en pantallas anchas
}

// Clave en localStorage (solo se usa si el curso tiene guardarPreferencias: true)
const CLAVE_PREFERENCIAS = 'temario-preferencias';

/**
 * Preferencias del usuario (tema, ligaduras e índice fijo).
 * Solo se guardan en el navegador si el curso lo permite (config.json > guardarPreferencias: true).
 * Si no, duran mientras la página está abierta: al recargar, vuelven las de por defecto.
 * Por defecto no se guarda nada, pensando en las aulas con ordenadores compartidos.
 */
@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  /** El curso permite guardar las preferencias en el navegador */
  public readonly guardar: boolean = CONFIG.guardarPreferencias ?? false;

  /** Preferencias de esta sesión (si se guardan, empiezan con las guardadas) */
  private actuales: Preferencias = this.guardar ? this.leerGuardadas() : {};

  /** Valor de una preferencia (undefined si el usuario no la ha cambiado: se usa la de por defecto) */
  public valor<K extends keyof Preferencias>(clave: K): Preferencias[K] {
    return this.actuales[clave];
  }

  /** Cambia una preferencia (y la guarda en el navegador si el curso lo permite) */
  public cambiar<K extends keyof Preferencias>(clave: K, valor: Preferencias[K]): void {
    this.actuales[clave] = valor;
    if (!this.guardar) return;
    try {
      localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(this.actuales));
    } catch { /* si el navegador no deja guardar, solo dura hasta recargar */ }
  }

  /** Olvida todas las preferencias (al restaurar las de por defecto) */
  public olvidar(): void {
    this.actuales = {};
    try {
      localStorage.removeItem(CLAVE_PREFERENCIAS);
    } catch { /* nada que borrar */ }
  }

  /** Índice fijo a la izquierda en pantallas anchas (por defecto, sí) */
  public get indiceFijado(): boolean {
    return this.actuales.indiceFijado ?? true;
  }
  public set indiceFijado(valor: boolean) {
    this.cambiar('indiceFijado', valor);
  }

  private leerGuardadas(): Preferencias {
    try {
      const guardadas = JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS) ?? '{}');
      return typeof guardadas === 'object' && guardadas !== null ? guardadas : {};
    } catch {
      return {};
    }
  }
}
