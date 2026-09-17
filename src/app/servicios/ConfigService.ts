import { Injectable, signal } from '@angular/core';
import { ConfiguracionKDS } from '../interfaces/configuracion';
import { ComandaModel } from '../interfaces/comanda';


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

  public paginaActual = signal(0);

  public asignarConfiguracion(configuraciones: ConfiguracionKDS): void {
    this.paginaActual.set(0);
    this.comandas.set([]);
    this.comandaSeleccionada = undefined;
    this.filasPorTicket = configuraciones.filasTicket;
    this.columnas = configuraciones.columnasPorPagina;
    this.filas = configuraciones.filasPorPagina;
    this.columnasPorPagina = this.columnas * this.filas;  
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
