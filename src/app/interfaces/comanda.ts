import { inject } from '@angular/core';
import { ConfigService } from '../servicios/config-service';
import { Columna, ColumnaModel } from './columna';
import { ProductoMonitor } from './productos-en-produccion';

interface Comanda {
  idComanda: number;
  productos: number[];
  tickets: ColumnaModel[];
}

export class ComandaModel implements Comanda {
  idComanda: number;
  productos: number[];
  tickets: ColumnaModel[];
  filas = 20;
  columnaActual: ColumnaModel;

  constructor(registro: ProductoMonitor, filas: number) {
    this.idComanda = registro.folio;
    this.filas = filas;
    this.productos = [registro.movimiento];
    this.columnaActual = this.crearColumna(true);
    this.tickets = [this.columnaActual];
    this.columnaActual.agregarProducto(registro);
  }

  private crearColumna(primera: boolean): ColumnaModel {
    const columna = new ColumnaModel(primera, this.filas);
    return columna;
  }

  agregarProducto(producto: ProductoMonitor): void {
    const displaysPendientes = this.columnaActual.agregarProducto(producto);

    if (displaysPendientes.length > 0) {
      this.columnaActual = this.crearColumna(false);
      this.tickets.push(this.columnaActual);
      displaysPendientes.forEach((display) => {
        this.columnaActual.agregarDisplay(display);
      });
    }
  }
}
