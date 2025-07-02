import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'admin' hoặc 'user'

  if (token && role === 'admin') {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
