/*
# İçerik mimarisi genişletmesi: Meclisler, Komisyonlar, Projeler, Belgeler, Bültenler, Galeri, Başvurular

## Amacı
Küçükçekmece Kent Konseyi web sitesinin brief dokümanında tanımlanan tam içerik mimarisini
veritabanına taşımak: Meclisler ve Komisyonlar kendi üyeleriyle birlikte yönetilebilir hale
gelir; Projeler, Belgeler, Bültenler ve Galeri öğeleri eklenir; haber/etkinlik/proje/belge/galeri
kayıtları ilgili meclis veya komisyonla ilişkilendirilebilir; İletişim/Katılım formundan gelen
başvurular veritabanında saklanır.

## Yeni Tablolar
1. `councils` — Meclisler (Gençlik, Kadın, Öğrenci, Engelli vb.)
2. `council_members` — Meclis başkan/yönetim üyeleri
3. `commissions` — Komisyonlar
4. `commission_members` — Komisyon başkan/yönetim üyeleri
5. `projects` — Projeler ve Faaliyetler
6. `documents` — Belgeler (karar, rapor, tutanak, form, yönetmelik, stratejik plan)
7. `bulletins` — Aylık/Yıllık bültenler
8. `gallery_items` — Fotoğraf ve video galerisi
9. `contact_submissions` — İletişim/Katılım formu başvuruları (gönüllü, meclis, komisyon, etkinlik, öneri)

## Mevcut Tablolarda Değişiklik
- `news` ve `events` tablolarına `council_id`, `commission_id` (isteğe bağlı ilişkilendirme) eklendi.
- `events` tablosuna `category` eklendi (Meclis Toplantısı, Komisyon Toplantısı, Eğitim, Çalıştay, Sergi, Başvuru).

## Depolama (Storage)
- `media` bucket'ı: kapak görselleri, galeri fotoğraf/videoları (herkese açık okuma).
- `documents` bucket'ı: PDF belgeler ve bültenler (herkese açık okuma).
- Her iki bucket'a yazma yalnızca authenticated (giriş yapmış yönetici) kullanıcılara açık.

## Güvenlik
- Tüm yeni tablolarda RLS etkin.
- SELECT: anon + authenticated herkese açık, yalnızca `is_published = true` olan kayıtlar
  (üye tabloları ve `contact_submissions` hariç — aşağıya bakınız).
- INSERT/UPDATE/DELETE: yalnızca authenticated (yönetim paneli).
- `council_members` / `commission_members`: SELECT herkese açık (üyeler listesi zaten public
  sayfada gösterilecek), yazma yalnızca authenticated.
- `contact_submissions`: INSERT herkese açık (ziyaretçi formu gönderebilir), SELECT/UPDATE/DELETE
  yalnızca authenticated (yönetici başvuruları panelden görüp yönetir). Ziyaretçi kendi
  gönderdiği kaydı bile geri okuyamaz; bu formun amacına uygundur.
*/

-- 1) councils --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS councils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  cover_image_url text,
  about text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS council_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id uuid NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Üye',
  photo_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) commissions --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  cover_image_url text,
  about text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Üye',
  photo_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) projects --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Devam Eden',
  description text NOT NULL DEFAULT '',
  body text,
  cover_image_url text,
  start_date date,
  end_date date,
  council_id uuid REFERENCES councils(id) ON DELETE SET NULL,
  commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) documents --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Rapor',
  file_url text NOT NULL,
  description text,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  council_id uuid REFERENCES councils(id) ON DELETE SET NULL,
  commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) bulletins --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bulletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  period text NOT NULL DEFAULT 'Aylık',
  file_url text NOT NULL,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) gallery_items --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  media_type text NOT NULL DEFAULT 'photo',
  media_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'Genel',
  council_id uuid REFERENCES councils(id) ON DELETE SET NULL,
  commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) contact_submissions --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'Bilgi Talebi',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL DEFAULT '',
  council_id uuid REFERENCES councils(id) ON DELETE SET NULL,
  commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Yeni',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) news / events ilişkilendirme --------------------------------------------------------------
ALTER TABLE news ADD COLUMN IF NOT EXISTS council_id uuid REFERENCES councils(id) ON DELETE SET NULL;
ALTER TABLE news ADD COLUMN IF NOT EXISTS commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS council_id uuid REFERENCES councils(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Etkinlik';

-- RLS etkinleştirme --------------------------------------------------------------
ALTER TABLE councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- councils policies
DROP POLICY IF EXISTS "public_read_councils" ON councils;
CREATE POLICY "public_read_councils" ON councils FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_councils" ON councils;
CREATE POLICY "auth_insert_councils" ON councils FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_councils" ON councils;
CREATE POLICY "auth_update_councils" ON councils FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_councils" ON councils;
CREATE POLICY "auth_delete_councils" ON councils FOR DELETE TO authenticated USING (true);
-- authenticated (admin panel) kendi taslak kayıtlarını da görebilmeli
DROP POLICY IF EXISTS "auth_read_all_councils" ON councils;
CREATE POLICY "auth_read_all_councils" ON councils FOR SELECT TO authenticated USING (true);

-- council_members policies
DROP POLICY IF EXISTS "public_read_council_members" ON council_members;
CREATE POLICY "public_read_council_members" ON council_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_council_members" ON council_members;
CREATE POLICY "auth_insert_council_members" ON council_members FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_council_members" ON council_members;
CREATE POLICY "auth_update_council_members" ON council_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_council_members" ON council_members;
CREATE POLICY "auth_delete_council_members" ON council_members FOR DELETE TO authenticated USING (true);

-- commissions policies
DROP POLICY IF EXISTS "public_read_commissions" ON commissions;
CREATE POLICY "public_read_commissions" ON commissions FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_commissions" ON commissions;
CREATE POLICY "auth_insert_commissions" ON commissions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_commissions" ON commissions;
CREATE POLICY "auth_update_commissions" ON commissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_commissions" ON commissions;
CREATE POLICY "auth_delete_commissions" ON commissions FOR DELETE TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_read_all_commissions" ON commissions;
CREATE POLICY "auth_read_all_commissions" ON commissions FOR SELECT TO authenticated USING (true);

-- commission_members policies
DROP POLICY IF EXISTS "public_read_commission_members" ON commission_members;
CREATE POLICY "public_read_commission_members" ON commission_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_commission_members" ON commission_members;
CREATE POLICY "auth_insert_commission_members" ON commission_members FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_commission_members" ON commission_members;
CREATE POLICY "auth_update_commission_members" ON commission_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_commission_members" ON commission_members;
CREATE POLICY "auth_delete_commission_members" ON commission_members FOR DELETE TO authenticated USING (true);

-- projects policies
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_read_all_projects" ON projects;
CREATE POLICY "auth_read_all_projects" ON projects FOR SELECT TO authenticated USING (true);

-- documents policies
DROP POLICY IF EXISTS "public_read_documents" ON documents;
CREATE POLICY "public_read_documents" ON documents FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_documents" ON documents;
CREATE POLICY "auth_insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_documents" ON documents;
CREATE POLICY "auth_update_documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_documents" ON documents;
CREATE POLICY "auth_delete_documents" ON documents FOR DELETE TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_read_all_documents" ON documents;
CREATE POLICY "auth_read_all_documents" ON documents FOR SELECT TO authenticated USING (true);

-- bulletins policies
DROP POLICY IF EXISTS "public_read_bulletins" ON bulletins;
CREATE POLICY "public_read_bulletins" ON bulletins FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_bulletins" ON bulletins;
CREATE POLICY "auth_insert_bulletins" ON bulletins FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_bulletins" ON bulletins;
CREATE POLICY "auth_update_bulletins" ON bulletins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_bulletins" ON bulletins;
CREATE POLICY "auth_delete_bulletins" ON bulletins FOR DELETE TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_read_all_bulletins" ON bulletins;
CREATE POLICY "auth_read_all_bulletins" ON bulletins FOR SELECT TO authenticated USING (true);

-- gallery_items policies
DROP POLICY IF EXISTS "public_read_gallery_items" ON gallery_items;
CREATE POLICY "public_read_gallery_items" ON gallery_items FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "auth_insert_gallery_items" ON gallery_items;
CREATE POLICY "auth_insert_gallery_items" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_gallery_items" ON gallery_items;
CREATE POLICY "auth_update_gallery_items" ON gallery_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_gallery_items" ON gallery_items;
CREATE POLICY "auth_delete_gallery_items" ON gallery_items FOR DELETE TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_read_all_gallery_items" ON gallery_items;
CREATE POLICY "auth_read_all_gallery_items" ON gallery_items FOR SELECT TO authenticated USING (true);

-- contact_submissions policies
DROP POLICY IF EXISTS "public_insert_contact_submissions" ON contact_submissions;
CREATE POLICY "public_insert_contact_submissions" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_read_contact_submissions" ON contact_submissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_update_contact_submissions" ON contact_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_delete_contact_submissions" ON contact_submissions FOR DELETE TO authenticated USING (true);

-- İndeksler --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_councils_slug ON councils (slug);
CREATE INDEX IF NOT EXISTS idx_council_members_council_id ON council_members (council_id);
CREATE INDEX IF NOT EXISTS idx_commissions_slug ON commissions (slug);
CREATE INDEX IF NOT EXISTS idx_commission_members_commission_id ON commission_members (commission_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_council_id ON projects (council_id);
CREATE INDEX IF NOT EXISTS idx_projects_commission_id ON projects (commission_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_published_at ON documents (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulletins_published_at ON bulletins (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items (category);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_news_council_id ON news (council_id);
CREATE INDEX IF NOT EXISTS idx_news_commission_id ON news (commission_id);
CREATE INDEX IF NOT EXISTS idx_events_council_id ON events (council_id);
CREATE INDEX IF NOT EXISTS idx_events_commission_id ON events (commission_id);

-- Storage bucket'ları --------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_media" ON storage.objects;
CREATE POLICY "public_read_media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
DROP POLICY IF EXISTS "auth_write_media" ON storage.objects;
CREATE POLICY "auth_write_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
DROP POLICY IF EXISTS "auth_update_media" ON storage.objects;
CREATE POLICY "auth_update_media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
DROP POLICY IF EXISTS "auth_delete_media" ON storage.objects;
CREATE POLICY "auth_delete_media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "public_read_documents_bucket" ON storage.objects;
CREATE POLICY "public_read_documents_bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'documents');
DROP POLICY IF EXISTS "auth_write_documents_bucket" ON storage.objects;
CREATE POLICY "auth_write_documents_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
DROP POLICY IF EXISTS "auth_update_documents_bucket" ON storage.objects;
CREATE POLICY "auth_update_documents_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
DROP POLICY IF EXISTS "auth_delete_documents_bucket" ON storage.objects;
CREATE POLICY "auth_delete_documents_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
