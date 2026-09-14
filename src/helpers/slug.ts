/** สร้าง slug จากข้อความ (รองรับไทย — คงอักขระไทยไว้เพื่อให้ URL สื่อความหมาย) */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96);
}

export function uniqueSlug(base: string, exists: (s: string) => Promise<boolean>) {
  return (async () => {
    const root = slugify(base) || 'item';
    let candidate = root;
    let n = 1;
    while (await exists(candidate)) candidate = `${root}-${++n}`;
    return candidate;
  })();
}
