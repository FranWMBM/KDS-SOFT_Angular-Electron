import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ProductoMonitor } from '../interfaces/productosenproduccion';
import { ConfigService } from './ConfigService';

@Injectable({
  providedIn: 'root',
})
export class ComandasService {
  // seleccionado? : ComandaModel = undefined;
  svrConfig = inject(ConfigService);

  readonly comandas = this.svrConfig.comandas;

  public get comandaSeleccionada(): ComandaModel | undefined {
    return this.svrConfig.comandaSeleccionada;
  }

  //readonly comandas = this._comandas.asReadonly();
  private _paginaActual = signal(0);
  readonly paginaActual = this._paginaActual.asReadonly();
  

  constructor() {
    if (!window.electronAPI?.onNuevosRegistros) {
      return;
    }

    window.electronAPI.onNuevosRegistros((registros: ProductoMonitor[]) => {
      console.log('Angular recibió nuevos registros:', registros);
      this.AgregarRegistros(registros);
    });
  }

  AgregarRegistros(registros: ProductoMonitor[]) {
    const grupos = new Map<number, ProductoMonitor[]>();

    for (const registro of registros) {
      const idComanda = registro.folio;

      if (!grupos.has(idComanda)) {
        grupos.set(idComanda, []);
      }

      grupos.get(idComanda)!.push(registro);
    }

    this.comandas.update((actual) => {
      const comandas = [...actual];

      for (const productos of grupos.values()) {
        for (const producto of productos) {
          let comanda = comandas.find((comanda) => comanda.id_comanda === producto.folio);

          if (!comanda) {
            comanda = new ComandaModel(producto, this.svrConfig.filasPorTicket);
            comandas.push(comanda);
          } else {
            comanda.agregarProducto(producto);
          }
        }
      }

      if (!this.comandaSeleccionada) {
        this.svrConfig.seleccionarComanda(comandas[0]);
      }

      return comandas;
    });
  }
}
