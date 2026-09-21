# Küçükçekmece Kent Konseyi

Kent Konseyi web sitesi. Vite + React + TypeScript, veri katmanı Supabase,
yayın GitHub Pages üzerinden.

Canlı site: <https://onurcoskun616.github.io/kent-konseyi-web/>

## Geliştirme

```bash
npm install
npm run dev
```

`.env` dosyasında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` tanımlı
olmalıdır.

```bash
npm run build      # üretim derlemesi
npm run lint       # eslint
npx tsc --noEmit   # tip denetimi
```

## Yayın

`main` dalına yapılan her push, **Deploy to GitHub Pages** iş akışını
tetikler. GitHub → Settings → Pages bölümünde **Source** ayarı
"GitHub Actions" olmalıdır; "Deploy from a branch" seçiliyken site beyaz
ekran verir.

## Belgeler

- [Panel kullanıcıları](docs/kullanicilar.md) — roller, kullanıcı ekleme ve
  yetkilendirmenin nerede denetlendiği
- [Yedekleme](docs/yedekleme.md) — otomatik içerik yedeği, elle alınan tam
  yedek ve geri yükleme adımları
- [E-posta bildirimi](docs/eposta-bildirimi.md) — iletişim formu
  başvurularında yöneticiye bildirim gönderme kurulumu

## Veritabanı

Şema değişiklikleri `supabase/migrations/` altında tarih sıralı SQL
dosyaları olarak tutulur. Her dosyanın başında değişikliğin neden
yapıldığını anlatan bir açıklama bloğu vardır.
