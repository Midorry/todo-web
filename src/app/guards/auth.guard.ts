import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // Đường dẫn tuỳ dự án
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface JwtPayload {
  exp: number;
}

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp > currentTime) {
        return true;
      } else {
        // Token hết hạn → thử refresh
        try {
          const newToken = await firstValueFrom(
            authService.refreshAccessToken()
          );
          if (newToken) {
            return true;
          } else {
            doLogout(router);
            return false;
          }
        } catch (e) {
          doLogout(router);
          return false;
        }
      }
    } catch (e) {
      doLogout(router);
      return false;
    }
  } else {
    router.navigate(['/login']);
    return false;
  }
};

function doLogout(router: Router) {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  router.navigate(['/login']);
}
