import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BackendService, MonitorCocina } from '../../../servicios/BackendService';
import { ConfiguracionPantallaLocal } from '../../../servicios/ConfiguracionPantallaLocal';

@Component({
  selector: 'app-pantalla',
  imports: [ReactiveFormsModule],
  templateUrl: './pantalla.html',
  styleUrl: './pantalla.css',
})
export class Pantalla implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly backend = inject(BackendService);
  private readonly configuracionLocal = inject(ConfiguracionPantallaLocal);

  readonly imagenPreview = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly cargandoMonitores = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly errorMonitores = signal<string | null>(null);

  monitores: MonitorCocina[] = [];

  readonly formulario = this.fb.group({
    filasTicket: [7, [Validators.required, Validators.min(5)]],
    columnasPorPagina: [3, [Validators.required, Validators.min(3)]],
    filasPorPagina: [1, [Validators.required, Validators.min(1)]],
    monitorCocina: [null as string | null, Validators.required],
    tamanoMarcaAgua: [320, [Validators.required, Validators.min(60), Validators.max(800)]],
    tamanoLetraDescripcion: [16, [Validators.required, Validators.min(8), Validators.max(40)]],
  });

  async ngOnInit(): Promise<void> {
    try {
      const datos = this.configuracionLocal.obtener();

      if (datos) {
        this.formulario.patchValue({
          filasTicket: datos.filasTicket,
          columnasPorPagina: datos.columnasPorPagina,
          filasPorPagina: datos.filasPorPagina,
          monitorCocina: datos.monitorCocina,
          // "?? valor por defecto" cubre configuraciones guardadas antes de
          // que existieran estos dos campos.
          tamanoMarcaAgua: datos.tamanoMarcaAgua ?? 320,
          tamanoLetraDescripcion: datos.tamanoLetraDescripcion ?? 16,
        });

        this.imagenPreview.set(datos.imagenMarcaAgua ?? null);
      }
    } catch (error) {
      console.error('No se pudo leer la configuración de pantalla:', error);
      this.mensaje.set('No se pudo cargar la configuración de pantalla.');
    }

    await this.cargarMonitores();
  }

  async cargarMonitores(): Promise<void> {
    this.cargandoMonitores.set(true);
    this.errorMonitores.set(null);
    this.monitores = [];

    try {
      this.monitores = await firstValueFrom(this.backend.obtenerMonitores());

      const seleccionado = this.formulario.value.monitorCocina;

      if (
        seleccionado &&
        !this.monitores.some((monitor) => monitor.id === seleccionado)
      ) {
        this.formulario.patchValue({ monitorCocina: null });
      }
    } catch (error) {
      console.error('No se pudieron cargar los monitores:', error);
      this.errorMonitores.set(
        'No se pudieron cargar los monitores. Revisa la conexión.',
      );
    } finally {
      this.cargandoMonitores.set(false);
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensaje.set(null);

    try {
      const resultado = this.configuracionLocal.guardar({
        filasTicket: Number(this.formulario.value.filasTicket),
        columnasPorPagina: Number(this.formulario.value.columnasPorPagina),
        filasPorPagina: Number(this.formulario.value.filasPorPagina),
        monitorCocina: this.formulario.value.monitorCocina!,
        imagenMarcaAgua: this.imagenPreview(),
        tamanoMarcaAgua: Number(this.formulario.value.tamanoMarcaAgua),
        tamanoLetraDescripcion: Number(this.formulario.value.tamanoLetraDescripcion),
      });

      if (resultado.correcto) {
        this.router.navigate(['/pantalla-comandas']);
      } else {
        this.mensaje.set(
          resultado.error ?? 'No se pudo guardar la pantalla.',
        );
      }
    } catch (error) {
      console.error('Error al guardar la configuración de pantalla:', error);
      this.mensaje.set('Ocurrió un error al guardar la pantalla.');
    } finally {
      this.guardando.set(false);
    }
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      alert('El archivo seleccionado debe ser una imagen.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.imagenPreview.set(reader.result);
      }
    };

    reader.readAsDataURL(archivo);
  }

  quitarImagen(): void {
    this.imagenPreview.set(null);
  }
}
