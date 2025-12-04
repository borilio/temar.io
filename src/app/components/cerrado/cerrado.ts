import { Component } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { ConfigService } from '../../services/config.service';
import { Caducidad } from '../../models/config.model';

@Component({
  selector: 'app-cerrado',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './cerrado.html',
  styleUrl: './cerrado.css'
})
export class Cerrado {
  public caducidad: Caducidad;

  constructor(private configService: ConfigService){
    this.caducidad = configService.getCaducidad();
  }

}
