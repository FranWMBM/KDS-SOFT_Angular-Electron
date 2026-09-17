import { Injectable } from '@angular/core';
import { ConfiguracionKDS } from '../interfaces/configuracion';


@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  filasPorTicket = 15;
  columnas = 6;
  filas = 1;
  columnasPorPagina = this.columnas * this.filas;

  public asignarConfiguracion(configuraciones: ConfiguracionKDS): void {
    this.filasPorTicket = configuraciones.filasTicket;
    this.columnas = configuraciones.columnasPorPagina;
    this.filas = configuraciones.filasPorPagina;
    this.columnasPorPagina = this.columnas * this.filas;
  }
}
