export function formatPrice(value?: number | null, locale: 'th' | 'en' = 'th'): string {
  if (value == null) return locale === 'th' ? 'ติดต่อสอบถาม' : 'Price on request';
  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    style: 'currency', currency: 'THB', maximumFractionDigits: 0,
  }).format(value);
}

/** ย่อราคาแบบไทย: 185,000,000 → "185 ล้าน" */
export function formatPriceShort(value?: number | null, locale: 'th' | 'en' = 'th'): string {
  if (value == null) return locale === 'th' ? 'ติดต่อสอบถาม' : 'On request';
  if (locale === 'th') {
    if (value >= 1_000_000) return `${trim(value / 1_000_000)} ล้าน`;
    if (value >= 1_000) return `${trim(value / 1_000)} พัน`;
    return value.toLocaleString('th-TH');
  }
  if (value >= 1_000_000) return `฿${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `฿${trim(value / 1_000)}K`;
  return `฿${value.toLocaleString('en-US')}`;
}

const trim = (n: number) => Number(n.toFixed(2)).toString();
