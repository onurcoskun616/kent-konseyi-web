/*
# Haberler ve Etkinlikler tabloları

## Amacı
Küçükçekmece Kent Konseyi web sitesinde haberleri ve etkinlikleri veritabanından dinamik
olarak göstermek; içerikleri bir yönetim paneli üzerinden ekleyip güncellemeyi sağlamak.

## Yeni Tablolar
1. `news` — Haberler ve duyurular
   - `id` (uuid, birincil anahtar)
   - `title` (text, başlık, zorunlu)
   - `category` (text, kategori: 'Duyuru', 'Etkinlik', 'Proje' vb.)
   - `published_at` (date, haberin tarihi)
   - `excerpt` (text, kısa özet)
   - `body` (text, haberin tam metni, isteğe bağlı)
   - `image_url` (text, görsel URL'i, isteğe bağlı)
   - `is_published` (boolean, yayında mı, varsayılan true)
   - `created_at` (timestamptz, oluşturma tarihi)

2. `events` — Etkinlikler
   - `id` (uuid, birincil anahtar)
   - `title` (text, etkinlik adı, zorunlu)
   - `event_date` (date, etkinlik tarihi)
   - `event_time` (text, etkinlik saati, isteğe bağlı)
   - `location` (text, mekan, isteğe bağlı)
   - `description` (text, açıklama)
   - `is_published` (boolean, yayında mı, varsayılan true)
   - `created_at` (timestamptz, oluşturma tarihi)

## Güvenlik
- Her iki tabloda da RLS etkin.
- SELECT: anon + authenticated herkese açık (yayında olan içerik).
- INSERT/UPDATE/DELETE: yalnızca authenticated (giriş yapmış yönetici).
- Bu, giriş ekranı olan bir uygulama olduğu için authenticated kısıtlaması doğrudur.

## Önemli Notlar
1. Ziyaretçiler yalnızca yayında olan (is_published = true) kayıtları görebilir.
2. Yönetici panelinden giriş yapan kullanıcılar tüm kayıtları yönetebilir.
3. seed_data migration'ı ile başlangıç verileri yüklenecektir.
*/

CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Duyuru',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  excerpt text NOT NULL DEFAULT '',
  body text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  event_time text,
  location text,
  description text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- news: SELECT (herkese açık, yalnızca yayında olanlar)
DROP POLICY IF EXISTS "public_read_news" ON news;
CREATE POLICY "public_read_news"
ON news FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- news: INSERT (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_insert_news" ON news;
CREATE POLICY "auth_insert_news"
ON news FOR INSERT
TO authenticated
WITH CHECK (true);

-- news: UPDATE (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_update_news" ON news;
CREATE POLICY "auth_update_news"
ON news FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- news: DELETE (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_delete_news" ON news;
CREATE POLICY "auth_delete_news"
ON news FOR DELETE
TO authenticated
USING (true);

-- events: SELECT (herkese açık, yalnızca yayında olanlar)
DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events"
ON events FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- events: INSERT (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_insert_events" ON events;
CREATE POLICY "auth_insert_events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- events: UPDATE (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_update_events" ON events;
CREATE POLICY "auth_update_events"
ON events FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- events: DELETE (yalnızca authenticated)
DROP POLICY IF EXISTS "auth_delete_events" ON events;
CREATE POLICY "auth_delete_events"
ON events FOR DELETE
TO authenticated
USING (true);

-- Yardımcı indeksler
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news (is_published);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events (event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events (is_published);