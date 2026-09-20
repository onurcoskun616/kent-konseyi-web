/*
# Sayfa İçerikleri (site_pages)

## Amacı
Sitedeki sabit kodlu sayfa başlıklarını (Ana Sayfa dışındaki her sayfanın üst başlığı,
alt başlığı, açıklaması ve Kurumsal alt sayfalarının uzun metinleri) admin panelinden
düzenlenebilir hale getirmek. Böylece "Etkinlik Takvimi", "Fotoğraf Galerisi", "Belgeler"
gibi sayfa başlıkları ve açıklamaları kod değişikliği gerektirmeden güncellenebilir.

## Yeni Tablo
`site_pages`
- `slug` (text, benzersiz) — sayfayı koddaki karşılığıyla eşleştiren anahtar
  (örn. 'takvim', 'galeri', 'belgeler', 'kurumsal-hakkimizda')
- `eyebrow` (text) — sayfa üstü küçük etiket
- `title` (text) — sayfa başlığı (H1)
- `description` (text) — sayfa başlığı altındaki açıklama
- `heading` (text) — sayfa içeriğindeki ikincil başlık (SectionHeading)
- `body` (text) — uzun açıklama metni; Kurumsal alt sayfalarında birden fazla paragraf
  boş satırla ayrılarak saklanır

## Güvenlik
- RLS etkin. SELECT herkese açık (sayfa içerikleri zaten herkese görünür).
- INSERT/UPDATE/DELETE yalnızca authenticated (yönetim paneli).
*/

CREATE TABLE IF NOT EXISTS site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  eyebrow text,
  title text,
  description text,
  heading text,
  body text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_pages" ON site_pages;
CREATE POLICY "public_read_site_pages" ON site_pages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_site_pages" ON site_pages;
CREATE POLICY "auth_insert_site_pages" ON site_pages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_site_pages" ON site_pages;
CREATE POLICY "auth_update_site_pages" ON site_pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_site_pages" ON site_pages;
CREATE POLICY "auth_delete_site_pages" ON site_pages FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON site_pages (slug);
