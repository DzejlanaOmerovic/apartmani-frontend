import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

// Prazna stranica koja samo preusmerava: prijavljen → svoja početna, neprijavljen → prijava
@Component({ selector: 'app-pocetna', template: '' })
export class Pocetna {
  constructor() {
    const auth = inject(AuthService);
    inject(Router).navigateByUrl(auth.token ? auth.pocetnaStranica() : '/prijava');
  }
}
