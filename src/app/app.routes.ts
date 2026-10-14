import { Routes } from '@angular/router';
import { ulogaGuard } from './core/uloga.guard';
import { Korisnici } from './stranice/admin/korisnici';
import { GostApartman } from './stranice/gost/apartman';
import { GostPonuda } from './stranice/gost/ponuda';
import { GostRacun } from './stranice/gost/racun';
import { GostRezervacije } from './stranice/gost/rezervacije';
import { Izgled } from './stranice/izgled';
import { Pocetna } from './stranice/javno/pocetna';
import { Prijava } from './stranice/javno/prijava';
import { Registracija } from './stranice/javno/registracija';
import { VlasnikApartmani } from './stranice/vlasnik/apartmani';
import { VlasnikGalerija } from './stranice/vlasnik/galerija';
import { VlasnikIzvestaji } from './stranice/vlasnik/izvestaji';
import { ZaposleniDolasci } from './stranice/zaposleni/dolasci';
import { ZaposleniDostupnost } from './stranice/zaposleni/dostupnost';
import { ZaposleniIzvestaji } from './stranice/zaposleni/izvestaji';
import { ZaposleniOdrzavanje } from './stranice/zaposleni/odrzavanje';
import { ZaposleniRezervacije } from './stranice/zaposleni/rezervacije';
import { ZaposleniStatus } from './stranice/zaposleni/status';

// Sve stranice aplikacije. Svaka grupa je zaštićena čuvarom uloge (ulogaGuard).
export const routes: Routes = [
  // javne stranice
  { path: 'prijava', component: Prijava },
  { path: 'registracija', component: Registracija },

  // stranice posle prijave (zajednički izgled: traka + meni)
  {
    path: '',
    component: Izgled,
    children: [
      { path: '', pathMatch: 'full', component: Pocetna },

      // ADMINISTRATOR – 1.0
      { path: 'admin/korisnici', component: Korisnici, canActivate: [ulogaGuard('administrator')] },

      // VLASNIK – 2.0 i 7.0
      { path: 'vlasnik/apartmani', component: VlasnikApartmani, canActivate: [ulogaGuard('vlasnik')] },
      { path: 'vlasnik/apartmani/:sifra', component: VlasnikGalerija, canActivate: [ulogaGuard('vlasnik')] },
      { path: 'vlasnik/izvestaji', component: VlasnikIzvestaji, canActivate: [ulogaGuard('vlasnik')] },

      // ZAPOSLENI – 2.0 (status), 3.0, 4.0, 5.0 i 7.0
      { path: 'zaposleni/rezervacije', component: ZaposleniRezervacije, canActivate: [ulogaGuard('zaposleni')] },
      { path: 'zaposleni/dostupnost', component: ZaposleniDostupnost, canActivate: [ulogaGuard('zaposleni')] },
      { path: 'zaposleni/dolasci', component: ZaposleniDolasci, canActivate: [ulogaGuard('zaposleni')] },
      { path: 'zaposleni/apartmani', component: ZaposleniStatus, canActivate: [ulogaGuard('zaposleni')] },
      { path: 'zaposleni/odrzavanje', component: ZaposleniOdrzavanje, canActivate: [ulogaGuard('zaposleni')] },
      { path: 'zaposleni/izvestaji', component: ZaposleniIzvestaji, canActivate: [ulogaGuard('zaposleni')] },

      // GOST – 2.0 (galerija), 3.0 i 6.0
      { path: 'gost/ponuda', component: GostPonuda, canActivate: [ulogaGuard('gost')] },
      { path: 'gost/ponuda/:sifra', component: GostApartman, canActivate: [ulogaGuard('gost')] },
      { path: 'gost/rezervacije', component: GostRezervacije, canActivate: [ulogaGuard('gost')] },
      { path: 'gost/racun/:id', component: GostRacun, canActivate: [ulogaGuard('gost')] },
    ],
  },

  // nepoznata adresa → početna
  { path: '**', redirectTo: '' },
];
