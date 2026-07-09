import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { PermisoUsuario } from '../models/usuario-sistema.model';

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.esperarInicializacion();

  const permiso = route.data['permiso'] as PermisoUsuario;
  const usuario = authService.obtenerUsuarioActual();

  if (usuario && usuario.tienePermiso(permiso)) {
    return true;
  }

  await router.navigate(['/dashboard']);
  return false;
};