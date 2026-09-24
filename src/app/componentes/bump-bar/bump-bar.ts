import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
    };

    this.srvBack.bumpComanda(datos).subscribe({
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
