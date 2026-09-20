/*
# Kurumsal Menü Geliştirmeleri

## Amacı
İçerik planındaki "4. Kurumsal Menüsü" tablosundaki yapısal gereksinimleri
karşılamak:
- Başkanın Mesajı sayfası için fotoğraf alanı
- Yürütme Kurulu için üye listesi (fotoğraf, ad, unvan)

## Değişiklikler
1. `site_pages` tablosuna isteğe bağlı `image_url` sütunu eklendi (herhangi
   bir sayfa içeriğine admin panelinden görsel eklenebilir).
2. Yeni `board_members` tablosu (Yürütme Kurulu üyeleri).

## Güvenlik
- RLS etkin. SELECT herkese açık (yalnızca yayında olanlar).
- INSERT/UPDATE/DELETE yalnızca authenticated (yönetim paneli).
*/

ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Üye',
  photo_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_board_members" ON board_members;
CREATE POLICY "public_read_board_members" ON board_members FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_read_all_board_members" ON board_members;
CREATE POLICY "auth_read_all_board_members" ON board_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_board_members" ON board_members;
CREATE POLICY "auth_insert_board_members" ON board_members FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_board_members" ON board_members;
CREATE POLICY "auth_update_board_members" ON board_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_board_members" ON board_members;
CREATE POLICY "auth_delete_board_members" ON board_members FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_board_members_display_order ON board_members (display_order);
