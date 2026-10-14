import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api';
import { Apartman } from '../../core/modeli';
import { PorukeService } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';

// GOST – 2.3 Prikaz galerije apartmana (ponuda)
@Component({
  selector: 'app-gost-ponuda',
  imports: [RouterLink, ...MATERIAL],
  template: `
    <h1>Ponuda apartmana</h1>
    <div class="mreza-kartica">
      @for (a of apartmani(); track a.SifraApartmana) {
        <mat-card class="kartica-apartman">
          @if (a.fotografije?.length) {
            <img mat-card-image [src]="a.fotografije![0].Url" alt="{{ a.Naziv }}" />
          } @else {
            <div class="bez-slike"><mat-icon>image_not_supported</mat-icon></div>
          }
          <mat-card-header>
            <mat-card-title>{{ a.Naziv }}</mat-card-title>
            <mat-card-subtitle>{{ a.Adresa }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ a.Opis }}</p>
            <p><mat-icon class="mala">people</mat-icon> do {{ a.Kapacitet }} osoba &nbsp;
               <mat-icon class="mala">stairs</mat-icon> sprat {{ a.Sprat }}</p>
            <p class="cena">{{ a.CenaPoNocenju }} € / noć</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-flat-button [routerLink]="['/gost/ponuda', a.SifraApartmana]">Galerija i rezervacija</a>
          </mat-card-actions>
        </mat-card>
      } @empty {
        <p>Trenutno nema apartmana u ponudi.</p>
      }
    </div>
  `,
})
export class GostPonuda implements OnInit {
  private http = inject(HttpClient);
  private poruke = inject(PorukeService);

  apartmani = signal<Apartman[]>([]);

  ngOnInit(): void {
    this.http.get<Apartman[]>(`${API}/ponuda`).subscribe({
      next: (a) => this.apartmani.set(a),
      error: (g) => this.poruke.greska(g),
    });
  }
}
