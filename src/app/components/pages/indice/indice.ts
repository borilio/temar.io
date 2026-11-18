import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../../shared/primeng.imports';
import { TemarioService } from '../../../services/temario.service';
import { Bloque, Tema, Temario } from '../../../models/temario.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-indice',
  imports: [
    PRIMENG_IMPORTS, RouterLink
  ],
  templateUrl: './indice.html',
  styleUrl: './indice.css'
})
export class Indice implements OnInit {
  public temario!: Temario;
  public bloques: Bloque[] = []; // Bloques y temas ordenados y sin los ocultos

  constructor (private temarioService: TemarioService) {
  }



  ngOnInit(): void {
    // Inicializamos el temario con lo que nos de el servicio
    this.temario = this.temarioService.getFullTemario();
    this.bloques = this.temarioService.getBloquesVisibles();
  }

  /** El tema y su bloque están habilitados (si no, el botón sale desactivado) */
  public habilitado(bloque: Bloque, tema: Tema): boolean {
    return this.temarioService.estaHabilitado(bloque, tema);
  }

  /** El tema o su bloque están en construcción (se marca con 🚧, pero se puede abrir) */
  public enConstruccion(bloque: Bloque, tema: Tema): boolean {
    return this.temarioService.estaEnConstruccion(bloque, tema);
  }

}
