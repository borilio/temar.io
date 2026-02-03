import { Routes } from '@angular/router';
import { Indice } from './components/indice/indice';
import { Contenido } from './components/contenido/contenido';
import { Config } from './components/config/config';
import { Acercade } from './components/acercade/acercade';
import { Enlaces } from './components/enlaces/enlaces';
import { Cerrado } from './components/cerrado/cerrado';
import { ExpirationGuard } from './guards/caducidad.guard';

export const routes: Routes = [
  // Ruta raíz ('/')
  { 
    path: '', 
    component: Indice, 
    pathMatch: 'full',
  },
  
  // Ruta para un tema específico (ej. '/tema/01-intro')
  { 
    path: 'tema/:id', 
    component: Contenido,
    canActivate: [ExpirationGuard] // Los temas están protegidos por el guard
  },
  {
    path: 'acercade',
    component: Acercade
  },
  {
    path: 'enlaces',
    component: Enlaces,
    canActivate: [ExpirationGuard] // Los enlaces están protegidos por el guard
  },
  {
    path: 'cerrado',
    component: Cerrado
  },
  // (Opcional pero recomendado) Redirige cualquier otra ruta al índice
  // TODO hacer una página 404
  { 
    path: '**', 
    redirectTo: '' 
  } 
];