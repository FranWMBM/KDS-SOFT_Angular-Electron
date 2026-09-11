import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  filasPorTicket = 13;
  columnas = 6;
  filas = 2;
  columnasPorPagina = this.columnas * this.filas;
}
