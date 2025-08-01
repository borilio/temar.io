import { Component } from '@angular/core';
import { Temas } from "../temas/temas";
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';

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

}
