import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MATERIAL } from '../shared/material';
import { NazivPipe } from '../shared/naziv.pipe';

interface StavkaMenija { naziv: string; ikonica: string; link: string; }

// Meni za svaku ulogu – po modulima iz dokumentacije
const MENI: Record<string, StavkaMenija[]> = {
  administrator: [
    { naziv: 'Korisnici i uloge', ikonica: 'manage_accounts', link: '/admin/korisnici' },
  ],
  vlasnik: [
    { naziv: 'Moji apartmani', ikonica: 'apartment', link: '/vlasnik/apartmani' },
    { naziv: 'Izveštaji', ikonica: 'bar_chart', link: '/vlasnik/izvestaji' },
  ],
  zaposleni: [
    { naziv: 'Rezervacije', ikonica: 'event_note', link: '/zaposleni/rezervacije' },
    { naziv: 'Dostupnost apartmana', ikonica: 'event_available', link: '/zaposleni/dostupnost' },
    { naziv: 'Dolasci i odlasci', ikonica: 'login', link: '/zaposleni/dolasci' },
    { naziv: 'Status apartmana', ikonica: 'apartment', link: '/zaposleni/apartmani' },
    { naziv: 'Održavanje', ikonica: 'build', link: '/zaposleni/odrzavanje' },
    { naziv: 'Izveštaji', ikonica: 'bar_chart', link: '/zaposleni/izvestaji' },
  ],
  gost: [
    { naziv: 'Ponuda apartmana', ikonica: 'holiday_village', link: '/gost/ponuda' },
    { naziv: 'Moje rezervacije', ikonica: 'event_note', link: '/gost/rezervacije' },
  ],
};

// Glavni izgled posle prijave: gornja traka + meni levo + sadržaj stranice
@Component({
  selector: 'app-izgled',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NazivPipe, ...MATERIAL],
  template: `
    <mat-toolbar color="primary" class="traka ne-stampaj">
      <mat-icon>holiday_village</mat-icon>
      <span class="naslov">IS za izdavanje apartmana</span>
      <span class="razmak"></span>
      <span class="korisnik">{{ auth.korisnik()?.Ime }} {{ auth.korisnik()?.Prezime }}
        ({{ auth.korisnik()?.Uloga | naziv }})</span>
      <button mat-button (click)="auth.odjava()"><mat-icon>logout</mat-icon> Odjava</button>
    </mat-toolbar>

    <mat-sidenav-container class="kontejner">
      <mat-sidenav mode="side" opened class="meni ne-stampaj">
        <mat-nav-list>
          @for (s of stavke(); track s.link) {
            <a mat-list-item [routerLink]="s.link" routerLinkActive="aktivna">
              <mat-icon matListItemIcon>{{ s.ikonica }}</mat-icon>
              <span matListItemTitle>{{ s.naziv }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="sadrzaj">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class Izgled {
  auth = inject(AuthService);
  stavke = computed(() => MENI[this.auth.korisnik()?.Uloga ?? ''] ?? []);
}
