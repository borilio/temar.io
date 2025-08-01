import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { Config } from "../config/config";

@Component({
  selector: 'app-cabecera',
  imports: [PRIMENG_IMPORTS, Config],
  providers: [MessageService],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css'
})
export class Cabecera implements OnInit {
  public items: MenuItem[] | undefined;
  public visible: boolean = false;

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Inicio',
        icon: PrimeIcons.HOME,
        routerLink: "/",
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: 'Contenidos',
        icon: PrimeIcons.BOOK,
        routerLink: "/tema/cambiar",
      },
      {
        label: 'Configuración',
        icon: PrimeIcons.COG,
        command: () => {
          this.mostrarDialogo();
        }
      }

    ];
  }

  // Función para que se muestre la ventana de dialogo
  mostrarDialogo() {
    this.visible = true;
  }



}
