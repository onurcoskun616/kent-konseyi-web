/*
# Form Gönderim Sınırı (Spam Koruması)

## Amacı
İçerik planının 8. bölümü "spam koruması" istiyor. İletişim formu anon
anahtarla doğrudan contact_submissions tablosuna yazıyor ve anon anahtar
istemci paketinin içinde herkese açık. Bu nedenle honeypot / süre kontrolü
gibi istemci tarafı önlemler yalnızca formu kullanan basit botları durdurur;
doğrudan REST API'ye istek atan biri bunları atlayabilir.

Atlanamayacak tek katman veritabanı tarafı olduğu için sınır buraya konuldu.

## Kural
Aynı e-posta adresiyle saatte en fazla 3 başvuru. Tetikleyici anon rolün
okuma yetkisi olmadığından SECURITY DEFINER; search_path sabitlenerek
search_path üzerinden kötüye kullanım engellendi.

Hata mesajı olarak makine tarafından okunabilir 'rate_limit_exceeded'
kullanılıyor; arayüz bunu yakalayıp kullanıcıya Türkçe açıklama gösteriyor.

## Kapsam notu
Bu kural aynı e-postayı tekrar tekrar gönderen botları ve kazara çift
gönderimi durdurur. E-posta adresini sürekli değiştiren hedefli bir saldırı
için captcha doğrulaması yapan bir Edge Function gerekir.
*/

CREATE OR REPLACE FUNCTION public.limit_contact_submission_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.contact_submissions
  WHERE email = NEW.email
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_contact_submission_rate ON contact_submissions;
CREATE TRIGGER trg_limit_contact_submission_rate
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.limit_contact_submission_rate();
