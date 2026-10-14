import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { API } from '../../core/api';
import { Apartman, Odrzavanje } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';
import { NazivPipe } from '../../shared/naziv.pipe';

// ZAPOSLENI – modul 5.0: 5.1 Plan održavanja apartmana, 5.2 Evidentiranje aktivnosti održavanja
@Component({
  selector: 'app-zaposleni-odrzavanje',
  imports: [FormsModule, DatePipe, NgTemplateOutlet, NazivPipe, ...MATERIAL],
  template: `
    <h1>Održavanje apartmana</h1>

    <mat-card class="blok">
      <mat-card-header>
        <mat-card-title>{{ izmenaId() ? 'Izmena održavanja' : 'Nova aktivnost održavanja' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form #f="ngForm" (ngSubmit)="sacuvaj(f)" class="forma-red">
          <mat-form-field appearance="outline">
            <mat-label>Apartman</mat-label>
            <mat-select name="SifraApartmana" [(ngModel)]="forma.SifraApartmana" required>
              @for (a of apartmani(); track a.SifraApartmana) {
                <mat-option [value]="a.SifraApartmana">{{ a.SifraApartmana }} – {{ a.Naziv }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Vrsta aktivnosti</mat-label>
            <mat-select name="VrstaAktivnosti" [(ngModel)]="forma.VrstaAktivnosti" required>
              @for (v of vrste; track v) { <mat-option [value]="v">{{ v | naziv }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Datum</mat-label>
            <input matInput type="date" name="Datum" [(ngModel)]="forma.Datum" required />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Odgovorna osoba ili servis</mat-label>
            <input matInput name="OdgovornaOsoba" [(ngModel)]="forma.OdgovornaOsoba" required maxlength="100" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="sire">
            <mat-label>Opis radova</mat-label>
            <input matInput name="OpisRadova" [(ngModel)]="forma.OpisRadova" maxlength="500" />
          </mat-form-field>
          <button mat-flat-button [disabled]="f.invalid">{{ izmenaId() ? 'Sačuvaj izmene' : 'Evidentiraj' }}</button>
          @if (izmenaId()) { <button mat-button type="button" (click)="otkaziIzmenu(f)">Otkaži</button> }
        </form>
      </mat-card-content>
    </mat-card>

    <h2>Plan održavanja (predstojeće)</h2>
    <ng-container *ngTemplateOutlet="tabela; context: { lista: plan() }" />

    <h2>Sva evidentirana održavanja</h2>
    <ng-container *ngTemplateOutlet="tabela; context: { lista: sva() }" />

    <ng-template #tabela let-lista="lista">
      <table class="obicna-tabela">
        <tr><th>Datum</th><th>Apartman</th><th>Vrsta</th><th>Opis radova</th><th>Odgovorna osoba</th><th></th></tr>
        @for (o of lista; track o.OdrzavanjeID) {
          <tr>
            <td>{{ o.Datum | date: 'dd.MM.yyyy.' }}</td>
            <td>{{ o.SifraApartmana }} – {{ o.apartman?.Naziv }}</td>
            <td>{{ o.VrstaAktivnosti | naziv }}</td>
            <td>{{ o.OpisRadova }}</td>
            <td>{{ o.OdgovornaOsoba }}</td>
            <td class="akcije">
              <button mat-icon-button title="Izmeni" (click)="izmeni(o)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button title="Obriši" (click)="obrisi(o)"><mat-icon>delete</mat-icon></button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="6">Nema.</td></tr>
        }
      </table>
    </ng-template>
  `,
})
export class ZaposleniOdrzavanje implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  vrste = ['ciscenje', 'popravka', 'tehnicko_odrzavanje'];
  apartmani = signal<Apartman[]>([]);
  plan = signal<Odrzavanje[]>([]);
  sva = signal<Odrzavanje[]>([]);
  izmenaId = signal<number | null>(null);
  forma = this.praznaForma();

  ngOnInit(): void {
    this.http.get<Apartman[]>(`${API}/apartmani`).subscribe({
      next: (a) => this.apartmani.set(a),
      error: (g) => this.poruke.greska(g),
    });
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Odrzavanje[]>(`${API}/odrzavanja/plan`).subscribe({ next: (o) => this.plan.set(o) });
    this.http.get<Odrzavanje[]>(`${API}/odrzavanja`).subscribe({
      next: (o) => this.sva.set(o),
      error: (g) => this.poruke.greska(g),
    });
  }

  sacuvaj(f: NgForm): void {
    const id = this.izmenaId();
    const zahtev = id
      ? this.http.put<{ message: string }>(`${API}/odrzavanja/${id}`, this.forma)
      : this.http.post<{ message: string }>(`${API}/odrzavanja`, this.forma);

    zahtev.subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.otkaziIzmenu(f); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  izmeni(o: Odrzavanje): void {
    this.izmenaId.set(o.OdrzavanjeID);
    this.forma = {
      SifraApartmana: o.SifraApartmana, VrstaAktivnosti: o.VrstaAktivnosti, Datum: o.Datum,
      OpisRadova: o.OpisRadova ?? '', OdgovornaOsoba: o.OdgovornaOsoba,
    };
  }

  otkaziIzmenu(f: NgForm): void {
    this.izmenaId.set(null);
    f.resetForm();
    this.forma = this.praznaForma();
  }

  obrisi(o: Odrzavanje): void {
    if (!confirm('Obrisati ovo održavanje?')) return;
    this.http.delete<{ message: string }>(`${API}/odrzavanja/${o.OdrzavanjeID}`).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }

  private praznaForma() {
    return { SifraApartmana: '', VrstaAktivnosti: 'ciscenje', Datum: '', OpisRadova: '', OdgovornaOsoba: '' };
  }
}
