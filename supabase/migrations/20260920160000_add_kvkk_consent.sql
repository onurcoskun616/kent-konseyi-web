/*
# Form Onayı (KVKK)

## Amacı
İçerik planının 8. bölümü "KVKK uyumlu form onayları" istiyor. İletişim
formunda açık rıza kutusu yoktu ve verilen onay hiçbir yerde saklanmıyordu.

## Değişiklik
`contact_submissions` tablosuna `kvkk_consent` sütunu eklendi. Onayın
kendisinin kayıt altında olması, aydınlatma yükümlülüğünün denetlenebilmesi
için gerekli.

Mevcut kayıtlar onay kutusu olmadan gönderildiği için varsayılan false
kalır; bu, gerçek durumu doğru yansıtır.
*/

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS kvkk_consent boolean NOT NULL DEFAULT false;
