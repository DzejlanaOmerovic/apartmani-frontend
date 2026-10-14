import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API } from '../../core/api';
import { PorukeService } from '../../core/poruke.service';
import { krajMeseca, pocetakMeseca } from '../../shared/datumi';
import { MATERIAL } from '../../shared/material';

interface RedPrihoda { SifraApartmana: string; Naziv: string; BrojUplata: number; Prihod: number; }
interface RedPopunjenosti {
  SifraApartmana: string; Naziv: string; BrojRezervacija: number;
  ZauzetihNocenja: number; DanaUPeriodu: number; Popunjenost: number;
}

// VLASNIK – 7.3 Izveštaj o prihodima i 7.2 Izveštaj o popunjenosti
@Component({
  selector: 'app-vlasnik-izvestaji',
  imports: [FormsModule, ...MATERIAL],
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

    <h2>Izveštaj o prihodima</h2>
    <table class="obicna-tabela">
      <tr><th>Apartman</th><th>Broj uplata</th><th>Prihod</th></tr>
      @for (r of prihodi(); track r.SifraApartmana) {
        <tr><td>{{ r.SifraApartmana }} – {{ r.Naziv }}</td><td>{{ r.BrojUplata }}</td><td>{{ r.Prihod.toFixed(2) }} €</td></tr>
      } @empty {
        <tr><td colspan="3">Nema podataka.</td></tr>
      }
      <tr class="ukupno"><td>UKUPNO</td><td></td><td>{{ ukupanPrihod().toFixed(2) }} €</td></tr>
    </table>

    <h2>Izveštaj o popunjenosti</h2>
    <table class="obicna-tabela">
      <tr><th>Apartman</th><th>Rezervacija</th><th>Zauzetih noćenja</th><th>Dana u periodu</th><th>Popunjenost</th></tr>
      @for (r of popunjenost(); track r.SifraApartmana) {
        <tr>
          <td>{{ r.SifraApartmana }} – {{ r.Naziv }}</td><td>{{ r.BrojRezervacija }}</td>
          <td>{{ r.ZauzetihNocenja }}</td><td>{{ r.DanaUPeriodu }}</td>
          <td><div class="traka-procenat"><div [style.width.%]="r.Popunjenost"></div></div> {{ r.Popunjenost }}%</td>
        </tr>
      } @empty {
        <tr><td colspan="5">Nema podataka.</td></tr>
      }
    </table>
  `,
})
export class VlasnikIzvestaji implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  od = pocetakMeseca();
  do = krajMeseca();
  prihodi = signal<RedPrihoda[]>([]);
  ukupanPrihod = signal(0);
  popunjenost = signal<RedPopunjenosti[]>([]);

  ngOnInit(): void {
    this.prikazi();
  }

  prikazi(): void {
    const parametri = { od: this.od, do: this.do };
    this.http.get<{ redovi: RedPrihoda[]; ukupno: number }>(`${API}/izvestaji/prihodi`, { params: parametri }).subscribe({
      next: (odg) => { this.prihodi.set(odg.redovi); this.ukupanPrihod.set(odg.ukupno); },
      error: (g) => this.poruke.greska(g),
    });
    this.http.get<{ redovi: RedPopunjenosti[] }>(`${API}/izvestaji/popunjenost`, { params: parametri }).subscribe({
      next: (odg) => this.popunjenost.set(odg.redovi),
      error: (g) => this.poruke.greska(g),
    });
  }
}
