import configJson from "../../../contenido/json/config.json";
import temarioJson from "../../../contenido/json/temario.json";

// Interfaces tipadas para manejar los archivos json
import { Config } from "../models/config.model";
import { Temario } from "../models/temario.model";


// Para usarla las siguientes constantes, simplemente las importas donde quieras

// Constante CONFIG de tipo ConfigModel con el contenido en json de la configuración del temario
export const CONFIG: Config = configJson;

// Creamos una constante TEMARIO con el contenido del temario en json
export const TEMARIO: Temario = temarioJson;