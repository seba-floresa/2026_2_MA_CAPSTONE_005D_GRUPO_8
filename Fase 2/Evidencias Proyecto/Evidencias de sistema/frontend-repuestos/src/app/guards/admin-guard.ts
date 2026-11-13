import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verificamos tanto si se guardó el objeto 'user' como las propiedades sueltas
  const userStr = localStorage.getItem('user');
  let isStaff = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      isStaff = !!user.is_staff;
    } catch (e) {
      isStaff = false;
    }
  } else {
    // Compatibilidad por si acaso lee el is_staff suelto
    isStaff = localStorage.getItem('is_staff') === 'true';
  }

  if (isStaff) {
    return true; // ¡Adelante, eres admin!
  }

  // Si no tiene permisos, lo mandamos al login
  router.navigate(['/login']);
  return false;
};