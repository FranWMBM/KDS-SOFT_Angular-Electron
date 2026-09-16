import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  filasPorTicket = 15;
  columnas = 6;
  filas = 1;
  columnasPorPagina = this.columnas * this.filas;
}
