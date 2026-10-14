// Tipovi podataka – isti nazivi kao kolone u bazi (relacioni model)

export type Uloga = 'administrator' | 'vlasnik' | 'zaposleni' | 'gost';

export interface Korisnik {
  KorisnikID: number;
  Ime: string;
  Prezime: string;
  Email: string;
  Uloga: Uloga;
}

export interface Fotografija {
  FotografijaID: number;
  SifraApartmana: string;
  Putanja: string;
  Url: string;
}

export interface Apartman {
  SifraApartmana: string;
  VlasnikID: number;
  Naziv: string;
  Adresa: string;
  Sprat: number;
  Kapacitet: number;
  Opis: string | null;
  CenaPoNocenju: number;
  Status: 'slobodan' | 'zauzet' | 'van_upotrebe';
  fotografije?: Fotografija[];
  vlasnik?: { KorisnikID: number; Ime: string; Prezime: string };
}

export interface Gost {
  GostID: number;
  KorisnikID: number;
  Ime: string;
  Prezime: string;
  Telefon: string;
  Email: string | null;
  Drzava: string;
}

export interface Boravak {
  RezervacijaID: number;
  DatumVremeUlaska: string;
  DatumVremeIzlaska: string | null;
  ZaposleniPrijem: number;
  ZaposleniIspracaj: number | null;
  zaposleni_prijem?: { Ime: string; Prezime: string } | null;
  zaposleni_ispracaj?: { Ime: string; Prezime: string } | null;
}

export interface Placanje {
  PlacanjeID: number;
  RezervacijaID: number;
  Iznos: number;
  DatumPlacanja: string;
  NacinPlacanja: 'gotovina' | 'kartica' | 'online';
}

export interface Racun {
  RacunID: number;
  RezervacijaID: number;
  DatumIzdavanja: string;
  UkupanIznos: number;
  rezervacija?: Rezervacija;
}

export interface Rezervacija {
  RezervacijaID: number;
  SifraApartmana: string;
  GostID: number;
  DatumPocetka: string;
  DatumZavrsetka: string;
  BrojGostiju: number;
  Cena: number;
  Status: 'kreirana' | 'potvrdjena' | 'otkazana' | 'realizovana';
  apartman?: Apartman;
  gost?: Gost;
  boravak?: Boravak | null;
  placanja?: Placanje[];
  racuni?: Racun[];
}

export interface Odrzavanje {
  OdrzavanjeID: number;
  SifraApartmana: string;
  VrstaAktivnosti: 'ciscenje' | 'popravka' | 'tehnicko_odrzavanje';
  Datum: string;
  OpisRadova: string | null;
  OdgovornaOsoba: string;
  apartman?: { SifraApartmana: string; Naziv: string };
}

// odgovor na prijavu i registraciju
export interface OdgovorPrijave {
  token: string;
  korisnik: Korisnik;
}
