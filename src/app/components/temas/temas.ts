import { Component, OnDestroy, OnInit } from '@angular/core';
import { Theme } from '../../models/config.model';
import { ThemeService } from '../../services/theme.service';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-temas',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './temas.html',
  styleUrl: './temas.css'
})
export class Temas implements OnInit, OnDestroy {

  temasDisponibles: Theme[] = [];
  temaSeleccionado!: Theme;
  temaSubscription!: Subscription;

  constructor(private themeService: ThemeService) { }
  

  ngOnInit(): void {
    this.temasDisponibles = this.themeService.getAvailableThemes();

    // Escucha el tema activo para pre-seleccionar el valor del selector
    this.themeService.currentTheme$.subscribe(theme => {
      this.temaSeleccionado = theme;
    });
  }

  onCambiarTema(): void {
    // Llama al servicio para cambiar el tema de toda la app
    if (this.temaSeleccionado) {
      this.themeService.setTheme(this.temaSeleccionado.id);
    }
  }

  ngOnDestroy(): void {
    // Nos "desuscribimos" para limpiar y evitar fugas de memoria
    this.temaSubscription.unsubscribe();
  }


}
