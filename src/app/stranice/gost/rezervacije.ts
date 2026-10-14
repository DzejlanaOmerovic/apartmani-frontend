import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Rezervacija } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// GOST – "Potvrda rezervacije", otkazivanje i 6.0 plaćanje ("Podaci o plaćanju" → "Račun")
@Component({
  selector: 'app-gost-rezervacije',
  imports: [FormsModule, RouterLink, DatePipe, NazivPipe, ...MATERIAL],
  template: `
    <h1>Moje rezervacije</h1>

    @for (r of rezervacije(); track r.RezervacijaID) {
      <mat-card class="blok">
        <mat-card-header>
          <mat-card-title>{{ r.apartman?.Naziv }} ({{ r.SifraApartmana }})</mat-card-title>
          <mat-card-subtitle>Rezervacija br. {{ r.RezervacijaID }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>
            {{ r.DatumPocetka | date: 'dd.MM.yyyy.' }} – {{ r.DatumZavrsetka | date: 'dd.MM.yyyy.' }} ·
            {{ r.BrojGostiju }} gost(a) · <b>{{ r.Cena }} €</b> ·
            <span [class]="'oznaka ' + r.Status">{{ r.Status | naziv }}</span>
          </p>
          @if (r.Status === 'kreirana') {
            <p class="napomena">Rezervacija će biti potvrđena kada je platite.</p>
          }
          @if (r.boravak) {
            <p>Ulazak: {{ r.boravak.DatumVremeUlaska }}
              @if (r.boravak.DatumVremeIzlaska) { · Izlazak: {{ r.boravak.DatumVremeIzlaska }} }</p>
          }
        </mat-card-content>
        <mat-card-actions class="forma-red">
          @if (r.Status === 'kreirana') {
            <mat-form-field appearance="outline" class="usko-polje">
              <mat-label>Način plaćanja</mat-label>
              <mat-select [(ngModel)]="nacin[r.RezervacijaID]" [ngModelOptions]="{ standalone: true }">
                <mat-option value="kartica">kartica</mat-option>
                <mat-option value="online">online plaćanje</mat-option>
                <mat-option value="gotovina">gotovina</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-flat-button [disabled]="!nacin[r.RezervacijaID]" (click)="plati(r)"><mat-icon>payments</mat-icon> Plati {{ r.Cena }} €</button>
          }
          @for (rac of r.racuni; track rac.RacunID) {
            <a mat-stroked-button [routerLink]="['/gost/racun', rac.RacunID]"><mat-icon>receipt</mat-icon> Račun br. {{ rac.RacunID }}</a>
          }
          @if ((r.Status === 'kreirana' || r.Status === 'potvrdjena') && !r.boravak) {
            <button mat-button (click)="otkazi(r)"><mat-icon>cancel</mat-icon> Otkaži rezervaciju</button>
          }
        </mat-card-actions>
      </mat-card>
    } @empty {
      <p>Nemate rezervacija. <a routerLink="/gost/ponuda">Pogledajte ponudu apartmana.</a></p>
    }
  `,
})
export class GostRezervacije implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  rezervacije = signal<Rezervacija[]>([]);
  nacin: Record<number, string> = {};

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Rezervacija[]>(`${API}/moje-rezervacije`).subscribe({
      next: (r) => this.rezervacije.set(r),
      error: (g) => this.poruke.greska(g),
    });
  }

  plati(r: Rezervacija): void {
    this.http
      .post<{ message: string }>(`${API}/moje-rezervacije/${r.RezervacijaID}/plati`, { NacinPlacanja: this.nacin[r.RezervacijaID] })
      .subscribe({
        next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
        error: (g) => this.poruke.greska(g),
      });
  }

  otkazi(r: Rezervacija): void {
    if (!confirm('Da li sigurno želite da otkažete ovu rezervaciju?')) return;
    this.http.put<{ message: string }>(`${API}/moje-rezervacije/${r.RezervacijaID}/otkazi`, {}).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }
}
