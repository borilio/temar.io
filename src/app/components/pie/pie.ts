import { Component, OnInit } from '@angular/core';
import { Config } from '../../models/config.model';
import { CONFIG } from '../../shared/constantes';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';

@Component({
  selector: 'app-pie',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './pie.html',
  styleUrl: './pie.css'
})
export class Pie implements OnInit {
  // Objeto de configuración que incluye información del footer (entre otras)
  public config: Config = CONFIG ;
  public year: number;


  constructor() {
    const fechaActual: Date = new Date();
    this.year = fechaActual.getFullYear();
  }


  ngOnInit(): void {}

}
