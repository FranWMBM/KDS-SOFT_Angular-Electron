import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  filasPorTicket = 10;
  columnas = 6;
  filas = 2;
  columnasPorPagina = this.columnas * this.filas;
}
