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
      error: (error) => console.error(`No se pudo enviar el bump de la comanda ${com.idComanda}:`, error),
    });

    console.log(datos);
    // Se quita de pantalla sin esperar la respuesta del backend.
    //this.srvNavegacion.Bump();
  }
}
