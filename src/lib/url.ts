export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

// Yöneticinin elle girdiği adresler doğrudan href'e konmadan önce buradan
// geçer. Amaç yalnızca yazım hatası yakalamak değil: href'e konan bir
// "javascript:..." adresi, bağlantıya tıklayan ziyaretçinin tarayıcısında
// kod çalıştırır. Yalnızca http ve https'e izin verilerek bu kapatılıyor.
export function externalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : null;
  } catch {
    // Protokolsüz adres (örn. "kayit.example.com") URL olarak ayrıştırılamaz.
    return null;
  }
}
