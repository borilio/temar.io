import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { ConfigService } from "../services/config.service";
import { Caducidad } from "../models/config.model";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ExpirationGuard implements CanActivate {
  
  constructor(
    private configService: ConfigService, 
    private router: Router,
    private messageService: MessageService
  ){}
  
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Extraemos la fecha de caducidad y la fecha de hoy
    const caducidad : Caducidad = this.configService.getCaducidad();
    const hoy: Date = this.getFechaActual();
    
    // Calculamos el tiempo en días que le quedan al curso
    const caducidadDate : Date = new Date(caducidad.fecha);
    const diffMs = caducidadDate.getTime() - hoy.getTime(); // nos da la diferencia en ms
    const diasRestantes = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Lo convertimos a días (entero), si es positivo, son los días que quedan, si son negativos, son los días que lleva cerrado el curso.
    console.warn("Guard: Días que falte para que cierre: ", diasRestantes);

    // Si el curso ha caducado, retornamos un false, si no seguimos...
    if (diasRestantes < 0) {
      this.router.navigate(['/cerrado']); // Mandamos a la página de cerrado
      return false;
    }

    // Mostramos un toast para avisar del cierre inminente, si quedan menos días que el estipulado en el config.json
    if (diasRestantes < caducidad.aviso) {
      this.messageService.clear(); // Borramos cualquier toast anterior, para que solo haya uno a la vez
      this.messageService.add({
        severity: "warn",
        summary: `Quedan ${diasRestantes} días restantes`,
        detail: `${caducidad.mensajeAviso}`,
        sticky: true
      });
    }
    
    //Si llegamos hasta aquí, es que tenemos que dejar pasar
    return true;
  }

  // Método que obtiene la fecha actual (por ahora local)
  // TODO Mejorar la seguridad obteniendo la fecha actual por otro sistema
  private getFechaActual(): Date {
    const fechaActual = new Date();
    // const fechaActual = new Date("2025-12-04"); // Si quieres probar con una fecha concreta, usa esta línea
    return fechaActual;
  }

}