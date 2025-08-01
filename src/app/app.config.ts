import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

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
    provideRouter(
      routes,
      withInMemoryScrolling({
        // Habilita el scroll a las anclas
        anchorScrolling: 'enabled',
        // (Opcional pero recomendado) Restaura la posición del scroll al usar atrás/adelante
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withFetch()), // Es para eliminar un warning en la consola de depuración, para mantener el keepalive
    
    
    // PrimeNG
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        //Se elige el preset que haya en el config.json o el índigo por defecto
        preset: PRESETS[CONFIG.preset as keyof typeof PRESETS] ?? PRESETS["MiPresetIndigo"],
        options: {
          darkModeSelector: ".dark-mode",
        }
      }
    }),

    
  ]
};
