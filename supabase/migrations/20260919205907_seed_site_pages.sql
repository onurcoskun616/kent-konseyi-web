/*
# Sayfa İçerikleri başlangıç verileri

Sitenin mevcut sabit metinlerini `site_pages` tablosuna taşır, böylece admin panelinden
düzenlemeye başlanana kadar sayfalar aynı görünmeye devam eder.
*/

INSERT INTO site_pages (slug, eyebrow, title, description, heading, body) VALUES
  ('meclisler', 'Meclisler', 'Meclislerimiz', 'Küçükçekmece’nin farklı seslerinin bir araya geldiği katılım kanalları.', 'Kentin farklı sesleri bir arada.', null),
  ('komisyonlar', 'Komisyonlar', 'Komisyonlar', 'Kent Konseyi’nin çalışma alanlarına göre oluşturduğu uzmanlık ve üretim grupları.', 'Kent için çalışan ekipler.', 'Komisyonlarımız, kent gündemindeki konulara odaklanır; araştırır, öneri geliştirir ve uygulanabilir çözümler üretir.'),
  ('projeler', 'Üretim alanlarımız', 'Projeler / Faaliyetler', 'Kentimiz için geliştirdiğimiz projeler, faaliyetler ve ortak çalışmalar.', 'Fikirden faaliyete.', 'Kent Konseyi’nin meclis ve komisyonlarıyla birlikte yürüttüğü çalışmaları inceleyin.'),
  ('belgeler', 'Arşiv', 'Belgeler', 'Tüzük, yönetmelik, rapor, karar ve çalışma belgeleri.', 'Açık ve erişilebilir bilgi.', 'Kent Konseyi çalışmalarına ilişkin güncel belgeleri aşağıdan inceleyebilir veya indirebilirsiniz.'),
  ('haberler', 'Gündem', 'Haberler / Bülten', 'Kent Konseyi’nden duyurular, haberler, bültenler ve aylık gelişmeler.', null, null),
  ('takvim', 'Takvim', 'Etkinlik Takvimi', 'Toplantılar, çalıştaylar, meclis buluşmaları ve kent etkinlikleri.', 'Takviminize ekleyin.', 'Kent Konseyi’nin yaklaşan tüm etkinliklerini burada bulabilirsiniz.'),
  ('galeri', 'Arşiv', 'Fotoğraf Galerisi', 'Birlikte ürettiğimiz anlardan kareler.', 'Birlikte ürettiğimiz anlar.', null),
  ('videolar', 'Arşiv', 'Video Arşivi', 'Kent Konseyi çalışmalarından video kayıtları.', 'Çalışmalarımızdan görüntüler.', null),
  ('iletisim', 'Söz sende', 'Katılım / İletişim', 'Fikrinizi, önerinizi, gönüllülük başvurunuzu ve sorularınızı bize iletin.', 'Kent için sözünüzü paylaşın.', 'Sizi dinlemek, birlikte üretmek ve Küçükçekmece’nin geleceğine katkı sunmak için buradayız.'),
  ('kurumsal-hakkimizda', 'Kurumsal', 'Hakkımızda', 'Küçükçekmece Kent Konseyi’nin kuruluşunu, değerlerini ve çalışma anlayışını keşfedin.', 'Ortak aklın buluşma noktası.', 'Kent Konseyi; kent yaşamında yurttaşların, kurumların ve sivil toplumun ortak akıl etrafında buluştuğu demokratik bir platformdur.

Küçükçekmece’nin ihtiyaçlarını birlikte tespit ediyor, çözüm önerilerini katılımcı yöntemlerle geliştiriyor ve kentimizin geleceğine birlikte yön veriyoruz.'),
  ('kurumsal-kent-konseyi-hakkinda', 'Kurumsal', 'Küçükçekmece Kent Konseyi Hakkında', 'Kent Konseyi’nin amacı, görevleri ve çalışma ilkeleri.', 'Kentin her sesine açık bir yapı.', 'Kent Konseyleri, hemşehrilik bilincinin geliştirilmesi, kentin hak ve hukukunun korunması, sürdürülebilir kalkınma ve katılımcı yönetim anlayışının güçlendirilmesi için çalışır.

Bütün çalışmalarımızda kapsayıcılık, şeffaflık, gönüllülük ve ortak üretim ilkelerini esas alıyoruz.'),
  ('kurumsal-baskan-mesaji', 'Kurumsal', 'Başkan Mesajı', 'Kent Konseyi Başkanımızın Küçükçekmece’ye mesajı.', 'Birlikte daha güçlü bir Küçükçekmece.', 'Küçükçekmece’nin geleceğini, bu kente gönül veren herkesin katkısıyla birlikte kuracağımıza inanıyorum.

Kent Konseyi olarak gençlerden kadınlara, çocuklardan engelli yurttaşlarımıza kadar her sesin duyulduğu, her fikrin değer bulduğu bir katılım alanı oluşturmayı sürdüreceğiz.'),
  ('kurumsal-genel-kurul', 'Kurumsal', 'Genel Kurul', 'Genel Kurul yapısı, toplantıları ve kararları.', 'Kararların ortak zemini.', 'Genel Kurul, Kent Konseyi’nin en geniş katılımlı karar alma organıdır. Meclislerden, komisyonlardan ve kent paydaşlarından gelen öneriler burada değerlendirilir.

Toplantı gündemlerini, kararları ve çalışma raporlarını şeffaf biçimde paylaşırız.'),
  ('kurumsal-yurutme-kurulu', 'Kurumsal', 'Yürütme Kurulu', 'Yürütme Kurulu üyeleri ve görevleri.', 'Çalışmaları hayata geçiren ekip.', 'Yürütme Kurulu, Genel Kurul kararlarının uygulanmasını takip eder ve Kent Konseyi’nin çalışma programını koordine eder.

Kurul üyeleri, farklı meclis ve komisyonların ortak çalışmalarını bir araya getirir.'),
  ('kurumsal-kurullar', 'Kurumsal', 'Kurullar', 'Kent Konseyi bünyesinde görev yapan kurullar.', 'Şeffaf ve düzenli çalışma.', 'Kent Konseyi çalışmalarının düzenli yürütülmesi için farklı görev alanlarına sahip kurullar birlikte çalışır.

Kurullarımızın görev, yetki ve sorumluluklarını ilgili yönetmeliklere uygun şekilde sürdürüyoruz.'),
  ('kurumsal-tuzuk', 'Kurumsal', 'Tüzük', 'Küçükçekmece Kent Konseyi tüzüğü.', 'Çalışma ilkelerimizin çerçevesi.', 'Kent Konseyi’nin kuruluşunu, organlarını, görevlerini ve işleyişini belirleyen tüzük metnine buradan ulaşabilirsiniz.'),
  ('kurumsal-yonetmelikler', 'Kurumsal', 'Yönetmelikler', 'Kent Konseyi yönetmelikleri ve uygulama metinleri.', 'Ortak çalışmanın kuralları.', 'Meclislerimizin ve komisyonlarımızın çalışma esaslarını açıklayan yönetmelikler, katılımcı sürecin düzenli işlemesini sağlar.'),
  ('kurumsal-kvkk', 'Kurumsal', 'KVKK ve Gizlilik', 'Kişisel verilerin korunması ve gizlilik politikamız.', 'Verileriniz bizim için emanet.', 'Kişisel verilerinizi yalnızca iletişim ve başvuru süreçlerini yürütebilmek için, yürürlükteki mevzuata uygun olarak işleriz.

Aydınlatma metni, başvuru formu ve veri güvenliği politikamıza bu sayfadan ulaşabilirsiniz.')
ON CONFLICT (slug) DO NOTHING;
