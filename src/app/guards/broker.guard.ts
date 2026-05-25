import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';

export const brokerGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Convertir el signal a observable en el contexto de inyección síncrono
  const isLoading$ = toObservable(authService.isLoading);

  // Esperar a que deje de cargar el estado de autenticación
  if (authService.isLoading()) {
    await firstValueFrom(isLoading$.pipe(filter(loading => !loading)));
  }

  const isAuth = authService.isAuthorized();
  
  if (isAuth) {
    return true;
  } else {
    return router.parseUrl('/');
  }
};

