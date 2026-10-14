import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API } from '../../core/api';
import { Rezervacija } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { krajMeseca, pocetakMeseca } from '../../shared/datumi';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

interface IzvestajRezervacija {
  ukupno: number;
  poStatusu: Record<string, number>;
  poApartmanu: { SifraApartmana: string; Naziv: string; BrojRezervacija: number }[];
  rezervacije: Rezervacija[];
}
interface IzvestajOdrzavanja {
  ukupno: number;
  redovi: { SifraApartmana: string; Naziv: string; ciscenje: number; popravka: number; tehnicko_odrzavanje: number; ukupno: number }[];
}

// ZAPOSLENI – 7.1 Izveštaj o rezervacijama + učestalost održavanja (iz korisničkog zahteva)
@Component({
  selector: 'app-zaposleni-izvestaji',
  imports: [FormsModule, DatePipe, NazivPipe, ...MATERIAL],
  template: `
    <h1>Izveštaji</h1>

    <mat-card class="blok">
      <mat-card-content class="forma-red">
        <mat-form-field appearance="outline">
          <mat-label>Od</mat-label>
          <input matInput type="date" name="od" [(ngModel)]="od" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Do</mat-label>
          <input matInput type="date" name="do" [(ngModel)]="do" />
        </mat-form-field>
        <button mat-flat-button (click)="prikazi()"><mat-icon>search</mat-icon> Prikaži</button>
      </mat-card-content>
    </mat-card>

    @if (rez(); as r) {
      <h2>Izveštaj o rezervacijama (ukupno: {{ r.ukupno }})</h2>
      <div class="kartice-brojevi">
        @for (s of statusi; track s) {
          <div class="broj-kartica"><div class="broj">{{ r.poStatusu[s] || 0 }}</div><div>{{ s | naziv }}</div></div>
        }
      </div>

      <h3>Po apartmanima</h3>
      <table class="obicna-tabela">
        <tr><th>Apartman</th><th>Broj rezervacija</th></tr>
        @for (a of r.poApartmanu; track a.SifraApartmana) {
          <tr><td>{{ a.SifraApartmana }} – {{ a.Naziv }}</td><td>{{ a.BrojRezervacija }}</td></tr>
        } @empty { <tr><td colspan="2">Nema.</td></tr> }
      </table>

      <h3>Spisak rezervacija</h3>
      <table class="obicna-tabela">
        <tr><th>ID</th><th>Apartman</th><th>Gost</th><th>Dolazak</th><th>Odlazak</th><th>Cena</th><th>Status</th></tr>
        @for (x of r.rezervacije; track x.RezervacijaID) {
          <tr>
            <td>{{ x.RezervacijaID }}</td><td>{{ x.SifraApartmana }}</td>
            <td>{{ x.gost?.Ime }} {{ x.gost?.Prezime }}</td>
            <td>{{ x.DatumPocetka | date: 'dd.MM.yyyy.' }}</td><td>{{ x.DatumZavrsetka | date: 'dd.MM.yyyy.' }}</td>
            <td>{{ x.Cena }} €</td><td>{{ x.Status | naziv }}</td>
          </tr>
        } @empty { <tr><td colspan="7">Nema.</td></tr> }
      </table>
    }

    @if (odr(); as o) {
      <h2>Učestalost održavanja (ukupno: {{ o.ukupno }})</h2>
      <table class="obicna-tabela">
        <tr><th>Apartman</th><th>Čišćenje</th><th>Popravka</th><th>Tehničko održavanje</th><th>Ukupno</th></tr>
        @for (x of o.redovi; track x.SifraApartmana) {
          <tr>
            <td>{{ x.SifraApartmana }} – {{ x.Naziv }}</td><td>{{ x.ciscenje }}</td><td>{{ x.popravka }}</td>
            <td>{{ x.tehnicko_odrzavanje }}</td><td><b>{{ x.ukupno }}</b></td>
          </tr>
        } @empty { <tr><td colspan="5">Nema.</td></tr> }
      </table>
    }
  `,
})
export class ZaposleniIzvestaji implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  statusi = ['kreirana', 'potvrdjena', 'otkazana', 'realizovana'];
  od = pocetakMeseca();
  do = krajMeseca();
  rez = signal<IzvestajRezervacija | null>(null);
  odr = signal<IzvestajOdrzavanja | null>(null);

  ngOnInit(): void {
    this.prikazi();
  }

  prikazi(): void {
    const parametri = { od: this.od, do: this.do };
    this.http.get<IzvestajRezervacija>(`${API}/izvestaji/rezervacije`, { params: parametri }).subscribe({
      next: (r) => this.rez.set(r),
      error: (g) => this.poruke.greska(g),
    });
    this.http.get<IzvestajOdrzavanja>(`${API}/izvestaji/odrzavanje`, { params: parametri }).subscribe({
      next: (o) => this.odr.set(o),
      error: (g) => this.poruke.greska(g),
    });
  }
}
