import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { Temas } from "../temas/temas";

@Component({
  selector: 'app-cabecera',
  imports: [PRIMENG_IMPORTS, Temas],
  providers: [MessageService],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css'
})
export class Cabecera implements OnInit {
  public items: MenuItem[] | undefined;

  constructor(private messageService: MessageService) {
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

}
