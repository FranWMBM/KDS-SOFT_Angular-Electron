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

  constructor() {

    window.electronAPI.onNuevosRegistros(
      (registros: ProductoMonitor[]) => {

        console.log(
          'Angular recibió nuevos registros:',
          registros
        );

        this.AgregarRegistros(registros);

      }
    );

  }

  // readonly todasLasColumnas = computed(() => {
  //   return this._comandas().flatMap((comanda) => comanda.tickets);
  // });

  readonly todasLasColumnas = computed(() => {
    console.log("calculando columnas");
    return this._comandas().flatMap((comanda) =>
      comanda.tickets.map((columna, indice) => ({
        comanda,
        columna,
        indiceColumna: indice,
      })),
    );
  });

  readonly totalPaginas = computed(() => {
    const totalColumnas = this.todasLasColumnas().length;

    return Math.ceil(totalColumnas / this.svrConfig.columnasPorPagina);
  });

  readonly columnasVisibles = computed(() => {
    const inicio = this._paginaActual() * this.svrConfig.columnasPorPagina;

    return this.todasLasColumnas().slice(inicio, inicio + this.svrConfig.columnasPorPagina);
  });

  // AgregarRegistros(registros: ProductoMonitor[]) {
  //   // Agrupar los registros por folio
  //   const grupos = new Map<number, ProductoMonitor[]>();

  //   for (const registro of registros) {
  //     const idComanda = registro.folio;

  //     if (!grupos.has(idComanda)) {
  //       grupos.set(idComanda, []);
  //     }

  //     grupos.get(idComanda)!.push(registro);
  //   }

  //   this._comandas.update((actual) => {
  //     const comandas = [...actual];

  //     for (const productos of grupos.values()) {
  //       // Agregar los productos
  //       for (const producto of productos) {
  //         let comanda = comandas.find((comanda) => comanda.id_comanda === producto.folio);

  //         if (!comanda) {
  //           comanda = new ComandaModel(producto);
  //           comandas.push(comanda);
  //         } else {
  //           comanda.agregarProducto(producto);
  //         }
  //       }
  //     }

  //     return comandas;
  //   });
  // }

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
        let comanda = comandas.find(
          (comanda) => comanda.id_comanda === producto.folio
        );

        if (!comanda) {
          comanda = new ComandaModel(producto, this.svrConfig.filasPorTicket);
          comandas.push(comanda);
        } else {
          comanda.agregarProducto(producto);
        }
      }
    }

    // Si no hay ninguna comanda seleccionada,
    // seleccionar la primera
    const haySeleccionada = comandas.some((comanda) =>
      comanda.tickets.some((ticket) => ticket.seleccionado())
    );

    if (!haySeleccionada && comandas.length > 0) {
      const primeraComanda = comandas[0];

      for (const ticket of primeraComanda.tickets) {
        ticket.seleccionado.set(true)
      }
    }

    return comandas;
  });
}

  siguientePagina(): void {
    if (this._paginaActual() < this.totalPaginas() - 1) {
      this._paginaActual.update((pagina) => pagina + 1);
    }
  }

  paginaAnterior(): void {
    if (this._paginaActual() > 0) {
      this._paginaActual.update((pagina) => pagina - 1);
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas()) {
      this._paginaActual.set(pagina);
    }
  }

  primeraPagina(): void {
    this._paginaActual.set(0);
  }

  ultimaPagina(): void {
    const ultima = Math.max(0, this.totalPaginas() - 1);

    this._paginaActual.set(ultima);
  }

  comandaAnterior(): void {
  const visibles = this.columnasVisibles();

  if (visibles.length === 0) {
    return;
  }

  // Buscar la comanda actualmente seleccionada
  const indiceActual = visibles.findIndex(
    (item) => item.columna.seleccionado()
  );

  // Si no hay ninguna seleccionada, seleccionamos la primera
  if (indiceActual === -1) {
    this.seleccionarComanda(visibles[0].comanda);
    return;
  }

  // Buscar la comanda anterior DIFERENTE
  let indiceAnterior = indiceActual - 1;

  while (
    indiceAnterior >= 0 &&
    visibles[indiceAnterior].comanda.id_comanda ===
      visibles[indiceActual].comanda.id_comanda
  ) {
    indiceAnterior--;
  }

  // Existe una comanda anterior en la página actual
  if (indiceAnterior >= 0) {
    this.seleccionarComanda(visibles[indiceAnterior].comanda);
    return;
  }

  // No hay anterior en esta página.
  // Intentamos ir a la página anterior.
  if (this._paginaActual() > 0) {
    this._paginaActual.update((pagina) => pagina - 1);

    const nuevaPagina = this.columnasVisibles();

    if (nuevaPagina.length > 0) {
      // Seleccionar la última comanda de la página anterior
      this.seleccionarComanda(
        nuevaPagina[nuevaPagina.length - 1].comanda
      );
    }
  }
}

comandaSiguiente(): void {
  console.log('siguiente');
  const visibles = this.columnasVisibles();

  if (visibles.length === 0) {
    return;
  }

  // Buscar la comanda actualmente seleccionada
  const indiceActual = visibles.findIndex(
    (item) => item.columna.seleccionado()
  );

  // Si no hay ninguna seleccionada, seleccionamos la primera
  if (indiceActual === -1) {
    this.seleccionarComanda(visibles[0].comanda);
    return;
  }

  // Buscar la siguiente comanda DIFERENTE
  let indiceSiguiente = indiceActual + 1;

  while (
    indiceSiguiente < visibles.length &&
    visibles[indiceSiguiente].comanda.id_comanda ===
      visibles[indiceActual].comanda.id_comanda
  ) {
    indiceSiguiente++;
  }

  // Existe una comanda siguiente en la página actual
  if (indiceSiguiente < visibles.length) {
    this.seleccionarComanda(visibles[indiceSiguiente].comanda);
    return;
  }

  // No hay siguiente en esta página.
  // Intentamos ir a la siguiente página.
  if (this._paginaActual() < this.totalPaginas() - 1) {
    this._paginaActual.update((pagina) => pagina + 1);

    const nuevaPagina = this.columnasVisibles();

    if (nuevaPagina.length > 0) {
      // Seleccionar la primera comanda de la siguiente página
      this.seleccionarComanda(
        nuevaPagina[0].comanda
      );
    }
  }
}

private seleccionarComanda(comandaSeleccionada: ComandaModel): void {
  this._comandas.update((comandas) => {
    for (const comanda of comandas) {

      const esLaSeleccionada =
        comanda.id_comanda === comandaSeleccionada.id_comanda;

      // Recorrer todos los tickets de la comanda
      for (const ticket of comanda.tickets) {
        ticket.seleccionado.set(esLaSeleccionada);
      }
    }

    return [...comandas];
  });
}
}
