import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Para crear presets, elige un color base y dile a la IA que te cree el preset y todas las tonalidades.

export const MiPresetViolet = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f7e4fd',  // Muy claro
            100: '#ebb4fa',
            200: '#de85f6',
            300: '#d155f3',
            400: '#c425f0',
            500: '#aa0ed5',  // Color base
            600: '#830aa5',
            700: '#70098d',
            800: '#5d0775',
            900: '#4a065d',
            950: '#370445'   // Muy oscuro
        }
        // Puedes añadir surface, secondary, etc., igual si lo necesitas
    }
});


export const MiPresetBlue = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#e3f2fd',  // Muy claro
            100: '#bbdefb',
            200: '#90caf9',
            300: '#64b5f6',
            400: '#42a5f5',
            500: '#1976d2',  // Tu color base
            600: '#1565c0',
            700: '#115293',
            800: '#0d47a1',
            900: '#0a3577',
            950: '#02152c'   // Oscurísimo
        }
    }
});

export const MiPresetCyan = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#e0f9fb',  // Muy claro
            100: '#b3f0f6',
            200: '#80e6f1',
            300: '#4ddceb',
            400: '#26d2e5',
            500: '#00BCD4',  // Color base
            600: '#00a5bb',
            700: '#008a9e',
            800: '#006e81',
            900: '#005265',
            950: '#00363f'   // Muy oscuro
        }
    }
});



export const MiPresetEmerald = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    }
  }
});

export const MiPresetOrange = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407'
    }
  }
});

export const MiPresetTeal = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#0c423b'
    }
  }
});

export const MiPresetSky = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    }
  }
});

export const MiPresetIndigo = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b'
    }
  }
});

export const MiPresetPurple = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764'
    }
  }
});

export const MiPresetFuchsia = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    }
  }
});

export const MiPresetPink = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
      950: '#500724'
    }
  }
});

export const MiPresetRose = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519'
    }
  }
});

export const MiPresetNoir = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e6eaf0',
      100: '#c6cfdd',
      200: '#a5b7cb',
      300: '#849eb7',
      400: '#617ca1',
      500: '#334155', // noir puro
      600: '#283344',
      700: '#1d2531',
      800: '#12161d',
      900: '#08090b',
      950: '#040506'
    }
  }
});

export const MiPresetLight = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#ffffff',  // blanco puro para highlights
      100: '#f9fafb',  // ultra suave
      200: '#f3f4f6',  // blanco suavizado (tu tono clave)
      300: '#e5e7eb',  // gris clarito moderno
      400: '#d1d5db',  // gris claro útil
      500: '#e5e7eb',  // para consistency puedes usar también #f3f4f6 aquí si prefieres
      600: '#9ca3af',  // gris medio neutro
      700: '#6b7280',  // gris más marcado (aún visible en dark)
      800: '#4b5563',  // gris profundo para acentos
      900: '#374151',  // casi noir
      950: '#1f2937'   // muy oscuro para borders profundos en dark
    }
  }
});

export const MiPresetAmber = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amber puro, el central
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    }
  }
});

export const MiPresetYellow = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006'
    }
  }
});

export const MiPresetWine = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#f5e9eb',  // Muy claro
            100: '#e5c8cc',
            200: '#d4a1a6',
            300: '#c37a80',
            400: '#b2535a',
            500: '#722F37',  // Color base
            600: '#652a31',
            700: '#57242a',
            800: '#491e23',
            900: '#3b181c',
            950: '#2c1215'   // Muy oscuro
        }
    }
});

export const MiPresetNeon = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#ff1cff',
      600: '#c026d3',
      700: '#0bffff',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    }
  }
});

// Y ahora exportamos un objeto con todos los presets

export const PRESETS = {
  MiPresetLight,
  MiPresetBlue,
  MiPresetCyan,
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
  MiPresetAmber,
  MiPresetYellow,
  MiPresetWine,
  MiPresetNeon
};















