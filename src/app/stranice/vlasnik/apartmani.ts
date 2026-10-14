import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Apartman } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// VLASNIK – 2.1 Evidencija podataka o apartmanima (samo sopstveni apartmani)
@Component({
  selector: 'app-vlasnik-apartmani',
  imports: [FormsModule, RouterLink, NazivPipe, ...MATERIAL],
  template: `
    <h1>Moji apartmani</h1>

    <mat-card class="blok">
      <mat-card-header>
        <mat-card-title>{{ izmenaSifra() ? 'Izmena apartmana ' + izmenaSifra() : 'Novi apartman' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form #f="ngForm" (ngSubmit)="sacuvaj(f)" class="forma-red">
          @if (!izmenaSifra()) {
            <mat-form-field appearance="outline">
              <mat-label>Šifra (npr. A101)</mat-label>
              <input matInput name="SifraApartmana" [(ngModel)]="forma.SifraApartmana" required maxlength="10" pattern="[A-Za-z0-9\\-]+" />
            </mat-form-field>
          }
          <mat-form-field appearance="outline">
            <mat-label>Naziv</mat-label>
            <input matInput name="Naziv" [(ngModel)]="forma.Naziv" required maxlength="100" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="sire">
            <mat-label>Adresa</mat-label>
            <input matInput name="Adresa" [(ngModel)]="forma.Adresa" required maxlength="150" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="usko">
            <mat-label>Sprat</mat-label>
            <input matInput type="number" name="Sprat" [(ngModel)]="forma.Sprat" required min="0" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="usko">
            <mat-label>Kapacitet</mat-label>
            <input matInput type="number" name="Kapacitet" [(ngModel)]="forma.Kapacitet" required min="1" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cena po noćenju (€)</mat-label>
            <input matInput type="number" name="CenaPoNocenju" [(ngModel)]="forma.CenaPoNocenju" required min="0.01" step="0.01" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="sire">
            <mat-label>Opis</mat-label>
            <input matInput name="Opis" [(ngModel)]="forma.Opis" maxlength="500" />
          </mat-form-field>
          <button mat-flat-button [disabled]="f.invalid">{{ izmenaSifra() ? 'Sačuvaj izmene' : 'Dodaj apartman' }}</button>
          @if (izmenaSifra()) { <button mat-button type="button" (click)="otkaziIzmenu(f)">Otkaži</button> }
        </form>
      </mat-card-content>
    </mat-card>

    @if (apartmani().length === 0) {
      <p>Još nemate nijedan apartman.</p>
    } @else {
      <table mat-table [dataSource]="apartmani()" class="mat-elevation-z1 tabela">
        <ng-container matColumnDef="slika">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let a">
            @if (a.fotografije?.length) { <img class="slicica" [src]="a.fotografije[0].Url" alt="" /> }
          </td>
        </ng-container>
        <ng-container matColumnDef="sifra">
          <th mat-header-cell *matHeaderCellDef>Šifra</th>
          <td mat-cell *matCellDef="let a">{{ a.SifraApartmana }}</td>
        </ng-container>
        <ng-container matColumnDef="naziv">
          <th mat-header-cell *matHeaderCellDef>Naziv i adresa</th>
          <td mat-cell *matCellDef="let a"><b>{{ a.Naziv }}</b><br />{{ a.Adresa }}, sprat {{ a.Sprat }}</td>
        </ng-container>
        <ng-container matColumnDef="kapacitet">
          <th mat-header-cell *matHeaderCellDef>Kapacitet</th>
          <td mat-cell *matCellDef="let a">{{ a.Kapacitet }} os.</td>
        </ng-container>
        <ng-container matColumnDef="cena">
          <th mat-header-cell *matHeaderCellDef>Cena / noć</th>
          <td mat-cell *matCellDef="let a">{{ a.CenaPoNocenju }} €</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let a"><span class="oznaka" [class]="'oznaka ' + a.Status">{{ a.Status | naziv }}</span></td>
        </ng-container>
        <ng-container matColumnDef="akcije">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let a">
            <a mat-button [routerLink]="['/vlasnik/apartmani', a.SifraApartmana]"><mat-icon>photo_library</mat-icon> Galerija ({{ a.fotografije?.length ?? 0 }})</a>
            <button mat-icon-button title="Izmeni" (click)="izmeni(a)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button title="Obriši" (click)="obrisi(a)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="kolone"></tr>
        <tr mat-row *matRowDef="let row; columns: kolone"></tr>
      </table>
      <p class="napomena">Status apartmana (slobodan / zauzet / van upotrebe) menja zaposleni.</p>
    }
  `,
})
export class VlasnikApartmani implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  kolone = ['slika', 'sifra', 'naziv', 'kapacitet', 'cena', 'status', 'akcije'];
  apartmani = signal<Apartman[]>([]);
  izmenaSifra = signal<string | null>(null);
  forma = this.praznaForma();

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Apartman[]>(`${API}/moji-apartmani`).subscribe({
      next: (a) => this.apartmani.set(a),
      error: (g) => this.poruke.greska(g),
    });
  }

  sacuvaj(f: NgForm): void {
    const sifra = this.izmenaSifra();
    const zahtev = sifra
      ? this.http.put<{ message: string }>(`${API}/moji-apartmani/${sifra}`, this.forma)
      : this.http.post<{ message: string }>(`${API}/moji-apartmani`, this.forma);

    zahtev.subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.otkaziIzmenu(f); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  izmeni(a: Apartman): void {
    this.izmenaSifra.set(a.SifraApartmana);
    this.forma = {
      SifraApartmana: a.SifraApartmana, Naziv: a.Naziv, Adresa: a.Adresa, Sprat: a.Sprat,
      Kapacitet: a.Kapacitet, CenaPoNocenju: a.CenaPoNocenju, Opis: a.Opis ?? '',
    };
  }

  otkaziIzmenu(f: NgForm): void {
    this.izmenaSifra.set(null);
    f.resetForm();
    this.forma = this.praznaForma();
  }

  obrisi(a: Apartman): void {
    if (!confirm(`Obrisati apartman ${a.SifraApartmana} – ${a.Naziv}?`)) return;
    this.http.delete<{ message: string }>(`${API}/moji-apartmani/${a.SifraApartmana}`).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  private praznaForma() {
    return {
      SifraApartmana: '', Naziv: '', Adresa: '', Sprat: 0 as number | null,
      Kapacitet: 1 as number | null, CenaPoNocenju: null as number | null, Opis: '',
    };
  }
}
