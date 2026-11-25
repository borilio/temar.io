// Estructura de json/config.json de cada curso (guía completa en cursos/plantilla/README.md).
// Casi todo es opcional: si a un curso le falta un campo, la app usa el valor por defecto que se indica
// (los pone el ConfigService), así no se rompe con un config.json antiguo o incompleto.

export interface Config {
    nombreCurso?: string;               // Nombre del curso (pestaña "Temar.io - {nombreCurso}" y página /qr). Si falta: sin nombre
    preset?: string;                    // Color principal de la app (presets-aura/preset-colores.ts). Si falta o no existe: MiPresetIndigo
    defaultThemeId?: string;            // Tema visual con el que se abre el curso. Si falta o el curso no lo ofrece: el primero de temasDisponibles
    temasDisponibles?: string[];        // Ids de los temas del catálogo que ofrece el curso, en ese orden. Si falta: todos
    mostrarLigadurasFuentes?: boolean;  // Ligaduras en la fuente del código (=> o != en un solo símbolo). Si falta: true
    devMode?: boolean;                  // true: muestra el panel "Labs" en la configuración. Si falta: false
    guardarPreferencias?: boolean;      // true: el tema, las ligaduras y el índice fijo se guardan en el navegador. Si falta: false (aulas con ordenadores compartidos)
    retardoCarga?: boolean;             // Pantalla de carga 2 s al abrir cada tema. false: carga al instante (cómodo al editar). Si falta: true
    data?: Partial<Data>;               // Texto de "Acerca de" y logos del pie. Si falta (o alguno de sus campos): sin texto y sin logos
    enlacesExternos?: Partial<EnlacesExternos>; // Página "Enlaces externos". Si falta (o alguno de sus campos): sin texto y sin enlaces
    caducidad?: Partial<Caducidad>;     // Cierre del curso. Si falta la fecha: el curso no caduca nunca
}

export interface Data {
    copyright: string;  // Texto adicional en "Acerca de" (puede ser "")
    logos: Logo[];      // Logos del pie de página (puede ser [])
}

export interface Logo {
    img: string;    // Ruta de la imagen (img/...). Altura máxima en el pie: 50 px
    link: string;   // Enlace al pulsar el logo
    alt: string;    // Texto alternativo
}

export interface Theme {
    id: string;
    name: string;
    baseMode: string;
    markdownThemeFile: string;
    highlightThemeFile: string;
}

export interface EnlacesExternos {
    texto:   string;    // Texto de introducción de la página "Enlaces externos"
    enlaces: Enlace[];  // Lista de enlaces
}

export interface Enlace {
    icon:        string;    // Icono de PrimeIcons, p. ej. "pi pi-folder-open"
    desc:        string;    // Texto del enlace
    descLarga?:  string;    // Tooltip al dejar el ratón encima
    botonText?:  string;    // Texto del botón (si no, uno genérico)
    botonIcon?:  string;    // Icono del botón (si no, pi pi-external-link)
    href:        string;    // Dirección. Vacía: el enlace sale deshabilitado
    disabled?:   boolean;   // true: el enlace sale deshabilitado
}

export interface Caducidad {
    fecha:          string; // Fecha de cierre (AAAA-MM-DD). Vacía o no válida: el curso no caduca
    aviso:          number; // Cuántos días antes del cierre se avisa. Si falta: 30
    mensajeAviso:   string; // Mensaje del aviso de cierre próximo. Si falta: uno genérico
    mensajeCerrado: string; // Mensaje de la página de curso cerrado. Si falta: uno genérico
}
