import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Uloga } from './modeli';

// Čuvar ruta: stranicu može da otvori samo korisnik sa dozvoljenom ulogom
export function ulogaGuard(...uloge: Uloga[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const korisnik = auth.korisnik();

    if (!korisnik || !auth.token) {
      return router.createUrlTree(['/prijava']);
    }
    if (!uloge.includes(korisnik.Uloga)) {
      return router.createUrlTree([auth.pocetnaStranica()]);   // pogrešna uloga → na svoju početnu
    }
    return true;
  };
}
