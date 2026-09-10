import { Component, input } from '@angular/core';
import { Display } from '../../../../interfaces/columna';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-fila-producto',
  imports: [NgClass],
  templateUrl: './fila-producto.html',
  styleUrl: './fila-producto.css',
})
export class FilaProducto {
  datos = input<Display | undefined>();
  esProductoPrincipal = input<boolean>(false);
}
