import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

// Import de la configuración
import { CONFIG } from './shared/constantes';

// PrimeNG
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'; // En el preset, para usar Aura por defecto, quita "MiPreset" y cámbialo por Aura
import { PRESETS } from './shared/presets-aura/preset-colores';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    
    
    // PrimeNG
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        //Se elige el preset que haya en el config.json o el índigo por defecto
        preset: PRESETS[CONFIG.preset as keyof typeof PRESETS] ?? PRESETS["MiPresetIndigo"],
        options: {
          darkModeSelector: ".modo-oscuro",
        }
      }
    }),

    
  ]
};
