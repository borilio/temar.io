import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-cabecera',
  imports: [PRIMENG_IMPORTS],
  providers: [MessageService],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css'
})
export class Cabecera implements OnInit {
  public items: MenuItem[] | undefined;
  public temaOscuro: boolean;
  public textoBotonModoOscuro: string;

  constructor(private messageService: MessageService) {
    this.temaOscuro = false;
    this.textoBotonModoOscuro = "Pulsa para alternar entre el modo claro y oscuro de la interfaz";
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Inicio',
        icon: PrimeIcons.HOME
      },
      {
        label: 'Contenidos',
        icon: PrimeIcons.BOOK
      },
      
    ];


  }

  public cambiarModo(): void {
    this.mensajeModoCambiado();
    const html = document.documentElement;
    this.temaOscuro = html.classList.toggle('modo-oscuro');
  }

  private mensajeModoCambiado() {
    this.messageService.add({
      severity: 'success',
      summary: this.temaOscuro ? "Modo claro activado" : "Modo oscuro activado",
      icon: PrimeIcons.PALETTE,
    });
  }



}
