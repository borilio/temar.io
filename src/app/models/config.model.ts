export interface Config {
    preset: string;
    defaultThemeId: string;
    footer: Footer;
    themes: Theme[];
}

export interface Footer {
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
