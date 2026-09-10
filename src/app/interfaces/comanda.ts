import { Columna, ColumnaModel } from './columna';
import { ProductoMonitor } from './productosenproduccion';

interface Comanda {
  id_comanda: number;
  productos: number[];
  tickets: ColumnaModel[];
}

export class ComandaModel implements Comanda {
  id_comanda: number;
  productos: number[];
  tickets: ColumnaModel[];

  columnaActual: ColumnaModel;

  constructor(registro: ProductoMonitor) {
    this.id_comanda = registro.folio;

    this.productos = [registro.movimiento];

    this.columnaActual = this.crearColumna(true);
    this.tickets = [this.columnaActual];
    this.columnaActual.agregarProducto(registro);
  }

  private crearColumna(primera: boolean): ColumnaModel {
    const columna = new ColumnaModel();
    columna.esPrimera = primera;
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
