/*
# Projelerde Çoklu Görsel ve Sonuç Raporu

## Amacı
İçerik planının 7. maddesi projelerin birden fazla görselle anlatılmasını ve
proje bittiğinde ayrı bir sonuç raporu yayımlanabilmesini istiyor. Şu anda
bir projenin tek bir kapak görseli var ve bittiğinde anlatılacak yer yok.

## Görseller
Projeye ayrı bir görsel tablosu açmak yerine mevcut gallery_items tablosuna
project_id eklendi. Meclis ve komisyon galerileri zaten aynı tabloyla
çalışıyor; üçüncü bir sahip türü için ayrı tablo açmak, galeri yönetim
ekranını ve veri katmanını gereksiz yere ikiye bölerdi. Böylece proje
görselleri hem proje sayfasında hem de genel galeride görünür.

ON DELETE SET NULL: proje silinirse fotoğraflar galeriden kaybolmasın,
yalnızca proje bağı kopsun.

## Sonuç raporu
İki ayrı alan var çünkü ikisi farklı işe yarıyor ve biri olmadan diğeri
kullanılabilmeli:
- result_report: sitede okunan özet metin.
- result_report_url: indirilebilir ayrıntılı rapor (PDF).

Rapor alanları body'den ayrı tutuldu; proje tanıtımı ile bittikten sonraki
sonuç değerlendirmesi farklı zamanlarda yazılan, farklı şeyler.
*/

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS gallery_items_project_id_idx
  ON gallery_items (project_id) WHERE project_id IS NOT NULL;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS result_report text,
  ADD COLUMN IF NOT EXISTS result_report_url text;

COMMENT ON COLUMN projects.result_report IS
  'Proje tamamlandığında yayımlanan sonuç değerlendirmesi. Sitede okunur.';
COMMENT ON COLUMN projects.result_report_url IS
  'Ayrıntılı sonuç raporunun indirilebilir dosyası (PDF).';
