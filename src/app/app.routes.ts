import { Routes } from '@angular/router';
import { PantallaComandas } from './componentes/pantalla-comandas/pantalla-comandas';
import { Configuracion } from './componentes/configuracion/configuracion';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pantalla-comandas',
    pathMatch: 'full',
  },
  {
    path: 'pantalla-comandas',
    component: PantallaComandas,
  },
  {
    path: 'configuracion',
    component: Configuracion,
  },
];
