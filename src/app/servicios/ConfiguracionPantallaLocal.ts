import { Injectable } from '@angular/core';
import { ConfiguracionPantalla, ResultadoGuardado } from '../interfaces/configuracion';

const CLAVE_ALMACENAMIENTO = 'kds-configuracion-pantalla';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionPantallaLocal {
  guardar(datos: ConfiguracionPantalla): ResultadoGuardado {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));

      return { correcto: true };
    } catch (error) {
      console.error('Error al guardar la configuración de pantalla:', error);

      return {
        correcto: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  obtener(): ConfiguracionPantalla | null {
    const contenido = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (!contenido) {
      return null;
    }

    return JSON.parse(contenido) as ConfiguracionPantalla;
  }
}
