import { computed, inject, Injectable, signal } from '@angular/core';
import { ComandaModel } from '../interfaces/comanda';
import { ConfigService } from './config-service';
import { ComandasService } from './comandas-service';

@Injectable({
  providedIn: 'root',
})
export class NavegacionService {
  private readonly configService = inject(ConfigService);

  public get seleccion(): ComandaModel | undefined {
    return this.configService.comandaSeleccionada;
  }

  readonly paginaActual = this.configService.paginaActual;

  private readonly _comandasVisibles = signal<ComandaModel[]>([]);

  private readonly _todasLasColumnas = computed(() =>
    this.configService.comandas().flatMap((comanda) =>
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
      comandasUnicas.set(comanda.idComanda, comanda);
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

  public Bump(bumpeada: ComandaModel | undefined = this.seleccion): void {
    if (!bumpeada) return;

    this.configService.comandas.update((comandas) =>
      comandas.filter((comanda) => comanda.idComanda !== bumpeada.idComanda),
    );

    // Si el usuario ya movió la selección a otra comanda, se respeta.
    if (bumpeada !== this.seleccion) return;

    this.configService.seleccionarComanda(undefined);

    const primeraVisible = this.comandasVisibles()[0];

    if (primeraVisible) {
      this.configService.seleccionarComanda(primeraVisible);
    } else if (this.configService.comandas().length > 0) {
      this.anteriorPagina();
    }
  }
}
