import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ProductoMonitor } from '../interfaces/productosenproduccion';
import { ConfigService } from './ConfigService';
import { BackendService } from './BackendService';

@Injectable({
  providedIn: 'root',
})
export class ComandasService {
  // seleccionado? : ComandaModel = undefined;
  svrConfig = inject(ConfigService);
  private readonly backend = inject(BackendService);

  readonly comandas = this.svrConfig.comandas;

  public get comandaSeleccionada(): ComandaModel | undefined {
    return this.svrConfig.comandaSeleccionada;
  }

  //readonly comandas = this._comandas.asReadonly();
  private _paginaActual = signal(0);
  readonly paginaActual = this._paginaActual.asReadonly();


  // Evita duplicar productos en un ticket si el snapshot inicial se vuelve
  // a recibir (por ejemplo, al reconectar el WebSocket tras un corte).
  private readonly registrosVistos = new Set<string>();

  constructor() {
    this.backend.registrosActuales$.subscribe((registros: ProductoMonitor[]) => {
      console.log('Angular recibió el estado actual de registros:', registros);
      this.AgregarRegistros(registros);
    });

    this.backend.nuevosRegistros$.subscribe((registros: ProductoMonitor[]) => {
      console.log('Angular recibió nuevos registros:', registros);
      this.AgregarRegistros(registros);
    });
  }

  // Vuelve a pedir el estado actual de registros al backend. Necesario
  // porque cambiar la configuración de pantalla vacía el signal de
  // "comandas" (ver ConfigService.asignarConfiguracion), y sin esto el
  // servicio nunca los vuelve a pintar: ya los tenía marcados como vistos
  // y el backend no los reenvía por WebSocket a menos que sean nuevos.
  resincronizar(): void {
    this.registrosVistos.clear();

    this.backend.obtenerRegistrosActuales().subscribe((registros) => {
      this.AgregarRegistros(registros);
    });
  }

  AgregarRegistros(registros: ProductoMonitor[]) {
    const grupos = new Map<number, ProductoMonitor[]>();

    for (const registro of registros) {
      const clave = `${registro.folio}-${registro.movimiento}`;

      if (this.registrosVistos.has(clave)) {
        continue;
      }

      this.registrosVistos.add(clave);

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
