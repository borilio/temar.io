import { Component } from '@angular/core';
import { Temas } from "../temas/temas";
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-config',
  imports: [
    PRIMENG_IMPORTS,
    Temas
  ],
  templateUrl: './config.html',
  styleUrl: './config.css'
})
export class Config {
  public devMode: boolean;

  constructor(public configService: ConfigService){
    this.devMode = this.configService.isDevMode();
  }

}
