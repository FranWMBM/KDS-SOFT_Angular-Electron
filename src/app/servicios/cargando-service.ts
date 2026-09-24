import { computed, Injectable, signal } from '@angular/core';

// Controla la pantalla de carga que cubre toda la app. Lleva un contador
// en vez de un booleano para que, si hay dos operaciones a la vez, la
// pantalla no se quite hasta que terminen ambas.
@Injectable({
  providedIn: 'root',
})
export class CargandoService {
  private readonly pendientes = signal(0);
  readonly activo = computed(() => this.pendientes() > 0);

  mostrar(): void {
    this.pendientes.update((n) => n + 1);
  }

  ocultar(): void {
    this.pendientes.update((n) => Math.max(0, n - 1));
  }
}
