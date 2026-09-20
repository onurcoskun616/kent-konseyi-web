/*
# Ana Sayfa içerikleri

Ana sayfanın hero, karşılama şeridi, başkan mesajı girişi, hızlı erişim ve
haberler/etkinlikler/galeri bölüm başlıklarını `site_pages` tablosuna taşır,
böylece admin panelinden düzenlenebilir hale gelir.
*/

INSERT INTO site_pages (slug, eyebrow, title, description, heading, body) VALUES
  ('ana-sayfa-hero', 'Ortak aklın, ortak geleceğin adresi', 'Birlikte daha güçlü bir kent.', 'Küçükçekmece için fikri, emeği ve umudu olan herkesin buluşma noktasıyız.', 'Yaşayan bir kent', 'Hep birlikte üretiyoruz.'),
  ('ana-sayfa-karsilama', 'Küçükçekmece Kent Konseyi', null, null, null, 'Yaşadığımız kenti birlikte düşünüyor, birlikte tasarlıyor ve birlikte güzelleştiriyoruz.'),
  ('ana-sayfa-baskan-mesaji', 'Başkan Mesajı', null, null, 'Kentin geleceğinde sözümüz var.', 'Küçükçekmece’yi ortak akılla, katılımcı demokrasiyle ve birlikte üretme kültürüyle geleceğe taşıyoruz.'),
  ('ana-sayfa-hizli-erisim', 'Hızlı Erişim', null, null, 'Aradığınız bilgiye kolayca ulaşın.', null),
  ('ana-sayfa-haberler', 'Gündemden', null, null, 'Son haberler', null),
  ('ana-sayfa-etkinlikler', 'Takvim', null, null, 'Yaklaşan etkinlikler', null),
  ('ana-sayfa-galeri', 'Galeri', null, null, 'Birlikte üretiyoruz.', null)
ON CONFLICT (slug) DO NOTHING;
