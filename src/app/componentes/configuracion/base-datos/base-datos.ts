import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-base-datos',
  imports: [ReactiveFormsModule],
  templateUrl: './base-datos.html',
  styleUrl: './base-datos.css',
})
export class BaseDatos {
  private readonly fb = inject(FormBuilder);

  readonly guardado = output<void>();
  readonly mostrarContrasena = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal<string | null>(null);

  readonly formulario = this.fb.group({
    servidor: ['', Validators.required],
    baseDatos: ['', Validators.required],
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    if (!window.electronAPI) return;

    try {
      const datos = await window.electronAPI.obtenerBaseDatos();
      if (datos) {
        this.formulario.patchValue(datos);
      }
    } catch (error) {
      console.error('No se pudo leer bd.config:', error);
      this.mensaje.set('No se pudo cargar la conexión guardada.');
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!window.electronAPI) return;

    this.guardando.set(true);
    this.mensaje.set(null);

    try {
      const resultado = await window.electronAPI.guardarBaseDatos({
        servidor: this.formulario.value.servidor!.trim(),
        baseDatos: this.formulario.value.baseDatos!.trim(),
        usuario: this.formulario.value.usuario!.trim(),
        contrasena: this.formulario.value.contrasena!,
      });

      if (!resultado.correcto) {
        this.mensaje.set(resultado.error ?? 'No se pudo guardar la conexión.');
        return;
      }

      this.guardado.emit();
    } catch (error) {
      console.error('Error al guardar bd.config:', error);
      this.mensaje.set('Ocurrió un error al guardar la conexión.');
    } finally {
      this.guardando.set(false);
    }
  }

  cambiarVisibilidadContrasena(): void {
    this.mostrarContrasena.update((valor) => !valor);
  }
}
