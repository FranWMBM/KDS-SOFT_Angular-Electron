import { Component, inject, input, OnInit, signal } from '@angular/core';
import { TicketPantalla } from './ticket-pantalla/ticket-pantalla';
import { ComandasService } from '../../servicios/ComandasService';
import { ComandaModel } from '../../interfaces/comanda';
import { BumpBar } from '../bump-bar/bump-bar';
import { ConfigService } from '../../servicios/ConfigService';
import { NavegacionService } from '../../servicios/NavegacionService';
import { ConfiguracionPantallaLocal } from '../../servicios/ConfiguracionPantallaLocal';

@Component({
  selector: 'app-pantalla-comandas',
  imports: [TicketPantalla, BumpBar],
  templateUrl: './pantalla-comandas.html',
  styleUrl: './pantalla-comandas.css',
  host: {
    // Variables CSS heredadas por todo lo que está adentro (incluida
    // fila-producto, aunque quede varios componentes más abajo), para que
    // el tamaño de la marca de agua y de la letra de producto sean
    // configurables desde la pantalla de Configuración.
    '[style.--marca-agua-ancho.px]': 'svrConfig.tamanoMarcaAgua',
    '[style.--tamano-descripcion.px]': 'svrConfig.tamanoLetraDescripcion',
  },
})
export class PantallaComandas implements OnInit {
  svrConfig = inject(ConfigService);
  srvNavegacion = inject(NavegacionService);
  srvComandas = inject(ComandasService);
  private readonly configuracionLocal = inject(ConfiguracionPantallaLocal);

  imagenMarcaAgua = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const configuracion = this.configuracionLocal.obtener();

      if (!configuracion) {
        console.error('No se pudo obtener la configuración de pantalla guardada.');
        return;
      }

      this.svrConfig.asignarConfiguracion(configuracion);
      this.imagenMarcaAgua.set(configuracion.imagenMarcaAgua ?? null);
      this.srvComandas.resincronizar();
    } catch (error) {
      console.error('No se pudo cargar la marca de agua:', error);
    }
  }

  onProductoSeleccionado(idProducto: ComandaModel) {
    console.log('Producto seleccionado:', idProducto);
  }
}
