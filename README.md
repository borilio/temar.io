# Temar.io

Este proyecto ha sido generado usando [Angular CLI](https://github.com/angular/angular-cli) versión 20.1.0.

## Uso de PrimeNG

### Añadir el componente al import compartido

Todas los módulos (componentes) de PrimeNG se van añadiendo al archivo `shared/primeng.imports.ts`. Aquí estarán todos los módulos que usemos de PrimeNG.

```typescript
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
//1. Primero se copia aquí la línea

export const PRIMENG_IMPORTS = [
    ButtonModule,
    ToastModule,
    //2. Luego se añade aquí el módulo
    
];
```

### Añadir el import al componente de Angular

Hacemos el import del archivo `shared/primeng.imports.ts` en el componente que queramos usar los "componentes" de PrimeNG.

```typescript
import { Component } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';

@Component({
  selector: 'app-pie',
  imports: [PRIMENG_IMPORTS],
  templateUrl: './pie.html',
  styleUrl: './pie.css'
})
export class Pie {
  
}
```

Hay que importarlo en todos los componentes que tenga nuestra aplicación y que queramos usar componentes de primeNG.

## Uso de archivos JSON de configuración

En la carpeta `assets/json` encontrarás algunos archivos JSON de configuración, como el de ` contenidos.json` o el de `config.json`. 

Está pensando para tener junta toda la información que se tenga que cambiar de un temario a otro, y así no tener que estar buceando en código, solo modificar el archivo de configuración y listo.

### 📚Contenidos.json

{{ Por hacer }}



### ⚙️Config.json

```json
{
    "preset": "MiPresetNoir",
    "footer": {
        "copyright": "Temar.io by ExprimeAndroid",
        "logos": [
            {
                "img": "img/logo1.png",
                "link": "http://www.enlace1.com",
                "alt": "Logo1"
            },
            {
                "img": "img/logo2.png",
                "link": "http://www.enlace2.com",
                "alt": "Logo2"
            },
            {
                "img": "img/logo3.png",
                "link": "http://www.enlace3.com",
                "alt": "Logo3"
            }
        ]
    }
}
```

De esta forma, puedo editar fácilmente el footer sin tener que tocar código. Por ejemplo, el footer mostrará tantas imágenes haya en el JSON.

Para usar la información de los JSON en el código, se añadió una línea al `tsconfig.app.json`, concretamente la de `"resolveJsonModule": true`.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": [],
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.spec.ts"
  ]
}
```

Ahora ya podemos volcar archivos json externos en memoria de una forma simple sin hacer peticiones http ni funciones asíncronas.

1️⃣En el archivo `shared/constantes.ts` tenemos el siguiente contenido:

```typescript
import configJson from "../../../public/assets/json/config.json";
import { ConfigModel } from "../models/config.model";

// Creamos una constante de tipo ConfigModel con el contenido del json
// Para usarla, simplemente importa la constante CONFIG en donde quieras
export const CONFIG: ConfigModel = configJson;
```

2️⃣En el componente que deseemos usarlo importamos la constante:

````typescript
import { Component } from '@angular/core';
import { ConfigModel } from '../../models/config.model';
import { CONFIG } from '../../shared/constantes';

@Component({
  selector: 'app-pie',
  imports: [],
  templateUrl: './pie.html',
  styleUrl: './pie.css'
})
export class Pie {
  // Objeto de configuración que incluye información del footer (entre otras)
  public config: ConfigModel = CONFIG ;

}
````

3️⃣En el HTML, podemos usar el contenido de esa constante para crear contenido “dinámico”. Por ejemplo, se generan tantas imágenes como elementos haya en el array del JSON. O bien mostramos un simple string en el último div. 

```html
<div class="row justify-content-center">

    @for (logo of config.footer.logos; track logo) {
    <div class="col mb-2">
        <a [href]="logo.link">
            <img [src]="logo.img" [alt]="logo.alt" class="footer-logo img-fluid" />
        </a>
    </div>
    }
</div>

<div class="row text-center p-2">
    <span><i class="bi bi-c-circle"></i> {{config.footer.copyright}}</span>
</div>
```

> [!tip]
>
> Así no tenemos que editar archivos `html` de un temario a otro, si no solo editar archivos `json`.



## Presets de colores de un tema

### Crear un nuevo preset



1️⃣ Crea el nuevo preset:

Abre el archivo de presets `src/app/shared/presets-aura/preset-colores.ts` y genera una nueva constante por cada preset nuevo:

```typescript
// Estos dos import ya deberían estar en el archivo
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// -------------->
// Esto es lo que hay que generar.
export const MiPresetTurquesa = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e0fcf9',
      100: '#b3f7ef',
      200: '#80f2e5',
      300: '#4deedb',
      400: '#1ae9d1',
      500: '#00cfb7', // Color principal
      600: '#00a393',
      700: '#00776f',
      800: '#004b4b',
      900: '#002f2f',
      950: '#001a1a'
    }
  }
});
```

Puedes elegir un color central (el 500) y pídele a alguna IA que te genere el preset como el de arriba, pero con un color concreto.

2️⃣ Añade el preset al objeto PRESETS, que está en el mismo archivo `src/app/shared/presets-aura/preset-colores.ts`, abajo del todo.

```typescript
export const PRESETS = {
  MiPresetLight,
  MiPresetBlue,
  MiPresetNoir,
  MiPresetViolet,
  MiPresetEmerald,
  MiPresetOrange,
  MiPresetTeal,
  MiPresetSky,
  MiPresetIndigo,
  MiPresetPurple,
  MiPresetFuchsia,
  MiPresetPink,
  MiPresetRose,
  MiPresetTurquesa // <-- Añade aquí tu nuevo preset
};
```

3️⃣ Y listo. Ya hemos hecho que el `app.config.ts` cargue automáticamente el preset indicado en el `config.json` o si el `MiPresetIndigo` por defecto, por lo que no hay que modificar nada más.



### Elegir un preset

En el archivo `public/assets/json/config.json` , escribir el nombre del preset existente en el campo `preset` y listo. Todo se cargará automáticamente.

```json
{
  "preset": "MiPresetTurquesa",
  "footer": {
    // ...
  }
}
```

