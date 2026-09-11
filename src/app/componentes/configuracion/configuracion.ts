import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export interface MonitorCocina {
  id: number;
  nombre: string;
}

export interface ConfiguracionKDS {
  servidor: string;
  baseDatos: string;
  usuario: string;
  contrasena: string;

  filasTicket: number;

  columnasPorPagina: number;
  filasPorPagina: number;

  monitorCocina: number | null;

  imagenMarcaAgua: string | null;
}

@Component({
  selector: 'app-configuracion',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  formulario: FormGroup;

  mostrarContrasena = signal(false);

  imagenPreview = signal<string | null>(null);

  // Más adelante esta lista puede venir de SQL Server
  monitores: MonitorCocina[] = [
    { id: 1, nombre: 'COCINA' },
    { id: 2, nombre: 'EXPO' },
    { id: 3, nombre: 'BAR' },
    { id: 4, nombre: 'POSTRES' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {

    this.formulario = this.fb.group({

      // Base de datos
      servidor: ['', Validators.required],
      baseDatos: ['', Validators.required],
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],

      // Ticket
      filasTicket: [
        7,
        [
          Validators.required,
          Validators.min(5),
        ],
      ],

      // Página
      columnasPorPagina: [
        3,
        [
          Validators.required,
          Validators.min(3),
        ],
      ],

      filasPorPagina: [
        1,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],

      // Monitor
      monitorCocina: [
        null,
        Validators.required
      ],

    });
  }

  seleccionarImagen(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    if (!archivo.type.startsWith('image/')) {
      alert('El archivo seleccionado debe ser una imagen.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.imagenPreview.set(reader.result as string);
    };

    reader.readAsDataURL(archivo);
  }

  quitarImagen(): void {
    this.imagenPreview.set(null);
  }

  cambiarVisibilidadContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }

  guardar(): void {

    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      return;
    }

    const configuracion: ConfiguracionKDS = {

      servidor: this.formulario.value.servidor,
      baseDatos: this.formulario.value.baseDatos,
      usuario: this.formulario.value.usuario,
      contrasena: this.formulario.value.contrasena,

      filasTicket: this.formulario.value.filasTicket,

      columnasPorPagina:
        this.formulario.value.columnasPorPagina,

      filasPorPagina:
        this.formulario.value.filasPorPagina,

      monitorCocina:
        Number(this.formulario.value.monitorCocina),

      imagenMarcaAgua:
        this.imagenPreview(),
    };

    console.log('Configuración:', configuracion);

    // Aquí posteriormente llamaremos:
    //
    // this.configuracionService.guardar(configuracion);
    //
    // o
    //
    // window.electronAPI.guardarConfiguracion(configuracion);
  }

  cerrarConfiguracion(): void {
    this.router.navigate(['/pantalla-comandas']);
  }
}
