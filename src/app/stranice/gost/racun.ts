import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Racun } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { brojNocenja } from '../../shared/datumi';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// GOST – 6.3 Generisanje računa: prikaz na ekranu + štampa / čuvanje kao PDF (preko pretraživača)
@Component({
  selector: 'app-gost-racun',
  imports: [RouterLink, DatePipe, NazivPipe, ...MATERIAL],
  template: `
    <div class="ne-stampaj forma-red">
      <a mat-button routerLink="/gost/rezervacije"><mat-icon>arrow_back</mat-icon> Nazad</a>
      <button mat-flat-button (click)="stampaj()"><mat-icon>print</mat-icon> Štampaj / Sačuvaj kao PDF</button>
    </div>

    @if (racun(); as rac) {
      <div class="racun">
        <h1>RAČUN br. {{ rac.RacunID }}</h1>
        <p>Datum izdavanja: {{ rac.DatumIzdavanja | date: 'dd.MM.yyyy.' }}</p>

        <div class="dve-kolone">
          <div>
            <h3>Gost</h3>
            <p>{{ rac.rezervacija?.gost?.Ime }} {{ rac.rezervacija?.gost?.Prezime }}<br />
               {{ rac.rezervacija?.gost?.Email }}<br />
               {{ rac.rezervacija?.gost?.Telefon }}, {{ rac.rezervacija?.gost?.Drzava }}</p>
          </div>
          <div>
            <h3>Apartman</h3>
            <p>{{ rac.rezervacija?.apartman?.SifraApartmana }} – {{ rac.rezervacija?.apartman?.Naziv }}<br />
               {{ rac.rezervacija?.apartman?.Adresa }}</p>
          </div>
        </div>

        <table class="obicna-tabela">
          <tr><th>Opis</th><th>Količina</th><th>Cena</th><th>Iznos</th></tr>
          <tr>
            <td>Smeštaj, rezervacija br. {{ rac.RezervacijaID }}
              ({{ rac.rezervacija?.DatumPocetka | date: 'dd.MM.yyyy.' }} – {{ rac.rezervacija?.DatumZavrsetka | date: 'dd.MM.yyyy.' }})</td>
            <td>{{ nocenja() }} noćenja</td>
            <td>{{ rac.rezervacija?.apartman?.CenaPoNocenju }} €</td>
            <td>{{ rac.rezervacija?.Cena }} €</td>
          </tr>
          <tr class="ukupno"><td colspan="3">UKUPNO ZA NAPLATU</td><td>{{ rac.UkupanIznos }} €</td></tr>
        </table>

        <h3>Uplate</h3>
        @for (p of rac.rezervacija?.placanja ?? []; track p.PlacanjeID) {
          <p>{{ p.DatumPlacanja | date: 'dd.MM.yyyy.' }} – {{ p.NacinPlacanja | naziv }} – {{ p.Iznos }} €</p>
        }
      </div>
    }
  `,
})
export class GostRacun implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  id = input.required<string>();             // iz adrese /gost/racun/:id
  racun = signal<Racun | null>(null);

  nocenja = () => {
    const r = this.racun()?.rezervacija;
    return r ? brojNocenja(r.DatumPocetka, r.DatumZavrsetka) : 0;
  };

  ngOnInit(): void {
    this.http.get<Racun>(`${API}/racuni/${this.id()}`).subscribe({
      next: (r) => this.racun.set(r),
      error: (g) => this.poruke.greska(g),
    });
  }

  stampaj(): void {
    window.print();
  }
}
