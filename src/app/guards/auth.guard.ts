import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.esperarInicializacion();

  const usuario = authService.obtenerUsuarioActual();

  if (usuario && usuario.estaActivo()) {
    return true;
  }

  await router.navigate(['/login']);
  return false;
};