export interface Config {
    preset: string;
    defaultThemeId: string;
    mostrarLigadurasFuentes: boolean;
    devMode: boolean;
    data: Data;
    themes: Theme[];
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
    href:        string;
    disabled?:   boolean;
}

export interface Caducidad {
    fecha:         string;
    aviso:          number;
    mensajeAviso:   string;
    mensajeCerrado: string;
}
