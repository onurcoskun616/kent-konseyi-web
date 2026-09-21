/**
 * Yedeklenen tablolar ve geri yükleme sırası.
 *
 * Sıralama önemli: geri yüklerken önce başvurulan tablolar (councils,
 * commissions) yazılmalı, yoksa yabancı anahtar kısıtları hata verir.
 *
 * contact_submissions bu listede BİLEREK yok. İletişim formu başvuruları
 * kişisel veri içeriyor (ad, e-posta, mesaj) ve bu yedek herkese açık kod
 * deposuna işleniyor. Başvuruların yedeği docs/yedekleme.md'de anlatılan
 * elle alınan tam yedekte.
 */
export const ICERIK_TABLOLARI = [
  'site_settings',
  'site_pages',
  'social_links',
  'hero_slides',
  'board_members',
  'councils',
  'commissions',
  'council_members',
  'commission_members',
  'news',
  'events',
  'projects',
  'documents',
  'gallery_items',
  'bulletins',
];

export const YEDEK_DOSYASI = 'backups/icerik-yedegi.json';
