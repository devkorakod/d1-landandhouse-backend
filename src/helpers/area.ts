/** หน่วยพื้นที่ไทย: 1 ไร่ = 4 งาน = 400 ตร.วา = 1,600 ตร.ม. */
export const SQM_PER_RAI = 1600;
export const SQM_PER_NGAN = 400;
export const SQM_PER_WAH = 4;

export function thaiAreaToSqm(rai = 0, ngan = 0, wah = 0): number {
  return rai * SQM_PER_RAI + ngan * SQM_PER_NGAN + wah * SQM_PER_WAH;
}

export function sqmToThaiArea(sqm: number) {
  const wahTotal = sqm / SQM_PER_WAH;
  const rai = Math.floor(wahTotal / 400);
  const ngan = Math.floor((wahTotal % 400) / 100);
  const wah = Number((wahTotal % 100).toFixed(2));
  return { rai, ngan, wah };
}

export function formatThaiArea(rai = 0, ngan = 0, wah = 0, locale: 'th' | 'en' = 'th'): string {
  const u = locale === 'th'
    ? { rai: 'ไร่', ngan: 'งาน', wah: 'ตร.ว.' }
    : { rai: 'rai', ngan: 'ngan', wah: 'sq.wah' };
  const parts: string[] = [];
  if (rai) parts.push(`${rai} ${u.rai}`);
  if (ngan) parts.push(`${ngan} ${u.ngan}`);
  if (wah) parts.push(`${wah} ${u.wah}`);
  return parts.join(' ') || '-';
}

export function formatSqm(sqm?: number | null, locale: 'th' | 'en' = 'th'): string {
  if (!sqm) return '-';
  const n = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US',
    { maximumFractionDigits: 2 }).format(sqm);
  return locale === 'th' ? `${n} ตร.ม.` : `${n} sq.m.`;
}
