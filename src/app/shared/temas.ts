import { Theme } from "../models/config.model";

/**
 * Catálogo con TODOS los temas visuales de la app.
 * Los archivos CSS están en src/assets/themes/markdown y src/assets/themes/highlight.
 *
 * Cada curso elige cuáles ofrece (y en qué orden) con "temasDisponibles" en su config.json.
 * Si el curso no indica nada, se ofrecen todos en el orden de esta lista.
 * Para añadir un tema nuevo a todos los cursos, basta con añadirlo aquí (y sus CSS).
 */
export const CATALOGO_TEMAS: Theme[] = [
    {
        id: "github-light",
        name: "Claro",
        baseMode: "light",
        markdownThemeFile: "github-markdown-light.css",
        highlightThemeFile: "github.css"
    },
    {
        id: "github-sepia",
        name: "Sepia",
        baseMode: "light",
        markdownThemeFile: "github-markdown-sepia.css",
        highlightThemeFile: "github.css"
    },
    {
        id: "typora",
        name: "Oscuro",
        baseMode: "dark",
        markdownThemeFile: "github-markdown-darky.css",
        highlightThemeFile: "base16/dracula.css"
    },
    {
        id: "github-dark",
        name: "GitHub Oscuro",
        baseMode: "dark",
        markdownThemeFile: "github-markdown-dark.css",
        highlightThemeFile: "github-dark.css"
    },
    {
        id: "cervantes",
        name: "Cervantes",
        baseMode: "dark",
        markdownThemeFile: "cervantes.css",
        highlightThemeFile: "base16/dracula.css"
    },
    {
        id: "retro",
        name: "Retro Gaming",
        baseMode: "dark",
        markdownThemeFile: "retro-gaming.css",
        highlightThemeFile: "monokai.css"
    },
    {
        id: "hud",
        name: "HUD",
        baseMode: "dark",
        markdownThemeFile: "hud.css",
        highlightThemeFile: "monokai.css"
    }
];
