import { Component } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../../shared/primeng.imports';
import packageInfo from '../../../../../package.json'; // Para leer los metadatos del package.json con la versión, fecha, nombre, etc.
import { AppModel } from '../../../models/app.model';
import { Caducidad, Data } from '../../../models/config.model';
import { ConfigService } from '../../../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acercade',
  imports: [PRIMENG_IMPORTS, CommonModule],
  templateUrl: './acercade.html',
  styleUrl: './acercade.css'
})
export class Acercade {

  public appData: Data;
  public appCaducidad: Caducidad;
  public app : AppModel[]; // Tiene que ser un array para mostrarlo en un p-table
  public year: number;

  constructor (private configService: ConfigService) {
    this.app = [{
      name: packageInfo.name,
      codename: packageInfo.codename,
      version: packageInfo.version,
      date: packageInfo.date
    }];

    // Cargamos cosillas del copyright
    this.appData = this.configService.getData();

    // Cargamos los datos de la caducidad
    this.appCaducidad = this.configService.getCaducidad();

    // Ponemos el año actual
    const fechaActual: Date = new Date();
    this.year = fechaActual.getFullYear();
  }

}
