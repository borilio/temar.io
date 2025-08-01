export interface Temario {
    tituloGeneral: string;
    img?: string;
    temas: Tema[];
}

export interface Tema {
    id: string;
    orden: number;
    titulo: string;
    descripcion: string;
    icono: string;
    img?: string;
    emoji?: string;
    archivoMd: string;
}