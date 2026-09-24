import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CargandoService } from '../../servicios/cargando-service';
import { NavegacionService } from '../../servicios/navegacion-service';
import { BackendService } from '../../servicios/backend-service';
import { ConfigService } from '../../servicios/config-service';
import { ESTADO_BUMPEADO, RegistrosBumpeados } from '../../interfaces/registros-bumpeados';

@Component({
  selector: 'app-bump-bar',
  imports: [],
  templateUrl: './bump-bar.html',
  styleUrl: './bump-bar.css',
})
export class BumpBar {
  srvNavegacion = inject(NavegacionService);
  private readonly srvConfig = inject(ConfigService);
  private readonly srvBack = inject(BackendService);
  private readonly srvCargando = inject(CargandoService);

  constructor(private router: Router) {}

  abrirConfiguracion(): void {
    this.router.navigate(['/configuracion']);
  }

  bump(): void {
    const com = this.srvConfig.comandaSeleccionada;
    if (!com) return;

    const datos: RegistrosBumpeados = {
      idComanda: com.idComanda,
      movimientos: com.movimientos,
      estado: ESTADO_BUMPEADO,
      idMonitor: this.srvConfig.idMonitor(),
    };

    this.srvCargando.mostrar();

    // finalize corre después de terminar next (quitar la comanda o
    // redibujarla) o después de un error/timeout: solo ahí se quita la carga.
    this.srvBack
      .bumpComanda(datos)
      .pipe(finalize(() => this.srvCargando.ocultar()))
      .subscribe({
        next: (respuesta) => {
          console.log('Respuesta del backend al bump:', respuesta);

          const quedanProductos = com.eliminarProductos(respuesta.movimientos);

          if (!quedanProductos) {
            this.srvNavegacion.Bump();
            return;
          }

          com.redibujarColumnas();
          // Los tickets cambiaron por dentro: se emite una lista nueva para
          // que se recalculen las columnas visibles.
          this.srvConfig.comandas.update((lista) => [...lista]);

          // Los tickets son nuevos, hay que volver a marcarlos como seleccionados.
          if (this.srvConfig.comandaSeleccionada === com) {
            this.srvConfig.seleccionarComanda(com);
          }
        },
        error: (error) =>
          console.error(`No se pudo enviar el bump de la comanda ${com.idComanda}:`, error),
      });

    console.log(datos);
  }
}
