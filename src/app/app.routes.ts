import { Routes } from '@angular/router';
import { Indice } from './components/indice/indice';
import { Contenido } from './components/contenido/contenido';
import { Config } from './components/config/config';
import { Acercade } from './components/acercade/acercade';
import { Enlaces } from './components/enlaces/enlaces';

export const routes: Routes = [
  // Ruta raíz ('/')
  { 
    path: '', 
    component: Indice, 
    pathMatch: 'full' 
  },
  
  // Ruta para un tema específico (ej. '/tema/01-intro')
  { 
    path: 'tema/:id', 
    component: Contenido
  },
  {
    path: 'acercade',
    component: Acercade
  },
  {
    path: 'enlaces',
    component: Enlaces
  },
  // (Opcional pero recomendado) Redirige cualquier otra ruta al índice
  // TODO hacer una página 404
  { 
    path: '**', 
    redirectTo: '' 
  } 
];