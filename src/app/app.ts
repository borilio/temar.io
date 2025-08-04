import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cabecera } from "./components/cabecera/cabecera";
import { Pie } from "./components/pie/pie";
import { PRIMENG_IMPORTS } from './shared/primeng.imports';

@Component({
  selector: 'app-root',
  imports: [
    PRIMENG_IMPORTS,
    Cabecera,
    Pie,
    RouterModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('temar.io');


  ngOnInit(): void {
    this.actualizarMetaThemeColor();
  }

  /**
   * Método que añade la etiqueta meta theme-color con el color primary establecido en los presets
   */
  private actualizarMetaThemeColor(): void {
    // Saca el valor del primary desde las variables CSS
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--p-primary-500')
      .trim();

    // Busca o crea la etiqueta meta del theme-color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    if (primary) {
      meta.setAttribute('content', primary);
    }
  }



}
