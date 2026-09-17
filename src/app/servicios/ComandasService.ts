import { computed, inject, Injectable, signal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ProductoMonitor } from '../interfaces/productosenproduccion';
import { ConfigService } from './ConfigService';

@Injectable({
  providedIn: 'root',
})
export class ComandasService {
  // seleccionado? : ComandaModel = undefined;
  svrConfig = inject(ConfigService);
  private _comandas = signal<ComandaModel[]>([]);
  readonly comandas = this._comandas.asReadonly();
  private _paginaActual = signal(0);
  readonly paginaActual = this._paginaActual.asReadonly();
  public comandaSeleccionada?: ComandaModel;

  // constructor() {
  //   // window.electronAPI.onNuevosRegistros(
  //   //   (registros: ProductoMonitor[]) => {
  //   //     console.log(
  //   //       'Angular recibió nuevos registros:',
  //   //       registros
  //   //     );
  //   //     this.AgregarRegistros(registros);
  //   //   }
  //   // );
  // }

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

    this._comandas.update((actual) => {
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
        this.seleccionarComanda(comandas[0]);
      }

      return comandas;
    });
  }

  public seleccionarComanda(comanda: ComandaModel | undefined): void {
    // if (this.comandaSeleccionada === comanda) {
    //   return;
    // }

    this.actualizarSeleccion(this.comandaSeleccionada, false);

    this.comandaSeleccionada = comanda;

    this.actualizarSeleccion(this.comandaSeleccionada, true);
  }

  private actualizarSeleccion(comanda: ComandaModel | undefined, seleccionada: boolean): void {
    if (!comanda) {
      return;
    }

    for (const ticket of comanda.tickets) {
      ticket.seleccionado.set(seleccionada);
    }
  }

  public Bump(): void {
    const seleccionada = this.comandaSeleccionada;
    if (!seleccionada) return;

    this._comandas.update((comandas) =>
      comandas.filter((comanda) => comanda.id_comanda !== seleccionada.id_comanda),
    );

    this.seleccionarComanda(undefined);
  }
}
