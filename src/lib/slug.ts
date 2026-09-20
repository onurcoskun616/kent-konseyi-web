// Türkçe harfler önce eşlenir: 'İ'.toLowerCase() birleşik nokta (U+0307)
// ürettiği ve 'I'.toLowerCase() 'ı' yerine 'i' verdiği için doğrudan
// küçültme hatalı sonuç veriyor.
const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
};

export function slugify(text: string): string {
  return [...text]
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// Kayıtlar slug girilmeden de eklenebildiği için adres üretirken UUID'ye düşülür.
export function detailPath(base: string, item: { slug?: string | null; id: string }): string {
  return `${base}/${item.slug || item.id}`;
}
