import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API } from '../../core/api';
import { Rezervacija } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { danas } from '../../shared/datumi';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

interface Pregled { dolasci: Rezervacija[]; odlasci: Rezervacija[]; trenutno: Rezervacija[]; }

// ZAPOSLENI – 4.3 Praćenje boravka gostiju: "Pregled dolazaka i odlazaka"
@Component({
  selector: 'app-zaposleni-dolasci',
  imports: [FormsModule, DatePipe, NgTemplateOutlet, NazivPipe, ...MATERIAL],
  template: `
    <h1>Dolasci i odlasci</h1>

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
        <button mat-flat-button (click)="ucitaj()"><mat-icon>search</mat-icon> Prikaži</button>
      </mat-card-content>
    </mat-card>

    <h2>Trenutno u apartmanima</h2>
    <ng-container *ngTemplateOutlet="tabela; context: { lista: pregled().trenutno }" />
    <h2>Dolasci u periodu</h2>
    <ng-container *ngTemplateOutlet="tabela; context: { lista: pregled().dolasci }" />
    <h2>Odlasci u periodu</h2>
    <ng-container *ngTemplateOutlet="tabela; context: { lista: pregled().odlasci }" />

    <ng-template #tabela let-lista="lista">
      <table class="obicna-tabela">
        <tr><th>Rez.</th><th>Apartman</th><th>Gost</th><th>Dolazak</th><th>Odlazak</th><th>Status</th><th>Ušao (primio)</th><th>Izašao (ispratio)</th></tr>
        @for (r of lista; track r.RezervacijaID) {
          <tr>
            <td>{{ r.RezervacijaID }}</td>
            <td>{{ r.SifraApartmana }} – {{ r.apartman?.Naziv }}</td>
            <td>{{ r.gost?.Ime }} {{ r.gost?.Prezime }}</td>
            <td>{{ r.DatumPocetka | date: 'dd.MM.yyyy.' }}</td>
            <td>{{ r.DatumZavrsetka | date: 'dd.MM.yyyy.' }}</td>
            <td>{{ r.Status | naziv }}</td>
            <td>
              @if (r.boravak) { {{ r.boravak.DatumVremeUlaska }} ({{ r.boravak.zaposleni_prijem?.Ime }}) } @else { – }
            </td>
            <td>
              @if (r.boravak?.DatumVremeIzlaska) { {{ r.boravak.DatumVremeIzlaska }} ({{ r.boravak.zaposleni_ispracaj?.Ime }}) } @else { – }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="8">Nema.</td></tr>
        }
      </table>
    </ng-template>
  `,
})
export class ZaposleniDolasci implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  od = danas();
  do = danas();
  pregled = signal<Pregled>({ dolasci: [], odlasci: [], trenutno: [] });

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Pregled>(`${API}/pregled-dolazaka`, { params: { od: this.od, do: this.do } }).subscribe({
      next: (p) => this.pregled.set(p),
      error: (g) => this.poruke.greska(g),
    });
  }
}
