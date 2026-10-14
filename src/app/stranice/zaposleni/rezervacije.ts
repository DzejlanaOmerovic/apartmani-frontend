import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API } from '../../core/api';
import { Rezervacija } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// ZAPOSLENI – pregled svih rezervacija + 4.0 check-in / check-out + otkazivanje
@Component({
  selector: 'app-zaposleni-rezervacije',
  imports: [FormsModule, DatePipe, NazivPipe, ...MATERIAL],
  template: `
    <h1>Rezervacije</h1>

    <mat-card class="blok">
      <mat-card-content class="forma-red">
        <mat-form-field appearance="outline">
          <mat-label>Boravak od</mat-label>
          <input matInput type="date" name="od" [(ngModel)]="filter.od" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Boravak do</mat-label>
          <input matInput type="date" name="do" [(ngModel)]="filter.do" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select name="status" [(ngModel)]="filter.status">
            <mat-option value="">svi</mat-option>
            @for (s of statusi; track s) { <mat-option [value]="s">{{ s | naziv }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <button mat-flat-button (click)="ucitaj()"><mat-icon>search</mat-icon> Prikaži</button>
      </mat-card-content>
    </mat-card>

    <table class="obicna-tabela">
      <tr>
        <th>ID</th><th>Apartman</th><th>Gost</th><th>Dolazak</th><th>Odlazak</th>
        <th>Gostiju</th><th>Cena</th><th>Status</th><th>Boravak</th><th>Akcije</th>
      </tr>
      @for (r of rezervacije(); track r.RezervacijaID) {
        <tr>
          <td>{{ r.RezervacijaID }}</td>
          <td>{{ r.SifraApartmana }} – {{ r.apartman?.Naziv }}</td>
          <td>{{ r.gost?.Ime }} {{ r.gost?.Prezime }}<br /><small>{{ r.gost?.Telefon }}</small></td>
          <td>{{ r.DatumPocetka | date: 'dd.MM.yyyy.' }}</td>
          <td>{{ r.DatumZavrsetka | date: 'dd.MM.yyyy.' }}</td>
          <td>{{ r.BrojGostiju }}</td>
          <td>{{ r.Cena }} €</td>
          <td><span [class]="'oznaka ' + r.Status">{{ r.Status | naziv }}</span></td>
          <td>
            @if (r.boravak) {
              <small>ulaz: {{ r.boravak.DatumVremeUlaska }}</small>
              @if (r.boravak.DatumVremeIzlaska) { <br /><small>izlaz: {{ r.boravak.DatumVremeIzlaska }}</small> }
            } @else { – }
          </td>
          <td class="akcije">
            @if (r.Status === 'potvrdjena' && !r.boravak) {
              <button mat-stroked-button (click)="checkIn(r)"><mat-icon>login</mat-icon> Check-in</button>
            }
            @if (r.boravak && !r.boravak.DatumVremeIzlaska) {
              <button mat-stroked-button (click)="checkOut(r)"><mat-icon>logout</mat-icon> Check-out</button>
            }
            @if ((r.Status === 'kreirana' || r.Status === 'potvrdjena') && !r.boravak) {
              <button mat-button (click)="otkazi(r)"><mat-icon>cancel</mat-icon> Otkaži</button>
            }
          </td>
        </tr>
      } @empty {
        <tr><td colspan="10">Nema rezervacija.</td></tr>
      }
    </table>
    <p class="napomena">Check-in je moguć samo za plaćenu (potvrđenu) rezervaciju, od dana dolaska.</p>
  `,
})
export class ZaposleniRezervacije implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  statusi = ['kreirana', 'potvrdjena', 'otkazana', 'realizovana'];
  filter = { od: '', do: '', status: '' };
  rezervacije = signal<Rezervacija[]>([]);

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    const parametri: Record<string, string> = {};
    if (this.filter.od) parametri['od'] = this.filter.od;
    if (this.filter.do) parametri['do'] = this.filter.do;
    if (this.filter.status) parametri['status'] = this.filter.status;

    this.http.get<Rezervacija[]>(`${API}/rezervacije`, { params: parametri }).subscribe({
      next: (r) => this.rezervacije.set(r),
      error: (g) => this.poruke.greska(g),
    });
  }

  checkIn(r: Rezervacija): void {
    this.akcija(`${API}/rezervacije/${r.RezervacijaID}/check-in`, 'post');
  }

  checkOut(r: Rezervacija): void {
    this.akcija(`${API}/rezervacije/${r.RezervacijaID}/check-out`, 'post');
  }

  otkazi(r: Rezervacija): void {
    if (!confirm(`Otkazati rezervaciju ${r.RezervacijaID}?`)) return;
    this.akcija(`${API}/rezervacije/${r.RezervacijaID}/otkazi`, 'put');
  }

  private akcija(url: string, metoda: 'post' | 'put'): void {
    const zahtev = metoda === 'post'
      ? this.http.post<{ message: string }>(url, {})
      : this.http.put<{ message: string }>(url, {});
    zahtev.subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }
}
