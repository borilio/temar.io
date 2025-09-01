import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { Config, Data } from '../../models/config.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-pie',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './pie.html',
  styleUrl: './pie.css'
})
export class Pie implements OnInit {
  // Objeto de configuración que incluye información del footer (entre otras)
  public footer: Data;


  constructor(private configService: ConfigService) {
    // Inicializamos la config
    this.footer = configService.getData();
  }


  ngOnInit(): void {}

}
