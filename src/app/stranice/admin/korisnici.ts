import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { API } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { Korisnik, Uloga } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// ADMINISTRATOR – modul 1.0 Upravljanje korisnicima i pristupom
// 1.1 Unos i ažuriranje podataka o korisnicima, 1.2 Dodela uloga i prava pristupa
@Component({
  selector: 'app-korisnici',
  imports: [FormsModule, NazivPipe, ...MATERIAL],
  template: `
    <h1>Korisnici i uloge</h1>

    <mat-card class="blok">
      <mat-card-header>
        <mat-card-title>{{ izmenaId() ? 'Izmena korisnika' : 'Novi korisnik (vlasnik, zaposleni ili administrator)' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form #f="ngForm" (ngSubmit)="sacuvaj(f)" class="forma-red">
          <mat-form-field appearance="outline">
            <mat-label>Ime</mat-label>
            <input matInput name="Ime" [(ngModel)]="forma.Ime" required maxlength="30" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Prezime</mat-label>
            <input matInput name="Prezime" [(ngModel)]="forma.Prezime" required maxlength="40" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" name="Email" [(ngModel)]="forma.Email" required email />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ izmenaId() ? 'Nova lozinka (prazno = ista)' : 'Lozinka' }}</mat-label>
            <input matInput type="password" name="Lozinka" [(ngModel)]="forma.Lozinka" [required]="!izmenaId()" minlength="8" />
          </mat-form-field>
          @if (!izmenaId()) {
            <mat-form-field appearance="outline">
              <mat-label>Uloga</mat-label>
              <mat-select name="Uloga" [(ngModel)]="forma.Uloga" required>
                @for (u of uloge; track u) { <mat-option [value]="u">{{ u | naziv }}</mat-option> }
              </mat-select>
            </mat-form-field>
          }
          <button mat-flat-button [disabled]="f.invalid">{{ izmenaId() ? 'Sačuvaj izmene' : 'Dodaj korisnika' }}</button>
          @if (izmenaId()) { <button mat-button type="button" (click)="otkaziIzmenu(f)">Otkaži</button> }
        </form>
      </mat-card-content>
    </mat-card>

    <table mat-table [dataSource]="korisnici()" class="mat-elevation-z1 tabela">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let k">{{ k.KorisnikID }}</td>
      </ng-container>
      <ng-container matColumnDef="ime">
        <th mat-header-cell *matHeaderCellDef>Ime i prezime</th>
        <td mat-cell *matCellDef="let k">{{ k.Ime }} {{ k.Prezime }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let k">{{ k.Email }}</td>
      </ng-container>
      <ng-container matColumnDef="uloga">
        <th mat-header-cell *matHeaderCellDef>Uloga (prava pristupa)</th>
        <td mat-cell *matCellDef="let k">
          @if (k.Uloga === 'gost' || k.KorisnikID === ja()) {
            {{ k.Uloga | naziv }}
          } @else {
            <mat-select [value]="k.Uloga" (selectionChange)="promeniUlogu(k, $event.value)" class="mali-select">
              @for (u of uloge; track u) { <mat-option [value]="u">{{ u | naziv }}</mat-option> }
            </mat-select>
          }
        </td>
      </ng-container>
      <ng-container matColumnDef="akcije">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let k">
          <button mat-icon-button title="Izmeni" (click)="izmeni(k)"><mat-icon>edit</mat-icon></button>
          @if (k.KorisnikID !== ja()) {
            <button mat-icon-button title="Obriši" (click)="obrisi(k)"><mat-icon>delete</mat-icon></button>
          }
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="kolone"></tr>
      <tr mat-row *matRowDef="let row; columns: kolone"></tr>
    </table>
  `,
})
export class Korisnici implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);
  private auth = inject(AuthService);

  kolone = ['id', 'ime', 'email', 'uloga', 'akcije'];
  uloge: Uloga[] = ['administrator', 'vlasnik', 'zaposleni'];   // gost se registruje sam
  korisnici = signal<Korisnik[]>([]);
  izmenaId = signal<number | null>(null);
  forma = this.praznaForma();

  ja = () => this.auth.korisnik()?.KorisnikID;

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Korisnik[]>(`${API}/korisnici`).subscribe({
      next: (k) => this.korisnici.set(k),
      error: (g) => this.poruke.greska(g),
    });
  }

  sacuvaj(f: NgForm): void {
    const id = this.izmenaId();
    const zahtev = id
      ? this.http.put<{ message: string }>(`${API}/korisnici/${id}`, this.forma)
      : this.http.post<{ message: string }>(`${API}/korisnici`, this.forma);

    zahtev.subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.otkaziIzmenu(f); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  izmeni(k: Korisnik): void {
    this.izmenaId.set(k.KorisnikID);
    this.forma = { Ime: k.Ime, Prezime: k.Prezime, Email: k.Email, Lozinka: '', Uloga: k.Uloga };
  }

  otkaziIzmenu(f: NgForm): void {
    this.izmenaId.set(null);
    f.resetForm();
    this.forma = this.praznaForma();
  }

  promeniUlogu(k: Korisnik, Uloga: Uloga): void {
    this.http.put<{ message: string }>(`${API}/korisnici/${k.KorisnikID}/uloga`, { Uloga }).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => { this.poruke.greska(g); this.ucitaj(); },
    });
  }

  obrisi(k: Korisnik): void {
    if (!confirm(`Obrisati korisnika ${k.Ime} ${k.Prezime}?`)) return;
    this.http.delete<{ message: string }>(`${API}/korisnici/${k.KorisnikID}`).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  private praznaForma() {
    return { Ime: '', Prezime: '', Email: '', Lozinka: '', Uloga: 'zaposleni' as Uloga };
  }
}
