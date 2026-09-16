import { computed, inject, Injectable, signal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ConfigService } from './ConfigService';
import { ComandasService } from './ComandasService';

@Injectable({
  providedIn: 'root',
})
export class NavegacionService {
  private readonly comandasService = inject(ComandasService);
  private readonly configService = inject(ConfigService);

  private readonly _paginaActual = signal(0);
  readonly paginaActual = this._paginaActual.asReadonly();

  private comandaSeleccionada?: ComandaModel;
  private readonly _comandasVisibles = signal<ComandaModel[]>([]);

  private readonly _todasLasColumnas = computed(() =>
    this.comandasService.comandas().flatMap((comanda) =>
      comanda.tickets.map((columna, indiceColumna) => ({
        comanda,
        columna,
        indiceColumna,
      })),
    ),

  );

  readonly totalPaginas = computed(() => {
    const totalColumnas = this._todasLasColumnas().length;
    const columnasPorPagina = this.configService.columnasPorPagina;

    if (columnasPorPagina <= 0) {
      return 0;
    }

    return Math.ceil(totalColumnas / columnasPorPagina);
  });

  readonly columnasVisibles = computed(() => {
  const columnasPorPagina = this.configService.columnasPorPagina;
  const indiceInicial = this._paginaActual() * columnasPorPagina;
  const indiceFinal = indiceInicial + columnasPorPagina;

  return this._todasLasColumnas().slice(indiceInicial, indiceFinal);
});

readonly comandasVisibles = computed(() => {
  const comandasUnicas = new Map<number, ComandaModel>();

  for (const { comanda } of this.columnasVisibles()) {
    comandasUnicas.set(comanda.id_comanda, comanda);
  }

  return Array.from(comandasUnicas.values());
});

  siguientePagina(): void {
    const ultimaPagina = this.totalPaginas() - 1;

    if (this._paginaActual() < ultimaPagina) {
      this._paginaActual.update((paginaActual) => paginaActual + 1);
    }
  }

  paginaAnterior(): void {
    if (this._paginaActual() > 0) {
      this._paginaActual.update((paginaActual) => paginaActual - 1);
    }
  }

  irAPagina(pagina: number): void {
    const paginaValida = pagina >= 0 && pagina < this.totalPaginas();

    if (paginaValida) {
      this._paginaActual.set(pagina);
    }
  }

  primeraPagina(): void {
    this._paginaActual.set(0);
  }

  ultimaPagina(): void {
    const indiceUltimaPagina = Math.max(0, this.totalPaginas() - 1);

    this._paginaActual.set(indiceUltimaPagina);
  }

  comandaAnterior(): void {
    const columnasVisibles = this.columnasVisibles();

    if (columnasVisibles.length === 0) {
      return;
    }

    const indiceSeleccionado = columnasVisibles.findIndex(({ columna }) => columna.seleccionado());

    if (indiceSeleccionado === -1) {
      this.seleccionarComanda(columnasVisibles[0].comanda);
      return;
    }

    const comandaActual = columnasVisibles[indiceSeleccionado].comanda;
    let indiceAnterior = indiceSeleccionado - 1;

    while (
      indiceAnterior >= 0 &&
      this.esLaMismaComanda(columnasVisibles[indiceAnterior].comanda, comandaActual)
    ) {
      indiceAnterior--;
    }

    if (indiceAnterior >= 0) {
      this.seleccionarComanda(columnasVisibles[indiceAnterior].comanda);
      return;
    }

    if (this._paginaActual() === 0) {
      return;
    }

    this._paginaActual.update((paginaActual) => paginaActual - 1);

    const columnasPaginaAnterior = this.columnasVisibles();
    const ultimaColumna = columnasPaginaAnterior.at(-1);

    if (ultimaColumna) {
      this.seleccionarComanda(ultimaColumna.comanda);
    }
  }

  comandaSiguiente(): void {
    const columnasVisibles = this.columnasVisibles();

    if (columnasVisibles.length === 0) {
      return;
    }

    const indiceSeleccionado = columnasVisibles.findIndex(({ columna }) => columna.seleccionado());

    if (indiceSeleccionado === -1) {
      this.seleccionarComanda(columnasVisibles[0].comanda);
      return;
    }

    const comandaActual = columnasVisibles[indiceSeleccionado].comanda;
    let indiceSiguiente = indiceSeleccionado + 1;

    while (
      indiceSiguiente < columnasVisibles.length &&
      this.esLaMismaComanda(columnasVisibles[indiceSiguiente].comanda, comandaActual)
    ) {
      indiceSiguiente++;
    }

    if (indiceSiguiente < columnasVisibles.length) {
      this.seleccionarComanda(columnasVisibles[indiceSiguiente].comanda);
      return;
    }

    const ultimaPagina = this.totalPaginas() - 1;

    if (this._paginaActual() >= ultimaPagina) {
      return;
    }

    this._paginaActual.update((paginaActual) => paginaActual + 1);

    const columnasPaginaSiguiente = this.columnasVisibles();
    const primeraColumna = columnasPaginaSiguiente[0];

    if (primeraColumna) {
      this.seleccionarComanda(primeraColumna.comanda);
    }
  }

  private seleccionarComanda(comanda: ComandaModel): void {
    if (this.comandaSeleccionada === comanda) {
      return;
    }

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

  private esLaMismaComanda(primeraComanda: ComandaModel, segundaComanda: ComandaModel): boolean {
    return primeraComanda.id_comanda === segundaComanda.id_comanda;
  }
}
