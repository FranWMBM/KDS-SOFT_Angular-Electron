import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map, take, timeout } from 'rxjs';
import { ProductoMonitor } from '../interfaces/productos-en-produccion';

export interface MonitorCocina {
  // idmonitor es varchar(5) en la base de datos (ej. "01", "02"), no numérico.
  id: string;
  nombre: string;
}

interface MensajeEntrante {
  id?: string;
  evento?: string;
  datos?: unknown;
  error?: string;
}

const RETRASO_RECONEXION_MS = 2000;
const TIEMPO_ESPERA_RESPUESTA_MS = 10000;

// Todo (monitores, registros) viaja por este único WebSocket. Se manda
// {id, accion, datos} y el backend responde {id, evento, datos} con el
// mismo id, para saber qué respuesta es de qué pedido. Las credenciales de
// SQL Server ya no se piden por acá: se declaran directamente en
// backend/.env (ver sembrarCredencialesDesdeEnv en configuracion-store.ts).
@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private readonly _nuevosRegistros = new Subject<ProductoMonitor[]>();
  readonly nuevosRegistros$ = this._nuevosRegistros.asObservable();

  // El backend es una sola instancia compartida: al conectar, cada pantalla
  // recibe también el estado completo conocido hasta ese momento (no solo
  // lo que cambie de ahí en más).
  private readonly _registrosActuales = new Subject<ProductoMonitor[]>();
  readonly registrosActuales$ = this._registrosActuales.asObservable();

  private readonly mensajes$ = new Subject<MensajeEntrante>();

  private socket?: WebSocket;
  private siguienteId = 0;

  constructor() {
    this.conectarWebSocket();
  }

  obtenerMonitores(): Observable<MonitorCocina[]> {
    return this.enviarSolicitud('obtener-monitores');
  }

  obtenerRegistrosActuales(): Observable<ProductoMonitor[]> {
    return this.enviarSolicitud('obtener-registros');
  }

  private enviarSolicitud<T>(accion: string, datos?: unknown): Observable<T> {
    const id = `${accion}-${++this.siguienteId}`;

    const respuesta$ = this.mensajes$.pipe(
      filter((mensaje) => mensaje.id === id),
      take(1),
      timeout(TIEMPO_ESPERA_RESPUESTA_MS),
      map((mensaje) => {
        if (mensaje.error) {
          throw new Error(mensaje.error);
        }

        return mensaje.datos as T;
      }),
    );

    this.enviarCuandoAbra({ id, accion, datos });

    return respuesta$;
  }

  private enviarCuandoAbra(mensaje: unknown): void {
    const cuerpo = JSON.stringify(mensaje);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(cuerpo);
      return;
    }

    this.socket?.addEventListener('open', () => this.socket?.send(cuerpo), { once: true });
  }

  private conectarWebSocket(): void {
    const protocolo = location.protocol === 'https:' ? 'wss' : 'ws';
    this.socket = new WebSocket(`${protocolo}://${location.host}/ws`);

    this.socket.addEventListener('message', (evento) => {
      const mensaje = JSON.parse(evento.data as string) as MensajeEntrante;

      // Respuesta a una solicitud puntual (obtener-monitores, etc.).
      if (mensaje.id) {
        this.mensajes$.next(mensaje);
        return;
      }

      // Push del servidor, no atado a ninguna solicitud.
      if (mensaje.evento === 'nuevos-registros') {
        this._nuevosRegistros.next(mensaje.datos as ProductoMonitor[]);
      } else if (mensaje.evento === 'registros-actuales') {
        this._registrosActuales.next(mensaje.datos as ProductoMonitor[]);
      }
    });

    // Si se corta la conexión (o falla al abrir), reintenta pasado un
    // momento: una pantalla KDS debe quedar recibiendo datos todo el día.
    this.socket.addEventListener('close', () => {
      setTimeout(() => this.conectarWebSocket(), RETRASO_RECONEXION_MS);
    });

    this.socket.addEventListener('error', () => {
      this.socket?.close();
    });
  }
}
