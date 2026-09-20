/*
# Meclis ve Komisyon başlangıç verileri

## Amacı
`councils` ve `commissions` tabloları eklendikten sonra, sitenin mevcut menü yapısında zaten
var olan meclis ve komisyon başlıklarının veritabanında karşılığı olmazsa ilgili sayfalar boş
kalır. Bu migration, sitede halihazırda kullanılan slug'larla eşleşen başlangıç kayıtlarını
ekler; admin panelinden içerikler (hakkında metni, kapak görseli, üyeler) daha sonra
zenginleştirilebilir.

## Kapsam
- 4 meclis kaydı (Gençlik, Kadın, Öğrenci, Engelli)
- 8 komisyon kaydı (mevcut menüdeki tüm komisyonlar)
*/

INSERT INTO councils (slug, name, tagline, about, display_order, is_published) VALUES
  ('genclik', 'Gençlik Meclisi', 'Gençlerin sesi, kentin geleceği', 'Gençlerin kent yaşamına, karar süreçlerine ve sosyal hayata katılımını güçlendiriyoruz.', 1, true),
  ('kadin', 'Kadın Meclisi', 'Eşit söz, eşit katılım', 'Kadınların kent yönetiminde ve toplumsal yaşamda eşit söz sahibi olması için çalışıyoruz.', 2, true),
  ('ogrenci', 'Öğrenci Meclisi', 'Çocukların kent hakkı', 'Çocukların ve öğrencilerin kent hakkını görünür kılıyor, fikirlerini dinliyoruz.', 3, true),
  ('engelli', 'Engelli Meclisi', 'Herkes için eşit bir kent', 'Erişilebilir, kapsayıcı ve herkes için eşit bir kent hedefiyle çalışıyoruz.', 4, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO commissions (slug, name, tagline, about, display_order, is_published) VALUES
  ('genclik-spor', 'Gençlik ve Spor Komisyonu', 'Sağlıklı yaşam, birlikte hareket', 'Gençlik, spor, sağlıklı yaşam ve sosyal etkinlik odaklı çalışmalar yürütür.', 1, true),
  ('halkla-iliskiler', 'Halkla İlişkiler, Tanıtım ve İletişim Komisyonu', 'Kentin sesini duyuruyoruz', 'Basın, sosyal medya, iletişim, görünürlük ve tanıtım çalışmaları yürütür.', 2, true),
  ('afet-kentsel-donusum', 'Afet ve Farkındalık / Kentsel Dönüşüm Komisyonu', 'Güvenli ve dirençli bir kent', 'Afet bilinci, risk azaltma, kentsel dönüşüm ve farkındalık faaliyetleri yürütür.', 3, true),
  ('ekonomi', 'Ekonomi Komisyonu', 'Yerel ekonomiye güç katıyoruz', 'Yerel ekonomi, istihdam, girişimcilik ve ekonomik farkındalık çalışmaları yürütür.', 4, true),
  ('egitim', 'Eğitim Komisyonu', 'Bilgiyle büyüyen kent', 'Eğitim, seminer, okul iş birlikleri ve öğrenci odaklı faaliyetler yürütür.', 5, true),
  ('cevre-saglik', 'Çevre ve Sağlık Komisyonu', 'Sürdürülebilir bir gelecek', 'Çevre bilinci, sıfır atık, sağlık farkındalığı ve sürdürülebilirlik çalışmaları yürütür.', 6, true),
  ('sanat-kultur', 'Sanat ve Kültür Komisyonu', 'Kültürle zenginleşen kent', 'Kültürel ve sanatsal faaliyetler, sergiler düzenler.', 7, true),
  ('muhtarlar', 'Muhtarlar Komisyonu', 'Mahalleden kente', 'Mahallelerin ihtiyaçlarını takip eder, muhtarlarla koordinasyon sağlar.', 8, true)
ON CONFLICT (slug) DO NOTHING;
