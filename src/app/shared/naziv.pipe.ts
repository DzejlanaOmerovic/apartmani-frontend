import { Pipe, PipeTransform } from '@angular/core';

// Pretvara vrednosti iz baze u lep tekst za prikaz (npr. "potvrdjena" → "potvrđena")
const NAZIVI: Record<string, string> = {
  administrator: 'administrator', vlasnik: 'vlasnik', zaposleni: 'zaposleni', gost: 'gost',
  slobodan: 'slobodan', zauzet: 'zauzet', van_upotrebe: 'van upotrebe',
  kreirana: 'kreirana', potvrdjena: 'potvrđena', otkazana: 'otkazana', realizovana: 'realizovana',
  ciscenje: 'čišćenje', popravka: 'popravka', tehnicko_odrzavanje: 'tehničko održavanje',
  gotovina: 'gotovina', kartica: 'kartica', online: 'online plaćanje',
};

@Pipe({ name: 'naziv' })
export class NazivPipe implements PipeTransform {
  transform(vrednost: string | null | undefined): string {
    return vrednost ? (NAZIVI[vrednost] ?? vrednost) : '';
  }
}
