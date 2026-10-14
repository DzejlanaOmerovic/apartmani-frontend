import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { API } from '../../core/api';
import { Apartman } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// ZAPOSLENI – tok "Status (zauzetosti) apartmana" (proces 2.1)
@Component({
  selector: 'app-zaposleni-status',
  imports: [NazivPipe, ...MATERIAL],
  template: `
    <h1>Status apartmana</h1>
    <table class="obicna-tabela">
      <tr><th>Šifra</th><th>Naziv</th><th>Adresa</th><th>Vlasnik</th><th>Kapacitet</th><th>Status</th></tr>
      @for (a of apartmani(); track a.SifraApartmana) {
        <tr>
          <td>{{ a.SifraApartmana }}</td>
          <td>{{ a.Naziv }}</td>
          <td>{{ a.Adresa }}</td>
          <td>{{ a.vlasnik?.Ime }} {{ a.vlasnik?.Prezime }}</td>
          <td>{{ a.Kapacitet }}</td>
          <td>
            <mat-select [value]="a.Status" (selectionChange)="promeni(a, $event.value)" class="mali-select">
              @for (s of statusi; track s) { <mat-option [value]="s">{{ s | naziv }}</mat-option> }
            </mat-select>
          </td>
        </tr>
      } @empty {
        <tr><td colspan="6">Nema apartmana.</td></tr>
      }
    </table>
  `,
})
export class ZaposleniStatus implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  statusi = ['slobodan', 'zauzet', 'van_upotrebe'];
  apartmani = signal<Apartman[]>([]);

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Apartman[]>(`${API}/apartmani`).subscribe({
      next: (a) => this.apartmani.set(a),
      error: (g) => this.poruke.greska(g),
    });
  }

  promeni(a: Apartman, Status: string): void {
    this.http.put<{ message: string }>(`${API}/apartmani/${a.SifraApartmana}/status`, { Status }).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => { this.poruke.greska(g); this.ucitaj(); },
    });
  }
}
