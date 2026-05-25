import { Routes } from '@angular/router';
import { ExpirationGuard } from './guards/caducidad.guard';

import { Indice } from './components/pages/indice/indice';
import { Contenido } from './components/pages/contenido/contenido';
import { Acercade } from './components/pages/acercade/acercade';
import { Enlaces } from './components/pages/enlaces/enlaces';
import { Cerrado } from './components/pages/cerrado/cerrado';

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