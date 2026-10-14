# IS za izdavanje apartmana – Angular frontend

## Pokretanje
1. Backend mora da radi: u folderu `apartmani-backend` pokrenuti `php artisan serve` (MySQL u XAMPP-u uključen).
2. U ovom folderu (samo prvi put): `npm install`
3. Pokretanje: `npm start`
4. Otvoriti http://localhost:4200

## Struktura (src/app)
- `core/` – veza sa backendom: adresa API-ja, prijava (AuthService), interceptor (token uz svaki zahtev), čuvar uloga, poruke
- `shared/` – Angular Material moduli, pomoćne funkcije za datume, pipe za lepe nazive
- `stranice/javno/` – prijava i registracija (gost, vlasnik)
- `stranice/admin/` – 1.0 korisnici i uloge
- `stranice/vlasnik/` – 2.0 apartmani i galerija, 7.0 izveštaji (prihodi, popunjenost)
- `stranice/zaposleni/` – rezervacije + check-in/out (3.0, 4.0), dostupnost, dolasci i odlasci, status apartmana, 5.0 održavanje, 7.0 izveštaji
- `stranice/gost/` – ponuda i galerija, rezervacija, moje rezervacije, plaćanje i račun (6.0)
