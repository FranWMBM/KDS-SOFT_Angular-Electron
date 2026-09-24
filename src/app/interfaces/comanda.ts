import { inject } from '@angular/core';
import { ConfigService } from '../servicios/config-service';
import { Columna, ColumnaModel } from './columna';
import { ProductoMonitor } from './productos-en-produccion';

interface Comanda {
  idComanda: number;
  //movimientos: number[];
  tickets: ColumnaModel[];
}

export class ComandaModel implements Comanda {
  idComanda: number;
  //movimientos: number[];
  tickets: ColumnaModel[];
  filas = 20;
  columnaActual: ColumnaModel;
  private productosPorMovimiento = new Map<number, ProductoMonitor>();

  constructor(registro: ProductoMonitor, filas: number) {
    this.idComanda = registro.folio;
    this.filas = filas;
    //this.movimientos = [registro.movimiento];
    //this.agregarProducto(registro);
    this.guardarProducto(registro);
    this.columnaActual = this.crearColumna(true);
    this.tickets = [this.columnaActual];
    this.dibujarProducto(registro);
  }

  private crearColumna(primera: boolean): ColumnaModel {
    const columna = new ColumnaModel(primera, this.filas);
    return columna;
  }

  agregarDisplays(producto: ProductoMonitor): void {
    if (!this.guardarProducto(producto)) return;
    this.dibujarProducto(producto);
  }

  private dibujarProducto(producto: ProductoMonitor): void {
    const displaysPendientes = this.columnaActual.agregarProducto(producto);

    if (displaysPendientes.length > 0) {
      this.columnaActual = this.crearColumna(false);
      this.tickets.push(this.columnaActual);
      displaysPendientes.forEach((display) => {
        this.columnaActual.agregarDisplay(display);
      });
    }
  }

  guardarProducto(producto: ProductoMonitor): boolean {
    const movimiento = producto.movimiento;

    if (this.productosPorMovimiento.has(movimiento)) {
      return false; // Ya existe esa llave; no se reemplaza el producto
    }

    this.productosPorMovimiento.set(movimiento, producto);
    return true;
  }

  public get movimientos(): number[] {
    return [...this.productosPorMovimiento.keys()];
  }

  // Devuelve true si todavía quedan productos en la comanda.
  public eliminarProductos(movimientos: number[]): boolean {
    for (const mov of movimientos) {
      this.productosPorMovimiento.delete(mov);
    }

    return this.productosPorMovimiento.size > 0;
  }

  // Vuelve a armar las columnas desde cero con los productos que quedan
  // (el Map conserva el orden en que se agregaron).
  public redibujarColumnas(): void {
    this.columnaActual = this.crearColumna(true);
    this.tickets = [this.columnaActual];

    for (const producto of this.productosPorMovimiento.values()) {
      this.dibujarProducto(producto);
    }
  }
}
