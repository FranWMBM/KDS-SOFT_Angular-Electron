import { Component, inject, input } from '@angular/core';
import { TicketPantalla } from './ticket-pantalla/ticket-pantalla';
import { ComandasService } from '../../servicios/ComandasService';
import { ProductoMonitor } from '../../interfaces/productosenproduccion';
import { ComandaModel } from '../../interfaces/comanda';
import { BumpBar } from "../bump-bar/bump-bar";
import { ConfigService } from '../../servicios/ConfigService';
import { NavegacionService } from '../../servicios/NavegacionService';

@Component({
  selector: 'app-pantalla-comandas',
  imports: [TicketPantalla, BumpBar],
  templateUrl: './pantalla-comandas.html',
  styleUrl: './pantalla-comandas.css',
})
export class PantallaComandas {
  
  svrConfig = inject(ConfigService);
  srvNavegacion = inject(NavegacionService);
  srvComandas = inject(ComandasService);

  ngOnInit() {
    console.log('Cargando Registros');
  }

  onProductoSeleccionado(idProducto: ComandaModel) {
    console.log('Producto seleccionado:', idProducto);
  }
}
