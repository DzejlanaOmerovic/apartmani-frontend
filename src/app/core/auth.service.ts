import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API } from './api';
import { Korisnik, OdgovorPrijave, Uloga } from './modeli';

// Čuva prijavljenog korisnika i token (u localStorage, da ostane posle osvežavanja stranice)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  korisnik = signal<Korisnik | null>(this.procitajKorisnika());

  get token(): string | null {
    return localStorage.getItem('token');
  }

  prijava(Email: string, Lozinka: string): Observable<OdgovorPrijave> {
    return this.http
      .post<OdgovorPrijave>(`${API}/prijava`, { Email, Lozinka })
      .pipe(tap((odg) => this.sacuvaj(odg)));
  }

  registracija(podaci: object): Observable<OdgovorPrijave> {
    return this.http
      .post<OdgovorPrijave>(`${API}/registracija`, podaci)
      .pipe(tap((odg) => this.sacuvaj(odg)));
  }

  odjava(): void {
    // token se briše i na serveru; i ako to ne uspe, korisnik se odjavljuje lokalno
    this.http.post(`${API}/odjava`, {}).subscribe({ error: () => {} });
    this.ocisti();
    this.router.navigate(['/prijava']);
  }

  ocisti(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    this.korisnik.set(null);
  }

  // početna stranica za svaku ulogu
  pocetnaStranica(uloga?: Uloga): string {
    switch (uloga ?? this.korisnik()?.Uloga) {
      case 'administrator': return '/admin/korisnici';
      case 'vlasnik':       return '/vlasnik/apartmani';
      case 'zaposleni':     return '/zaposleni/rezervacije';
      case 'gost':          return '/gost/ponuda';
      default:              return '/prijava';
    }
  }

  private sacuvaj(odg: OdgovorPrijave): void {
    localStorage.setItem('token', odg.token);
    localStorage.setItem('korisnik', JSON.stringify(odg.korisnik));
    this.korisnik.set(odg.korisnik);
  }

  private procitajKorisnika(): Korisnik | null {
    try {
      return JSON.parse(localStorage.getItem('korisnik') ?? 'null');
    } catch {
      return null;
    }
  }
}
