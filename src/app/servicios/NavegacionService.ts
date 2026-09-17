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

  public get seleccion(): ComandaModel | undefined {
    return this.configService.comandaSeleccionada;
  }

  readonly paginaActual = this.configService.paginaActual;
  
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
    const indiceInicial = this.paginaActual() * columnasPorPagina;
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

  public siguienteComanda(): void {
    const visibles = this.comandasVisibles();
    const indice = visibles.indexOf(this.seleccion!);

    if (indice === -1) return;

    if (indice < visibles.length - 1) {
      this.configService.seleccionarComanda(visibles[indice + 1]);
      return;
    }

    const esUltimaPagina = this.paginaActual() >= this.totalPaginas() - 1;

    if (!esUltimaPagina) {
      this.siguientePagina();
    }
  }

  public anteriorComanda(): void {
    const visibles = this.comandasVisibles();
    const indice = visibles.indexOf(this.seleccion!);

    if (indice === -1) return;

    if (indice > 0) {
      this.configService.seleccionarComanda(visibles[indice - 1]);
      return;
    }

    if (this.paginaActual() > 0) {
      this.anteriorPagina();
    }
  }

  public siguientePagina(): void {
    this.paginaActual.update((pagina) => pagina + 1);

    this.configService.seleccionarComanda(this.comandasVisibles()[0]);
  }

  public anteriorPagina(): void {
    this.paginaActual.update((pagina) => pagina - 1);

    const total = this.comandasVisibles().length;
    this.configService.seleccionarComanda(this.comandasVisibles()[total - 1]);
  }

  public Bump(): void {
    this.comandasService.Bump();

    const primeraVisible = this.comandasVisibles()[0];

    if (primeraVisible) {
      this.configService.seleccionarComanda(primeraVisible);
    } else if (this.comandasService.comandas().length > 0) {
      this.anteriorPagina();
    }
  }
}
