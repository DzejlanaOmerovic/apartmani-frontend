import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Apartman, Fotografija } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';

// VLASNIK – 2.2 Upravljanje fotografijama apartmana i 2.3 Prikaz galerije
@Component({
  selector: 'app-vlasnik-galerija',
  imports: [RouterLink, ...MATERIAL],
  template: `
    <a mat-button routerLink="/vlasnik/apartmani"><mat-icon>arrow_back</mat-icon> Nazad na apartmane</a>

    @if (apartman(); as a) {
      <h1>Galerija – {{ a.SifraApartmana }} {{ a.Naziv }}</h1>

      <mat-card class="blok">
        <mat-card-content class="forma-red">
          <input #fajl type="file" accept="image/jpeg,image/png,image/webp" (change)="izaberi(fajl.files)" />
          <button mat-flat-button [disabled]="!izabran() || salje()" (click)="posalji(fajl)">
            <mat-icon>upload</mat-icon> Dodaj fotografiju
          </button>
          <span class="napomena">Dozvoljeno: jpg, png, webp, do 5 MB.</span>
        </mat-card-content>
      </mat-card>

      @if (!a.fotografije?.length) {
        <p>Apartman još nema fotografija.</p>
      } @else {
        <div class="galerija">
          @for (f of a.fotografije; track f.FotografijaID) {
            <div class="slika-okvir">
              <img [src]="f.Url" alt="Fotografija apartmana" />
              <button mat-stroked-button (click)="obrisi(f)"><mat-icon>delete</mat-icon> Obriši</button>
            </div>
          }
        </div>
      }
    }
  `,
})
export class VlasnikGalerija implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  sifra = input.required<string>();          // iz adrese /vlasnik/apartmani/:sifra
  apartman = signal<Apartman | null>(null);
  izabran = signal<File | null>(null);
  salje = signal(false);

  ngOnInit(): void {
    this.ucitaj();
  }

  ucitaj(): void {
    this.http.get<Apartman[]>(`${API}/moji-apartmani`).subscribe({
      next: (lista) => this.apartman.set(lista.find((a) => a.SifraApartmana === this.sifra()) ?? null),
      error: (g) => this.poruke.greska(g),
    });
  }

  izaberi(fajlovi: FileList | null): void {
    this.izabran.set(fajlovi?.item(0) ?? null);
  }

  posalji(polje: HTMLInputElement): void {
    const fajl = this.izabran();
    if (!fajl) return;
    const podaci = new FormData();
    podaci.append('fotografija', fajl);
    this.salje.set(true);

    this.http.post<{ message: string }>(`${API}/moji-apartmani/${this.sifra()}/fotografije`, podaci).subscribe({
      next: (odg) => {
        this.poruke.uspeh(odg.message);
        polje.value = '';
        this.izabran.set(null);
        this.salje.set(false);
        this.ucitaj();
      },
      error: (g) => { this.poruke.greska(g); this.salje.set(false); },
    });
  }

  obrisi(f: Fotografija): void {
    if (!confirm('Obrisati ovu fotografiju?')) return;
    this.http.delete<{ message: string }>(`${API}/fotografije/${f.FotografijaID}`).subscribe({
      next: (odg) => { this.poruke.uspeh(odg.message); this.ucitaj(); },
      error: (g) => this.poruke.greska(g),
    });
  }
}
