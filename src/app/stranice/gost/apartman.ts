import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Apartman } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { brojNocenja, danas } from '../../shared/datumi';
import { MATERIAL } from '../../shared/material';

interface Zauzeto { rezervacije: { DatumPocetka: string; DatumZavrsetka: string }[]; odrzavanja: string[]; }

// GOST – galerija jednog apartmana + 3.1 Zahtev za rezervaciju (3.2 provera i 3.3 kreiranje radi server)
@Component({
  selector: 'app-gost-apartman',
  imports: [FormsModule, RouterLink, DatePipe, ...MATERIAL],
  template: `
    <a mat-button routerLink="/gost/ponuda"><mat-icon>arrow_back</mat-icon> Nazad na ponudu</a>

    @if (apartman(); as a) {
      <h1>{{ a.Naziv }}</h1>
      <p>{{ a.Adresa }}, sprat {{ a.Sprat }} · do {{ a.Kapacitet }} osoba · <b>{{ a.CenaPoNocenju }} € / noć</b></p>
      <p>{{ a.Opis }}</p>

      @if (a.fotografije?.length) {
        <div class="glavna-slika"><img [src]="aktivnaSlika() || a.fotografije![0].Url" alt="{{ a.Naziv }}" /></div>
        <div class="galerija mala-galerija">
          @for (f of a.fotografije; track f.FotografijaID) {
            <img [src]="f.Url" alt="" (click)="aktivnaSlika.set(f.Url)" [class.izabrana]="(aktivnaSlika() || a.fotografije![0].Url) === f.Url" />
          }
        </div>
      }

      <div class="dve-kolone">
        <mat-card class="blok">
          <mat-card-header><mat-card-title>Rezervacija</mat-card-title></mat-card-header>
          <mat-card-content>
            <form #f="ngForm" (ngSubmit)="rezervisi()">
              <div class="red">
                <mat-form-field appearance="outline">
                  <mat-label>Dolazak</mat-label>
                  <input matInput type="date" name="DatumPocetka" [(ngModel)]="forma.DatumPocetka" [min]="minDatum" required />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Odlazak</mat-label>
                  <input matInput type="date" name="DatumZavrsetka" [(ngModel)]="forma.DatumZavrsetka" [min]="forma.DatumPocetka || minDatum" required />
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="puna">
                <mat-label>Broj gostiju (najviše {{ a.Kapacitet }})</mat-label>
                <input matInput type="number" name="BrojGostiju" [(ngModel)]="forma.BrojGostiju" required min="1" [max]="a.Kapacitet" />
              </mat-form-field>
              @if (nocenja() > 0) {
                <p class="cena">{{ nocenja() }} noćenja × {{ a.CenaPoNocenju }} € = {{ nocenja() * a.CenaPoNocenju }} €</p>
              }
              <button mat-flat-button class="puna" [disabled]="f.invalid || salje()">Pošalji zahtev za rezervaciju</button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="blok">
          <mat-card-header><mat-card-title>Zauzeti termini</mat-card-title></mat-card-header>
          <mat-card-content>
            @for (r of zauzeto().rezervacije; track $index) {
              <p>{{ r.DatumPocetka | date: 'dd.MM.yyyy.' }} – {{ r.DatumZavrsetka | date: 'dd.MM.yyyy.' }}</p>
            }
            @for (d of zauzeto().odrzavanja; track $index) {
              <p>{{ d | date: 'dd.MM.yyyy.' }} – održavanje</p>
            }
            @if (!zauzeto().rezervacije.length && !zauzeto().odrzavanja.length) {
              <p>Apartman je slobodan u svim predstojećim terminima.</p>
            }
            <p class="napomena">Dan odlaska prethodnog gosta može biti vaš dan dolaska.</p>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
})
export class GostApartman implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);
  private router = inject(Router);

  sifra = input.required<string>();          // iz adrese /gost/ponuda/:sifra
  apartman = signal<Apartman | null>(null);
  zauzeto = signal<Zauzeto>({ rezervacije: [], odrzavanja: [] });
  aktivnaSlika = signal('');
  salje = signal(false);
  minDatum = danas();
  forma = { DatumPocetka: '', DatumZavrsetka: '', BrojGostiju: 1 };

  nocenja = () => Math.max(0, brojNocenja(this.forma.DatumPocetka, this.forma.DatumZavrsetka));

  ngOnInit(): void {
    this.http.get<Apartman>(`${API}/ponuda/${this.sifra()}`).subscribe({
      next: (a) => this.apartman.set(a),
      error: (g) => this.poruke.greska(g),
    });
    this.http.get<Zauzeto>(`${API}/ponuda/${this.sifra()}/zauzeto`).subscribe({
      next: (z) => this.zauzeto.set(z),
    });
  }

  rezervisi(): void {
    this.salje.set(true);
    this.http
      .post<{ message: string }>(`${API}/rezervacije`, { SifraApartmana: this.sifra(), ...this.forma })
      .subscribe({
        next: (odg) => { this.poruke.uspeh(odg.message); this.router.navigate(['/gost/rezervacije']); },
        error: (g) => { this.poruke.greska(g); this.salje.set(false); },
      });
  }
}
