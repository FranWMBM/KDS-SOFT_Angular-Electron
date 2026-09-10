import { signal, Signal } from '@angular/core';
import { ProductoMonitor } from './productosenproduccion';

export interface Columna {
  esPrimera: boolean;
  cantidadFilas: number;
  displays: Display[];
  completada: boolean;
}

export interface Display {
  descripcion: string;
  tipo: 'principal' | 'mod' | 'comentario';
  movimiento: number;
}

export class ColumnaModel implements Columna {
  esPrimera = true;
  cantidadFilas = 20;
  displays: Display[] = [];
  completada = false;
  seleccionado = signal(false);

  agregarProducto(producto: ProductoMonitor): Display[] {
    const displayProducto: Display = {
      descripcion: producto.descripcion,
      tipo: producto.productocompuestoprincipal ? 'principal' : 'mod',
      movimiento: producto.movimiento,
    };

    const displayComentario: Display = {
      descripcion: '💬 ' + producto.comentario,
      tipo: 'comentario',
      movimiento: 0,
    };

    if (!this.agregarDisplay(displayProducto)) {
      let pendientes = [displayProducto];
      if (producto.comentario) {
        pendientes.push(displayComentario);
      }
      return pendientes;
    }

    if (producto.comentario) {
      if (!this.agregarDisplay(displayComentario)) {
        return [displayComentario];
      }
    }

    return [];
  }

  agregarDisplay(fila: Display): boolean {
    if (this.displays.length == this.cantidadFilas) {
      return false;
    }

    this.displays.push(fila);
    return true;
  }
}
