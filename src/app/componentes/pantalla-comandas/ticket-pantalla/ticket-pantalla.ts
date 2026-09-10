import { Component, EventEmitter, input, Output } from '@angular/core';
import { FilaProducto } from './fila-producto/fila-producto';
import { Columna } from '../../../interfaces/columna';
import { Encabezado } from './encabezado/encabezado';
import { ComandaModel } from '../../../interfaces/comanda';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-ticket-pantalla',
  imports: [FilaProducto, Encabezado, NgClass],
  templateUrl: './ticket-pantalla.html',
  styleUrl: './ticket-pantalla.css',
})
export class TicketPantalla {
  columna = input<Columna | undefined>();
  comanda = input.required<ComandaModel>();
  seleccionado = input(false);

  @Output() productoSeleccionado = new EventEmitter<ComandaModel>();

  seleccionarProducto() {
    this.productoSeleccionado.emit(this.comanda());
  }
}