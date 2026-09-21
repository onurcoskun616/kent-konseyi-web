# İletişim Formu E-posta Bildirimi — Kurulum

İletişim formuna yeni bir başvuru düştüğünde yöneticiye otomatik e-posta
gönderilir. Bildirim altyapısı kurulu; çalışması için bir kez aşağıdaki
ayarların yapılması gerekiyor.

Ayarlar tamamlanmadan da site sorunsuz çalışır: başvuru normal şekilde
kaydedilir, yalnızca bildirim e-postası gönderilmez.

## Nasıl çalışıyor

```
Form gönderimi
      ↓
contact_submissions tablosuna kayıt
      ↓
AFTER INSERT tetikleyicisi (notify_contact_submission)
      ↓
pg_net ile Resend API'sine asenkron istek
      ↓
Bildirim adresine e-posta
```

Gönderim asenkron olduğu için e-posta servisi yavaşlasa veya hata verse bile
kullanıcının form gönderimi gecikmez ya da başarısız olmaz.

## 1. Adım — Resend hesabı ve API anahtarı

1. <https://resend.com> üzerinden ücretsiz hesap açın (ayda 3.000 e-posta).
2. **API Keys → Create API Key** ile bir anahtar oluşturun. Anahtar
   `re_` ile başlar ve yalnızca bir kez gösterilir, kaydedin.
3. Gönderen adres için iki seçenek var:
   - **Hızlı deneme:** `onboarding@resend.dev`. Bu adresle yalnızca Resend
     hesabınızı açtığınız e-posta adresine gönderim yapabilirsiniz.
   - **Kalıcı kullanım:** **Domains** bölümünden
     `kucukcekmecekentkonseyi.org` alan adını ekleyip gösterilen DNS
     kayıtlarını girin. Doğrulandıktan sonra
     `bildirim@kucukcekmecekentkonseyi.org` gibi bir adresten
     herhangi bir alıcıya gönderim yapabilirsiniz.

## 2. Adım — Anahtarı Supabase'e kaydetme

Anahtar veritabanında Vault içinde şifreli tutulur; kod deposunda veya
migration dosyalarında yer almaz.

Supabase panelinde **SQL Editor**'ü açıp aşağıyı çalıştırın. `re_xxx` ve
gönderen adresi kendi değerlerinizle değiştirin:

```sql
select vault.create_secret('re_xxx',                'resend_api_key');
select vault.create_secret('onboarding@resend.dev', 'resend_from_email');
```

Sonradan değiştirmek isterseniz (örneğin alan adınız doğrulandığında):

```sql
select vault.update_secret(
  (select id from vault.secrets where name = 'resend_from_email'),
  'Kent Konseyi <bildirim@kucukcekmecekentkonseyi.org>'
);
```

## 3. Adım — Bildirim adresini seçme

Admin paneli → **Site Ayarları → İletişim Bilgileri → Bildirim adresi**.

Boş bırakılırsa aynı bölümdeki **E-posta** alanı kullanılır. Bu alan
siteye yansımaz, yalnızca bildirim için kullanılır — dolayısıyla halka
açık kurum adresinden farklı, kişisel bir adres de yazılabilir.

## Çalışıp çalışmadığını kontrol etme

Sitedeki iletişim formundan bir deneme başvurusu gönderin, ardından SQL
Editor'de:

```sql
select created, status_code, content
from net._http_response
order by created desc
limit 5;
```

- `status_code = 200` → e-posta Resend'e iletildi.
- `401` → API anahtarı hatalı.
- `403` veya `422` → gönderen adres doğrulanmamış ya da alıcı, doğrulanmamış
  alan adıyla gönderimde izin verilen adres değil.
- Hiç satır yok → tetikleyici isteği hiç göndermemiş demektir; büyük
  ihtimalle üç ayardan biri (API anahtarı, gönderen adres, bildirim adresi)
  eksiktir.

`net._http_response` tablosu geçicidir, kayıtlar bir süre sonra silinir.

## Bildirimi geçici olarak kapatma

```sql
alter table contact_submissions disable trigger trg_notify_contact_submission;
-- yeniden açmak için: enable trigger
```
