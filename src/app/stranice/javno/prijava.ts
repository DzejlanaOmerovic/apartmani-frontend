import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { tekstGreske } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';

// Prijava – email + lozinka (za sve 4 uloge)
@Component({
  selector: 'app-prijava',
  imports: [FormsModule, RouterLink, ...MATERIAL],
  template: `
    <div class="centar">
      <mat-card class="kartica-forma">
        <mat-card-header>
          <mat-card-title>Prijava</mat-card-title>
          <mat-card-subtitle>Informacioni sistem za izdavanje apartmana</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #f="ngForm" (ngSubmit)="prijavi()">
            <mat-form-field appearance="outline" class="puna">
              <mat-label>Email</mat-label>
              <input matInput type="email" name="Email" [(ngModel)]="Email" required email />
            </mat-form-field>
            <mat-form-field appearance="outline" class="puna">
              <mat-label>Lozinka</mat-label>
              <input matInput type="password" name="Lozinka" [(ngModel)]="Lozinka" required />
            </mat-form-field>
            @if (greska()) { <p class="greska">{{ greska() }}</p> }
            <button mat-flat-button class="puna" [disabled]="f.invalid || salje()">Prijavi se</button>
          </form>
          <p class="ispod">Nemate nalog? <a routerLink="/registracija">Registrujte se</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class Prijava {
  private auth = inject(AuthService);
  private router = inject(Router);

  Email = '';
  Lozinka = '';
  greska = signal('');
  salje = signal(false);

  prijavi(): void {
    this.greska.set('');
    this.salje.set(true);
    this.auth.prijava(this.Email, this.Lozinka).subscribe({
      next: (odg) => this.router.navigateByUrl(this.auth.pocetnaStranica(odg.korisnik.Uloga)),
      error: (g) => { this.greska.set(tekstGreske(g)); this.salje.set(false); },
    });
  }
}
