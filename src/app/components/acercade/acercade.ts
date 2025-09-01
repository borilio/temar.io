import { Component } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import packageInfo from '../../../../package.json'; // Para leer los metadatos del package.json con la versión, fecha, nombre, etc.
import { AppModel } from '../../models/app.model';
import { Data } from '../../models/config.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-acercade',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './acercade.html',
  styleUrl: './acercade.css'
})
export class Acercade {

  public appData: Data;
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

    // Ponemos el año actual
    const fechaActual: Date = new Date();
    this.year = fechaActual.getFullYear();
  }

}
