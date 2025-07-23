import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Cabecera } from "./components/cabecera/cabecera";
import { Nav } from "./components/nav/nav";
import { Panel } from "./components/panel/panel";
import { Pie } from "./components/pie/pie";
import { Temas } from "./components/temas/temas";
import { Contenido } from "./components/contenido/contenido";

@Component({
  selector: 'app-root',
  imports: [Cabecera, Nav, Panel, Pie, Temas, Contenido],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('temar.io');
}
