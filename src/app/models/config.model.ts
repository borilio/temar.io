export interface ConfigModel {
    preset: string;
    footer: Footer;
}

export interface Footer {
    copyright: string;
    logos:     Logo[];
}

export interface Logo {
    img:  string;
    link: string;
    alt:  string;
}
