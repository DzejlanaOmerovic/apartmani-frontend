import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Uz SVAKI zahtev ka Laravel-u dodaje token i traži JSON odgovor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const zaglavlja: Record<string, string> = { Accept: 'application/json' };
  if (auth.token) {
    zaglavlja['Authorization'] = `Bearer ${auth.token}`;
  }

  return next(req.clone({ setHeaders: zaglavlja })).pipe(
    catchError((greska: HttpErrorResponse) => {
      // 401 = token nije važeći → korisnik mora ponovo da se prijavi
      if (greska.status === 401 && !req.url.endsWith('/prijava')) {
        auth.ocisti();
        router.navigate(['/prijava']);
      }
      return throwError(() => greska);
    })
  );
};
