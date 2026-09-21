# Metin Biçimlendirme

Panelde uzun metin alanlarının üstünde bir araç çubuğu var: **Sayfa
İçerikleri**, **Haberler → Haber Metni**, **Projeler → Proje Detayı** ve
**Projeler → Sonuç Değerlendirmesi**.

## Kullanımı

Metni seçin, düğmeye basın. Hiçbir şey seçmeden basarsanız örnek bir metin
eklenir ve seçili kalır; üzerine yazmanız yeterli.

**Önizleme** düğmesi metnin sitede nasıl görüneceğini, sayfayı yayına
almadan gösterir.

| Düğme | Sonuç | Kısayol |
|---|---|---|
| Kalın | **kalın yazı** | Ctrl+B |
| İnce | daha ince yazı | |
| İtalik | *eğik yazı* | Ctrl+I |
| Büyüt | biraz büyük yazı | |
| Küçült | biraz küçük yazı | |
| Ara başlık | paragrafların arasına başlık | |
| Madde | madde işaretli liste | |
| Bağlantı | tıklanabilir bağlantı | |

**Yeni paragraf** için bir boş satır bırakın. Boş satır bırakmadan Enter'a
basarsanız aynı paragraf içinde alt satıra geçilir — imza blokları için
kullanışlıdır:

```
Saygılarımla,
Prof. Dr. Mustafa Aydın
Küçükçekmece Kent Konseyi Başkanı
```

## Boyutlar neden serbest değil

Büyüt/Küçült mutlak punto vermez; metnin bulunduğu yerin ölçüsüne göre
oransal büyütüp küçültür. Her metne ayrı punto verilebilseydi sayfalar
zamanla birbirinden kopar, sitenin tipografisi dağılırdı. Bu şekilde
vurguyu siz belirlersiniz, ölçek tutarlı kalır.

## "İnce" her yerde görünür mü

İnce yazı, ziyaretçinin cihazındaki yazı tipinin ince bir kesimi varsa
görünür. Windows (Segoe UI Light) ve macOS'ta genellikle çalışır; bu
kesimin bulunmadığı sistemlerde yazı normal kalınlıkta görünür, bozulma
olmaz.

Her cihazda garanti etmek isterseniz siteye Inter yazı tipinin kendi
dosyalarını eklemek gerekir. Şu an eklenmedi: Google Fonts üzerinden
yüklemek ziyaretçilerin IP adresini üçüncü bir tarafa göndereceği için
KVKK açısından ayrıca değerlendirilmesi gereken bir konu.

## Teknik not

Biçimlendirme, metnin içine işaretler (`**kalın**`, `## Başlık`, `- madde`)
yazarak saklanır. Düğmeler bu işaretleri sizin yerinize koyar; isterseniz
elle de yazabilirsiniz.

Sitede çizilirken bu işaretler doğrudan React elemanlarına çevrilir; hiçbir
noktada sayfaya ham HTML yazılmaz. Bu bilinçli bir tercih: HTML üreten
düzenleyicilerde temizleme kodundaki tek bir açık, girilen metnin
ziyaretçinin tarayıcısında kod çalıştırmasına dönüşebilir. Bu yöntemde öyle
bir açık yapısal olarak mümkün değil.

Daha önce girilmiş işaretsiz düz metinler eskisi gibi çalışmaya devam eder.
