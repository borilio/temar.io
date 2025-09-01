export interface Config {
    preset: string;
    defaultThemeId: string;
    devMode: boolean;
    data: Data;
    themes: Theme[];
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
