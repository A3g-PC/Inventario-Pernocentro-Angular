import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventario } from './pages/inventario/inventario';
import { Movimientos } from './pages/movimientos/movimientos';
import { Proveedores } from './pages/proveedores/proveedores';
import { Usuarios } from './pages/usuarios/usuarios';
import { Historial } from './pages/historial/historial';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'inventario',
    component: Inventario,
    canActivate: [authGuard]
  },
  {
    path: 'movimientos',
    component: Movimientos,
    canActivate: [authGuard]
  },
  {
    path: 'proveedores',
    component: Proveedores,
    canActivate: [authGuard, roleGuard],
    data: { permiso: 'gestionarProveedores' }
  },
  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [authGuard, roleGuard],
    data: { permiso: 'gestionarUsuarios' }
  },
  {
    path: 'historial',
    component: Historial,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];