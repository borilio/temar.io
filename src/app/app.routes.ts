import { Routes } from '@angular/router';
import { Indice } from './components/indice/indice';
import { Contenido } from './components/contenido/contenido';
import { Config } from './components/config/config';

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
    path: 'config', 
    component: Config,
  },
  
  
  // (Opcional pero recomendado) Redirige cualquier otra ruta al índice
  // TODO hacer una página 404
  { 
    path: '**', 
    redirectTo: '' 
  } 
];