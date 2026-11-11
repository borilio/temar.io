export interface Config {
    nombreCurso?: string;           // Nombre del curso (p. ej. en la pestaña: "Temar.io - SQLite")
    preset: string;
    defaultThemeId: string;
    temasDisponibles?: string[];    // Ids de los temas del catálogo que ofrece el curso (si no se indica, todos)
    mostrarLigadurasFuentes: boolean;
    devMode: boolean;
    data: Data;
    enlacesExternos: EnlacesExternos;
    caducidad: Caducidad;
}

export interface Data {
    copyright: string;
    logos: Logo[];
}

export interface Logo {
    img: string;
    link: string;
    alt: string;
}

export interface Theme {
    id: string;
    name: string;
    baseMode: string;
    markdownThemeFile: string;
    highlightThemeFile: string;
}

export interface EnlacesExternos {
    texto:   string;
    enlaces: Enlace[];
}

export interface Enlace {
    icon:        string;
    desc:        string;
    descLarga?:  string;
    botonText?:  string;
    botonIcon?:  string;
    href:        string;
    disabled?:   boolean;
}

export interface Caducidad {
    fecha:         string;
    aviso:          number;
    mensajeAviso:   string;
    mensajeCerrado: string;
}
