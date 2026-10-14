import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { tekstGreske } from '../../core/poruke.service';
import { MATERIAL } from '../../shared/material';

// Javna registracija – za GOSTA i VLASNIKA (zaposlenog dodaje administrator)
@Component({
  selector: 'app-registracija',
  imports: [FormsModule, RouterLink, ...MATERIAL],
  template: `
    <div class="centar">
      <mat-card class="kartica-forma">
        <mat-card-header>
          <mat-card-title>Registracija</mat-card-title>
          <mat-card-subtitle>Napravite novi nalog</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #f="ngForm" (ngSubmit)="registruj()">
            <mat-form-field appearance="outline" class="puna">
              <mat-label>Registrujem se kao</mat-label>
              <mat-select name="Uloga" [(ngModel)]="podaci.Uloga" required>
                <mat-option value="gost">Gost</mat-option>
                <mat-option value="vlasnik">Vlasnik apartmana</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="red">
              <mat-form-field appearance="outline">
                <mat-label>Ime</mat-label>
                <input matInput name="Ime" [(ngModel)]="podaci.Ime" required maxlength="30" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Prezime</mat-label>
                <input matInput name="Prezime" [(ngModel)]="podaci.Prezime" required maxlength="40" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="puna">
              <mat-label>Email</mat-label>
              <input matInput type="email" name="Email" [(ngModel)]="podaci.Email" required email maxlength="120" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="puna">
              <mat-label>Lozinka (najmanje 8 karaktera)</mat-label>
              <input matInput type="password" name="Lozinka" [(ngModel)]="podaci.Lozinka" required minlength="8" />
            </mat-form-field>
            @if (podaci.Uloga === 'gost') {
              <div class="red">
                <mat-form-field appearance="outline">
                  <mat-label>Telefon</mat-label>
                  <input matInput name="Telefon" [(ngModel)]="podaci.Telefon" required maxlength="20" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Država</mat-label>
                  <input matInput name="Drzava" [(ngModel)]="podaci.Drzava" required maxlength="50" />
                </mat-form-field>
              </div>
            }
            @if (greska()) { <p class="greska">{{ greska() }}</p> }
            <button mat-flat-button class="puna" [disabled]="f.invalid || salje()">Registruj se</button>
          </form>
          <p class="ispod">Već imate nalog? <a routerLink="/prijava">Prijavite se</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class Registracija {
  private auth = inject(AuthService);
  private router = inject(Router);

  podaci = { Uloga: 'gost', Ime: '', Prezime: '', Email: '', Lozinka: '', Telefon: '', Drzava: '' };
  greska = signal('');
  salje = signal(false);

  registruj(): void {
    this.greska.set('');
    this.salje.set(true);
    const zaSlanje: Record<string, string> = { ...this.podaci };
    if (this.podaci.Uloga !== 'gost') {
      delete zaSlanje['Telefon'];
      delete zaSlanje['Drzava'];
    }
    this.auth.registracija(zaSlanje).subscribe({
      next: (odg) => this.router.navigateByUrl(this.auth.pocetnaStranica(odg.korisnik.Uloga)),
      error: (g) => { this.greska.set(tekstGreske(g)); this.salje.set(false); },
    });
  }
}
