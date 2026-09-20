/*
# İletişim Bilgileri ve Sosyal Medya Yönetimi

## Amacı
İçerik planının 7. bölümü, iletişim sayfasında adres, telefon, e-posta,
harita ve sosyal medya bağlantılarını istiyor. Bu bilgiler kodda sabitti;
yönetim panelinden düzenlenebilir hale getiriliyor.

## Değişiklikler
1. `site_settings` tablosuna iletişim alanları eklendi:
   - `phone`, `email`, `address` — iletişim sayfası ve alt bilgi
   - `map_embed_url` — gömülü harita adresi (https olmalı)
2. Yeni `social_links` tablosu. Sabit sütunlar yerine ayrı tablo kullanıldı;
   böylece Facebook, Instagram, X, YouTube dışındaki platformlar da
   eklenebiliyor.

## Güvenlik
- RLS etkin. SELECT herkese açık (yalnızca yayında olanlar).
- INSERT/UPDATE/DELETE yalnızca authenticated (yönetim paneli).
*/

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS map_embed_url text;

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_social_links" ON social_links;
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_read_all_social_links" ON social_links;
CREATE POLICY "auth_read_all_social_links" ON social_links FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_social_links" ON social_links;
CREATE POLICY "auth_insert_social_links" ON social_links FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_social_links" ON social_links;
CREATE POLICY "auth_update_social_links" ON social_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_social_links" ON social_links;
CREATE POLICY "auth_delete_social_links" ON social_links FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_social_links_display_order ON social_links (display_order);
