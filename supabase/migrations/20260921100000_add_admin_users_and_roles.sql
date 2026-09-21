/*
# Panel Kullanıcıları ve Yetkilendirme

## Sorun
Panelin tek bir hesabı vardı ve bütün yazma politikaları "authenticated
isen yazabilirsin" diyordu. Bunun iki sonucu var:

1. Paneli birden fazla kişi kullanacaksa herkes aynı hesabı paylaşmak
   zorunda; kimin ne değiştirdiği bilinmiyor, ayrılan kişinin erişimi
   ancak ortak şifre değiştirilerek kesiliyor.
2. Supabase'te yeni kayıt açıksa, anon anahtarı sitenin paketinde herkese
   açık olduğu için isteyen kendine hesap açıp sitenin tüm içeriğini
   değiştirebilir. Yetki "oturum açmış olmak"tan ibaret.

## Çözüm
Yetki artık oturum açmış olmaya değil, admin_users tablosunda etkin bir
satırının bulunmasına bağlı. Yeni kayıt açık kalsa bile, kendi kendine
hesap açan biri bu tabloda olmadığı için hiçbir şey yazamaz.

## Roller
- yonetici: her şey. Kullanıcıları yönetir, site ayarlarını değiştirir.
- editor:   yalnızca içerik (haber, etkinlik, proje, belge, galeri,
            bülten, meclis, komisyon, sayfa metinleri, slider, kurul
            üyeleri) ve form başvuruları.

Site ayarları (logo, iletişim bilgileri, sosyal medya) yöneticiye ayrıldı;
bunlar sitenin kimliğini belirleyen, nadiren değişen ve yanlış
değiştirildiğinde her sayfayı etkileyen alanlar.

## Yetki denetimi neden burada
Panelde bir sekmeyi gizlemek yetkilendirme değildir: anon anahtarıyla
PostgREST'e doğrudan istek atmak mümkün. Bu yüzden denetim RLS
politikalarında; arayüzdeki gizleme yalnızca görsel katman.

## Kilitlenmeye karşı
Mevcut auth kullanıcıları bu migration içinde yonetici olarak ekleniyor.
Politikalar değiştirilmeden önce eklendikleri için erişim kesintisi olmuyor.
Son yöneticinin silinmesi / yetkisinin düşürülmesi ayrı bir tetikleyiciyle
engelleniyor; aksi hâlde paneli açabilen kimse kalmayabilirdi.
*/

-- ============================================================
-- 1. Kullanıcı tablosu
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  -- auth.users ile aynı id: hesap silinince buradaki satır da gider.
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text,
  role       text NOT NULL DEFAULT 'editor' CHECK (role IN ('yonetici', 'editor')),
  -- Hesabı silmeden erişimi kesebilmek için. Ayrılan bir kişinin geçmişi
  -- kaybolmadan erişimi kapatılabiliyor.
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Mevcut hesapları yonetici yap (politikalar değişmeden ÖNCE)
-- ============================================================

INSERT INTO admin_users (id, email, role)
SELECT u.id, u.email, 'yonetici' FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Yetki yardımcıları
-- ============================================================

-- SECURITY DEFINER: admin_users'ın kendi RLS politikaları da bu fonksiyonu
-- çağırıyor; çağıran rolün yetkisiyle okusaydı sonsuz özyineleme olurdu.
CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.admin_users
  WHERE id = auth.uid() AND is_active
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(public.current_admin_role() = 'yonetici', false)
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(public.current_admin_role() IN ('yonetici', 'editor'), false)
$$;

-- Bu üçü RLS politikalarının içinden çağrılıyor ve politika ifadeleri
-- çağıran rolün yetkisiyle değerlendiriliyor; dolayısıyla EXECUTE gerekli.
-- Dışarıdan çağrılmaları zararsız: yalnızca çağıranın kendi rolünü döner.
GRANT EXECUTE ON FUNCTION public.current_admin_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()           TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff()           TO anon, authenticated;

-- ============================================================
-- 4. Son yöneticiyi koru
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  kalan integer;
BEGIN
  SELECT count(*) INTO kalan
  FROM public.admin_users
  WHERE role = 'yonetici' AND is_active
    AND id <> coalesce(OLD.id, NEW.id);

  -- DELETE'te NEW tanımsız olduğu için dallar ayrı tutuldu; tek bir OR
  -- ifadesinde NEW'e dokunmak silme sırasında hata verirdi.
  IF kalan = 0 THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'son_yonetici_korunuyor';
    ELSIF NEW.role <> 'yonetici' OR NOT NEW.is_active THEN
      RAISE EXCEPTION 'son_yonetici_korunuyor';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_last_admin() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_last_admin ON admin_users;
CREATE TRIGGER trg_protect_last_admin
  BEFORE UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_admin();

-- updated_at'i elle güncellemeyi unutmamak için.
CREATE OR REPLACE FUNCTION public.touch_admin_users()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.touch_admin_users() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_touch_admin_users ON admin_users;
CREATE TRIGGER trg_touch_admin_users
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION public.touch_admin_users();

-- ============================================================
-- 5. admin_users politikaları
-- ============================================================

DROP POLICY IF EXISTS staff_read_admin_users   ON admin_users;
DROP POLICY IF EXISTS admin_insert_admin_users ON admin_users;
DROP POLICY IF EXISTS admin_update_admin_users ON admin_users;
DROP POLICY IF EXISTS admin_delete_admin_users ON admin_users;

-- Editör de listeyi görebiliyor: panelde kimin yetkili olduğunun görünür
-- olması, paneli birlikte kullanan ekip için bilgi; gizli bir veri değil.
CREATE POLICY staff_read_admin_users ON admin_users
  FOR SELECT TO authenticated USING (public.is_staff());

CREATE POLICY admin_insert_admin_users ON admin_users
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY admin_update_admin_users ON admin_users
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_delete_admin_users ON admin_users
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 6. İçerik tablolarının yazma politikalarını role bağla
-- ============================================================

DO $$
DECLARE
  t text;
  -- Editörün de düzenleyebildiği içerik tabloları.
  icerik_tablolari text[] := ARRAY[
    'board_members', 'bulletins', 'commission_members', 'commissions',
    'council_members', 'councils', 'documents', 'events', 'gallery_items',
    'hero_slides', 'news', 'projects', 'site_pages'
  ];
BEGIN
  FOREACH t IN ARRAY icerik_tablolari LOOP
    EXECUTE format('DROP POLICY IF EXISTS auth_insert_%1$s ON %1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS auth_update_%1$s ON %1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS auth_delete_%1$s ON %1$I', t);

    EXECUTE format(
      'CREATE POLICY staff_insert_%1$s ON %1$I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_update_%1$s ON %1$I FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_delete_%1$s ON %1$I FOR DELETE TO authenticated USING (public.is_staff())', t);
  END LOOP;
END $$;

-- ============================================================
-- 7. Site ayarları: yalnızca yönetici
-- ============================================================

DROP POLICY IF EXISTS auth_update_site_settings  ON site_settings;
DROP POLICY IF EXISTS admin_update_site_settings ON site_settings;
DROP POLICY IF EXISTS admin_insert_site_settings ON site_settings;

CREATE POLICY admin_update_site_settings ON site_settings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Ayar satırı hiç yoksa panel insert'e düşüyor; politikası olmadan
-- bu yol sessizce kırılırdı.
CREATE POLICY admin_insert_site_settings ON site_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS auth_insert_social_links  ON social_links;
DROP POLICY IF EXISTS auth_update_social_links  ON social_links;
DROP POLICY IF EXISTS auth_delete_social_links  ON social_links;
DROP POLICY IF EXISTS auth_read_all_social_links ON social_links;

CREATE POLICY staff_read_all_social_links ON social_links
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY admin_insert_social_links ON social_links
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_social_links ON social_links
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_social_links ON social_links
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 8. Form başvuruları
-- ============================================================

-- Herkesin gönderebilmesi gereken INSERT politikasına dokunulmuyor.
DROP POLICY IF EXISTS auth_read_contact_submissions   ON contact_submissions;
DROP POLICY IF EXISTS auth_update_contact_submissions ON contact_submissions;
DROP POLICY IF EXISTS auth_delete_contact_submissions ON contact_submissions;

CREATE POLICY staff_read_contact_submissions ON contact_submissions
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY staff_update_contact_submissions ON contact_submissions
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY staff_delete_contact_submissions ON contact_submissions
  FOR DELETE TO authenticated USING (public.is_staff());

-- ============================================================
-- 9. Depolama (görsel ve PDF yükleme)
-- ============================================================

-- Tablolar role bağlanıp depolama açık kalsaydı, yetkisiz bir hesap
-- içerik yazamasa da dosya yükleyip silebilirdi.
DROP POLICY IF EXISTS auth_write_media            ON storage.objects;
DROP POLICY IF EXISTS auth_update_media           ON storage.objects;
DROP POLICY IF EXISTS auth_delete_media           ON storage.objects;
DROP POLICY IF EXISTS auth_write_documents_bucket ON storage.objects;
DROP POLICY IF EXISTS auth_update_documents_bucket ON storage.objects;
DROP POLICY IF EXISTS auth_delete_documents_bucket ON storage.objects;

CREATE POLICY staff_write_media ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff());
CREATE POLICY staff_update_media ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff()) WITH CHECK (bucket_id = 'media' AND public.is_staff());
CREATE POLICY staff_delete_media ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff());

CREATE POLICY staff_write_documents_bucket ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND public.is_staff());
CREATE POLICY staff_update_documents_bucket ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND public.is_staff()) WITH CHECK (bucket_id = 'documents' AND public.is_staff());
CREATE POLICY staff_delete_documents_bucket ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents' AND public.is_staff());
