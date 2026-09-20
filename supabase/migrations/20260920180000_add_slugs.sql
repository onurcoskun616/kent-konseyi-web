/*
# Okunabilir Adresler (slug)

## Amacı
İçerik planının 8. bölümü "okunabilir URL yapısı" istiyor. Haber, proje ve
etkinlik detay adresleri UUID taşıyordu (/haberler/2f9c8a1e-...).

## Değişiklik
`news`, `projects` ve `events` tablolarına isteğe bağlı `slug` sütunu
eklendi. Kısmi tekil indeks kullanıldı; böylece slug girilmemiş kayıtlar
(NULL) çakışma üretmeden var olabiliyor ve adres UUID ile çalışmaya devam
ediyor.

Tablolar şu an boş olduğu için geriye dönük doldurma gerekmedi.
*/

ALTER TABLE news ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON news (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events (slug) WHERE slug IS NOT NULL;
