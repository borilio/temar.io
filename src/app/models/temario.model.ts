export interface Temario {
    tituloGeneral:          string;
    descripcion?:           string;
    img?:                   string;
    mostrarBloquesEnMenu?:  boolean;
    bloques:                Bloque[];
}

export interface Bloque {
    id:            string;
    orden:         number;
    titulo:        string;
    mostrarTitulo: boolean;
    descripcion:   string;
    icon?:         string;
    emoji?:        string;
    color?:        string;
    img?:          string;
    expandible?:   boolean;
    contraido?:    boolean;
    habilitado?:   boolean;
    temas:         Tema[];
}

export interface Tema {
    id:          string;
    orden:       number;
    titulo:      string;
    descripcion?: string;
    archivoMd:   string;
    icon?:       string;
    emoji?:      string;
    img?:        string;
    severity?:   string;
    outlined?:   boolean;
    habilitado?: boolean;
}
