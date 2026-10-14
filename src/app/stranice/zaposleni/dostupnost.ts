import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API } from '../../core/api';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

interface RedDostupnosti {
  SifraApartmana: string; Naziv: string; Kapacitet: number; CenaPoNocenju: number;
  Status: string; Dostupan: boolean; Razlog: string | null;
}

// ZAPOSLENI – tok "Dostupnost apartmana" (3.2 Provera dostupnosti)
@Component({
  selector: 'app-zaposleni-dostupnost',
  imports: [FormsModule, NazivPipe, ...MATERIAL],
  template: `
    <h1>Dostupnost apartmana</h1>

    <mat-card class="blok">
      <mat-card-content>
        <form #f="ngForm" (ngSubmit)="proveri()" class="forma-red">
          <mat-form-field appearance="outline">
            <mat-label>Dolazak</mat-label>
            <input matInput type="date" name="od" [(ngModel)]="od" required />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Odlazak</mat-label>
            <input matInput type="date" name="do" [(ngModel)]="do" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="usko">
            <mat-label>Broj gostiju</mat-label>
            <input matInput type="number" name="broj" [(ngModel)]="broj" min="1" />
          </mat-form-field>
          <button mat-flat-button [disabled]="f.invalid"><mat-icon>search</mat-icon> Proveri</button>
        </form>
      </mat-card-content>
    </mat-card>

    @if (rezultat().length) {
      <table class="obicna-tabela">
        <tr><th>Apartman</th><th>Kapacitet</th><th>Cena / noć</th><th>Trenutni status</th><th>Dostupan</th><th>Razlog</th></tr>
        @for (r of rezultat(); track r.SifraApartmana) {
          <tr>
            <td>{{ r.SifraApartmana }} – {{ r.Naziv }}</td>
            <td>{{ r.Kapacitet }}</td>
            <td>{{ r.CenaPoNocenju }} €</td>
            <td>{{ r.Status | naziv }}</td>
            <td><span [class]="'oznaka ' + (r.Dostupan ? 'slobodan' : 'otkazana')">{{ r.Dostupan ? 'DA' : 'NE' }}</span></td>
            <td>{{ r.Razlog ?? '' }}</td>
          </tr>
        }
      </table>
    }
  `,
})
export class ZaposleniDostupnost {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  od = '';
  do = '';
  broj: number | null = null;
  rezultat = signal<RedDostupnosti[]>([]);

  proveri(): void {
    const parametri: Record<string, string> = { od: this.od, do: this.do };
    if (this.broj) parametri['broj'] = String(this.broj);

    this.http.get<RedDostupnosti[]>(`${API}/dostupnost`, { params: parametri }).subscribe({
      next: (r) => this.rezultat.set(r),
      error: (g) => this.poruke.greska(g),
    });
  }
}
