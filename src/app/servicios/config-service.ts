import { Injectable, signal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ConfiguracionPantalla } from '../interfaces/configuracion';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  public comandas = signal<ComandaModel[]>([]);
  public comandaSeleccionada?: ComandaModel;

  filasPorTicket = 16;
  columnas = 6;
  filas = 1;
  columnasPorPagina = this.columnas * this.filas;
  tamanoMarcaAgua = 320;
  opacidadMarcaAgua = 50;
  tamanoLetraDescripcion = 16;

  public paginaActual = signal(0);

  // Monitor elegido en Configuración; null mientras no se haya guardado uno.
  public readonly idMonitor = signal<string | null>(null);
  public readonly nombreMonitor = signal<string | null>(null);

  public asignarConfiguracion(configuraciones: ConfiguracionPantalla): void {
    this.idMonitor.set(configuraciones.monitorCocina ?? null);
    this.nombreMonitor.set(configuraciones.nombreMonitor ?? null);
    this.paginaActual.set(0);
    this.comandas.set([]);
    this.comandaSeleccionada = undefined;
    this.filasPorTicket = configuraciones.filasTicket;
    this.columnas = configuraciones.columnasPorPagina;
    this.filas = configuraciones.filasPorPagina;
    this.columnasPorPagina = this.columnas * this.filas;
    // "?? valor por defecto" cubre configuraciones guardadas antes de que
    // existieran estos campos.
    this.tamanoMarcaAgua = configuraciones.tamanoMarcaAgua ?? 320;
    this.opacidadMarcaAgua = configuraciones.opacidadMarcaAgua ?? 50;
    this.tamanoLetraDescripcion = configuraciones.tamanoLetraDescripcion ?? 16;
  }

  public seleccionarComanda(comanda: ComandaModel | undefined): void {
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
}
