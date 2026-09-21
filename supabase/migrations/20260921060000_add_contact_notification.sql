/*
# İletişim Formu E-posta Bildirimi

## Amacı
İçerik planının 4. maddesi, forma yeni bir başvuru düştüğünde yöneticinin
e-posta ile haberdar edilmesini istiyor. Şu anda başvurular yalnızca admin
panelindeki "Başvurular" sekmesinde görülüyor; kimse paneli açmazsa
başvurudan haberdar olunmuyor.

## Yaklaşım
Bildirim veritabanı tarafında, AFTER INSERT tetikleyicisiyle gönderiliyor.
Böylece başvuru hangi yoldan gelirse gelsin (site formu, ileride bir Edge
Function, elle eklenen kayıt) bildirim tetiklenir.

E-posta gönderimi için pg_net ile Resend API'sine asenkron bir istek
atılıyor. Asenkron olması önemli: istek kuyruğa alınıp işlem hemen devam
ediyor, dolayısıyla e-posta servisi yavaşlasa veya çökse bile kullanıcının
form gönderimi gecikmiyor ya da başarısız olmuyor.

Araya bir Edge Function konmadı; tek ihtiyaç duyulan şey bir HTTP isteği
olduğu için ek bir servis katmanı bakım yükünden başka bir şey getirmezdi.

## Yapılandırma
- API anahtarı ve gönderen adresi Vault'ta saklanır (aşağıdaki isimlerle).
  Anahtarın migration dosyasına yazılmaması için burada oluşturulmuyor;
  kurulum adımları docs/eposta-bildirimi.md içinde.
- Alıcı adres site_settings.notification_email sütununda; yönetici bunu
  admin panelinden değiştirebilir. Boşsa site_settings.email kullanılır.

Üçünden herhangi biri eksikse tetikleyici sessizce hiçbir şey yapmaz;
başvuru yine de kaydedilir. Bildirim, başvurunun kendisini engellememeli.
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS notification_email text;

COMMENT ON COLUMN site_settings.notification_email IS
  'Yeni form başvurularının bildirileceği adres. Boşsa site_settings.email kullanılır.';

-- HTML gövdesine gömülecek kullanıcı metinlerini kaçışlar. Başvuran kişinin
-- yazdığı "<" gibi karakterler aksi hâlde e-postanın HTML'ini bozabilir.
CREATE OR REPLACE FUNCTION public.html_escape(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT replace(replace(replace(replace(
    coalesce(value, ''),
    '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
$$;

CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault, pg_temp
AS $$
DECLARE
  api_key    text;
  from_email text;
  to_email   text;
  subject    text;
  body_html  text;
BEGIN
  SELECT decrypted_secret INTO api_key
  FROM vault.decrypted_secrets WHERE name = 'resend_api_key';

  SELECT decrypted_secret INTO from_email
  FROM vault.decrypted_secrets WHERE name = 'resend_from_email';

  SELECT coalesce(notification_email, email) INTO to_email
  FROM public.site_settings LIMIT 1;

  -- Yapılandırma tamamlanmadıysa bildirim atlanır, başvuru yine kaydedilir.
  IF api_key IS NULL OR from_email IS NULL OR to_email IS NULL THEN
    RETURN NULL;
  END IF;

  subject := 'Yeni form başvurusu: ' || NEW.type;

  body_html :=
    '<h2>Yeni form başvurusu</h2>' ||
    '<p><strong>Tür:</strong> ' || public.html_escape(NEW.type) || '</p>' ||
    '<p><strong>Ad Soyad:</strong> ' || public.html_escape(NEW.name) || '</p>' ||
    '<p><strong>E-posta:</strong> ' || public.html_escape(NEW.email) || '</p>' ||
    coalesce('<p><strong>Telefon:</strong> ' || public.html_escape(NEW.phone) || '</p>', '') ||
    '<p><strong>Mesaj:</strong><br>' ||
      replace(public.html_escape(NEW.message), E'\n', '<br>') || '</p>' ||
    '<hr><p style="color:#666;font-size:12px">' ||
      'Bu bildirim Küçükçekmece Kent Konseyi web sitesi iletişim formundan otomatik gönderildi. ' ||
      'Başvuruyu admin panelindeki Başvurular sekmesinden yanıtlayabilirsiniz.</p>';

  PERFORM net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    ),
    body := jsonb_build_object(
      'from',     from_email,
      'to',       jsonb_build_array(to_email),
      'subject',  subject,
      'html',     body_html,
      -- Yöneticinin doğrudan "Yanıtla" diyebilmesi için başvuranın adresi.
      'reply_to', NEW.email
    )
  );

  RETURN NULL;
EXCEPTION
  -- Bildirim başarısız olsa bile başvuru kaybolmamalı.
  WHEN OTHERS THEN
    RAISE WARNING 'İletişim bildirimi gönderilemedi: %', SQLERRM;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_contact_submission ON contact_submissions;
CREATE TRIGGER trg_notify_contact_submission
  AFTER INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_contact_submission();
