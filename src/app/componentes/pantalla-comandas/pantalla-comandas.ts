import { Component, inject, input, OnInit, signal } from '@angular/core';
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
export class PantallaComandas implements OnInit {
  
  svrConfig = inject(ConfigService);
  srvNavegacion = inject(NavegacionService);
  srvComandas = inject(ComandasService);

  // ngOnInit() {
  //   console.log('Cargando Registros');
  // }

   imagenMarcaAgua = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const configuracion = await window.electronAPI?.obtenerConfiguracion();
      this.imagenMarcaAgua.set(configuracion?.imagenMarcaAgua ?? null);
    } catch (error) {
      console.error('No se pudo cargar la marca de agua:', error);
    }
  }

  onProductoSeleccionado(idProducto: ComandaModel) {
    console.log('Producto seleccionado:', idProducto);
  }
}
