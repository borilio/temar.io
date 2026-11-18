// Estructura de json/temario.json de cada curso (guía completa en cursos/plantilla/README.md)

export interface Temario {
    tituloGeneral:          string;     // Título grande del índice
    descripcion?:           string;     // Texto bajo el título del índice
    img?:                   string;     // Imagen (banner) del índice, p. ej. "img/banner.png". Vacío o ausente: sin imagen
    mostrarBloquesEnMenu?:  boolean;    // Menú "Contenidos": true (por defecto) agrupa los temas por bloques; false, todos seguidos con separadores
    bloques:                Bloque[];   // Lista de bloques del curso
}

export interface Bloque {
    id:            string;     // Identificador único del bloque
    orden:         number;     // Posición del bloque (1, 2, 3...)
    titulo:        string;     // Título del bloque
    mostrarTitulo: boolean;    // false: oculta la cabecera del bloque en el índice
    descripcion:   string;     // Texto del bloque en el índice (puede ser "")
    icon?:         string;     // Icono de PrimeIcons delante del título (y en el menú), p. ej. "pi pi-box". Si hay emoji, no se muestra
    emoji?:        string;     // Emoji delante del título (tiene prioridad sobre icon)
    color?:        string;     // Color de fondo del bloque (cualquier color CSS)
    img?:          string;     // Imagen dentro del bloque
    expandible?:   boolean;    // true: el bloque se puede plegar y desplegar
    contraido?:    boolean;    // true: el bloque empieza plegado
    habilitado?:   boolean;    // Ausente o false: sus temas se ven desactivados y muestran "no disponible" (ponerlo siempre)
    enConstruccion?: boolean;  // true: todos sus temas muestran la pantalla de "en construcción"
    visible?:      boolean;    // false: no aparece en el índice ni en el menú (si no se indica, true)
    temas:         Tema[];     // Lista de temas del bloque
}

export interface Tema {
    id:          string;       // Identificador único. Es la URL del tema: /tema/{id}
    orden:       number;       // Posición del tema dentro del bloque (también marca anterior/siguiente)
    titulo:      string;       // Título del tema
    descripcion?: string;      // Descripción corta (se ve al dejar el ratón sobre el botón del índice)
    archivoMd:   string;       // Archivo del contenido en temario/, p. ej. "01-primer-tema.md"
    icon?:       string;       // Icono de PrimeIcons del botón (y del menú). En el índice se usa si no hay img ni emoji
    emoji?:      string;       // Emoji del botón del índice (si no hay img)
    img?:        string;       // Imagen del botón del índice (tiene prioridad sobre emoji e icon)
    severity?:   string;       // Color del botón del índice (primary, secondary, success, info, warn, danger, help, contrast). Por defecto primary
    outlined?:   boolean;      // true: botón solo con borde; false: relleno. Por defecto true
    habilitado?: boolean;      // Ausente o false: se ve desactivado y al abrirlo muestra "no disponible" (ponerlo siempre)
    enConstruccion?: boolean;  // true: se abre como un tema más, pero muestra la pantalla de "en construcción"
    visible?:    boolean;      // false: no aparece en el índice ni en el menú, pero se abre por URL (si no se indica, true)
}
