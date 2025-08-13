import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { TemarioService } from '../../services/temario.service';
import { Temario } from '../../models/temario.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-indice',
  imports: [
    PRIMENG_IMPORTS, RouterLink
  ],
  templateUrl: './indice.html',
  styleUrl: './indice.css'
})
export class Indice implements OnInit {
  public temario!: Temario;

  constructor (private temarioService: TemarioService) {
  }


  
  ngOnInit(): void {
    // Inicializamos el temario con lo que nos de el servicio
    this.temario = this.temarioService.getFullTemario();
  }

}
