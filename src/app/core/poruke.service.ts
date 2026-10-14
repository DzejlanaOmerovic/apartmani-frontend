import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Prikaz poruka korisniku (zelena = uspeh, crvena = greška)
@Injectable({ providedIn: 'root' })
export class PorukeService {
  private snack = inject(MatSnackBar);

  uspeh(tekst: string): void {
    this.snack.open(tekst, 'OK', { duration: 4000, panelClass: 'poruka-uspeh' });
  }

  greska(g: unknown): void {
    this.snack.open(tekstGreske(g), 'Zatvori', { duration: 7000, panelClass: 'poruka-greska' });
  }
}

// iz Laravel odgovora izvlači čitljivu poruku (validacija vraća i "errors")
export function tekstGreske(g: unknown): string {
  if (g instanceof HttpErrorResponse) {
    if (g.status === 0) {
      return 'Server nije dostupan. Proverite da li je pokrenut "php artisan serve".';
    }
    const greske = g.error?.errors as Record<string, string[]> | undefined;
    if (greske) {
      return Object.values(greske).flat().join(' ');
    }
    if (g.error?.message) {
      return g.error.message;
    }
  }
  return 'Došlo je do greške.';
}
