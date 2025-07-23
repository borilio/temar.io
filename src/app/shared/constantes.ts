import configJson from "../../../public/assets/json/config.json";
import { ConfigModel } from "../models/config.model";

// Creamos una constante de tipo ConfigModel con el contenido del json
// Para usarla, simplemente importa la constante CONFIG en donde quieras
export const CONFIG: ConfigModel = configJson;



