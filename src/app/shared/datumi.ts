// Pomoćne funkcije za datume (format YYYY-MM-DD, kao u bazi)

export function uTekst(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dan = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dan}`;
}

export function danas(): string {
  return uTekst(new Date());
}

export function pocetakMeseca(): string {
  const d = new Date();
  return uTekst(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function krajMeseca(): string {
  const d = new Date();
  return uTekst(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

// broj noćenja između dva datuma
export function brojNocenja(od: string, doDatuma: string): number {
  if (!od || !doDatuma) return 0;
  const razlika = new Date(doDatuma).getTime() - new Date(od).getTime();
  return Math.round(razlika / 86400000);
}
