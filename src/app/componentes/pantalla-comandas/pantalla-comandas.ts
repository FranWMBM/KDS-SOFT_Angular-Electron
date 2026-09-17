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

    console.log('Cargando Registros>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    try {
      const configuracion = await window.electronAPI?.obtenerConfiguracion();

      if(!configuracion) {
        console.error('No se pudo obtener la configuración del archivo config.json');
        return;
      }

      this.svrConfig.asignarConfiguracion(configuracion);
      this.imagenMarcaAgua.set(configuracion.imagenMarcaAgua ?? null);
    } catch (error) {
      console.error('No se pudo cargar la marca de agua:', error);
    }
  }

  onProductoSeleccionado(idProducto: ComandaModel) {
    console.log('Producto seleccionado:', idProducto);
  }
}
