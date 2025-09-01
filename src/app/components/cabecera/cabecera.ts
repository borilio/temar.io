import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { Config } from "../config/config";
import { TemarioService } from '../../services/temario.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cabecera',
  imports: [PRIMENG_IMPORTS, Config, RouterModule],
  providers: [MessageService],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css'
})
export class Cabecera implements OnInit {
  public items: MenuItem[] = [];
  public visible: boolean = false;

  constructor(
    private messageService: MessageService,
    private temarioService: TemarioService
  ) {
  }

  ngOnInit(): void {
    // 1. Pide los subitems ya formateados directamente al servicio
    const subItemsContenidos = this.temarioService.getTemasAsMenuItems();

    // 2. Construye el menú final usando los contenidos del json
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
        items: subItemsContenidos, // <----- Aquí cargamos los contenidos del temario.json
      },
      {
        label: 'Enlaces externos',
        icon: PrimeIcons.EXTERNAL_LINK,
        routerLink: 'enlaces'
      },
      {
        label: 'Acerca de',
        icon: PrimeIcons.INFO_CIRCLE,
        routerLink: 'acercade'
      }

    ];
  }

  // Función para que se muestre la ventana de dialogo
  mostrarDialogo() {
    this.visible = true;
  }



}
