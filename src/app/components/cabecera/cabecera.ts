import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-cabecera',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css'
})
export class Cabecera implements OnInit {
  public items: MenuItem[] | undefined;

  ngOnInit(): void {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home'
      }
    ]
  }

  public cambiarModo(): void {
    const html = document.documentElement;
    html.classList.toggle('modo-oscuro');
  }



}
