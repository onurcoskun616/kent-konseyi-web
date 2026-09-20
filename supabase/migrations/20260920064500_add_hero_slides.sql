/*
# Hero Slider (hero_slides)

## Amacı
Ana sayfadaki hero/slider alanını, admin panelinden yönetilebilen, birden
fazla görsel arasında otomatik dönen bir slider'a dönüştürmek. Kent Konseyi
tanıtım görselleri, güncel etkinlik duyuruları ve öne çıkan faaliyetler
ayrı slaytlar olarak eklenip sırayla gösterilebilir.

## Yeni Tablo
`hero_slides`
- `image_url` (text, zorunlu) — arka plan görseli
- `eyebrow`, `title`, `description` — slayt metinleri
- `button_label`, `button_href` — isteğe bağlı çağrı butonu
- `display_order` — gösterim sırası
- `is_published` — yayında mı

## Güvenlik
- RLS etkin. SELECT herkese açık (yalnızca yayında olanlar).
- INSERT/UPDATE/DELETE yalnızca authenticated (yönetim paneli).
*/

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  eyebrow text,
  title text,
  description text,
  button_label text,
  button_href text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hero_slides" ON hero_slides;
CREATE POLICY "public_read_hero_slides" ON hero_slides FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_read_all_hero_slides" ON hero_slides;
CREATE POLICY "auth_read_all_hero_slides" ON hero_slides FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_hero_slides" ON hero_slides;
CREATE POLICY "auth_insert_hero_slides" ON hero_slides FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_hero_slides" ON hero_slides;
CREATE POLICY "auth_update_hero_slides" ON hero_slides FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_hero_slides" ON hero_slides;
CREATE POLICY "auth_delete_hero_slides" ON hero_slides FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order ON hero_slides (display_order);

INSERT INTO hero_slides (image_url, eyebrow, title, description, button_label, button_href, display_order, is_published)
SELECT
  'https://images.pexels.com/photos/20027734/pexels-photo-20027734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Ortak aklın, ortak geleceğin adresi',
  'Birlikte daha güçlü bir kent.',
  'Küçükçekmece için fikri, emeği ve umudu olan herkesin buluşma noktasıyız.',
  'Kent için sözüm var',
  '/iletisim',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_slides);
