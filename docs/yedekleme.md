# Yedekleme

Supabase'in kendi otomatik yedekleri yalnızca ücretli planlarda var. Bu proje
ücretsiz planda olduğu için yedekleme iki ayrı yolla çözüldü.

| | Otomatik içerik yedeği | Elle alınan tam yedek |
|---|---|---|
| Ne zaman | Üç günde bir, kendiliğinden | Siz çalıştırdığınızda |
| Kapsam | Yayımlanmış tüm site içeriği | Veritabanının tamamı |
| Başvurular (kişisel veri) | Yok | Var |
| Taslaklar | Yok | Var |
| Depolanan yer | Kod deposu (`backups/`) | Kendi bilgisayarınız |

İkisi birbirinin yerine geçmiyor. Otomatik yedek gündelik güvenlik ağı;
tam yedek ise ayda bir alınması önerilen kapsamlı kopya.

---

## Otomatik içerik yedeği

**İçerik Yedeği** iş akışı üç günde bir çalışır, yayımlanmış içeriği
`backups/icerik-yedegi.json` dosyasına yazar ve içerik değiştiyse depoya
işler. Kurulum gerektirmez; deploy için zaten tanımlı olan
`VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` secret'larını kullanır.

Dışa aktarma sırasında **anon anahtarı** kullanılması bilinçli bir tercih:
anon anahtarının görebildiği her şey zaten sitede herkese açık olduğundan,
kod deposuna yanlışlıkla kişisel veri işlenmesi veritabanı tarafındaki RLS
kurallarıyla engellenmiş oluyor. Bedeli, yayımlanmamış taslakların yedeğe
girmemesi.

Üç günlük aralık ayrıca ikinci bir işe yarıyor: ücretsiz planda 7 gün
hareketsiz kalan projeler duraklatıldığı için düzenli istek projeyi uyanık
tutuyor.

Beklemeden çalıştırmak isterseniz: GitHub → **Actions** → **İçerik Yedeği**
→ **Run workflow**.

### Geri yükleme

```bash
export VITE_SUPABASE_URL='https://xyiqzbvularhtgxpzoil.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='...'   # Supabase paneli → Project Settings → API
node scripts/icerik-yedegini-yukle.mjs
```

Satırlar kendi id'leriyle upsert edilir: aynı id varsa güncellenir, yoksa
eklenir. **Hiçbir şey silinmez** — yedek alındıktan sonra eklenmiş içerikler
yerinde kalır. Bu, kazara tüm siteyi eski hâline döndürüp yeni içerikleri yok
etmemek için böyle.

Eski bir tarihteki hâle dönmek isterseniz önce o tarihteki commit'e ait
`icerik-yedegi.json` dosyasını alın:

```bash
git log --oneline -- backups/icerik-yedegi.json      # commit'leri listeler
git checkout <commit> -- backups/icerik-yedegi.json  # o hâli geri getirir
node scripts/icerik-yedegini-yukle.mjs
```

> `SUPABASE_SERVICE_ROLE_KEY` veritabanındaki **her şeye** erişir ve RLS
> kurallarını hiçe sayar. Yalnızca kendi bilgisayarınızda kullanın; depoya
> işlemeyin, GitHub secret'ı olarak da eklemeyin.

---

## Elle alınan tam yedek

Başvuruları ve taslakları da kapsayan kopya. Ayda bir almanız yeterli.

### 1. Bağlantı bilgisini alın

Supabase paneli → **Connect** → **Session pooler** sekmesindeki bağlantı
adresi. `[YOUR-PASSWORD]` kısmını veritabanı parolanızla değiştirin.

### 2. Yedeği alın

`pg_dump` gerekir (macOS'ta `brew install libpq`, Windows'ta PostgreSQL
kurulumuyla gelir):

```bash
pg_dump 'postgresql://postgres.xyiqzbvularhtgxpzoil:PAROLA@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' \
  --schema=public --no-owner --no-privileges \
  | gzip > "tam-yedek-$(date +%Y-%m-%d).sql.gz"
```

Dosya adı kalıbı `.gitignore` içinde; yanlışlıkla depoya işlenmez.

### 3. Güvenli bir yere koyun

Bu dosya **kişisel veri içerir** (başvuru sahiplerinin adı, e-postası,
mesajı). KVKK açısından:

- Herkese açık kod deposuna, GitHub Actions çıktılarına veya paylaşılan bir
  sürücüye **koymayın**.
- Şifreli bir diskte ya da parola korumalı bir arşivde saklayın.
- Süresiz saklamayın; eski yedekleri belirli aralıklarla silin.

### Geri yükleme

```bash
gunzip -c tam-yedek-2026-09-21.sql.gz \
  | psql 'postgresql://postgres.xyiqzbvularhtgxpzoil:PAROLA@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
```

Tam yedekten dönmek şemayı ve tüm verileri o günkü hâline getirir. Araya
giren migration'lar varsa geri yüklemeden sonra tekrar uygulanmalıdır.

---

## Projenin duraklatılması

Ücretsiz planda 7 gün boyunca hiç istek almayan projeler duraklatılır ve
site veri çekemez hâle gelir. Üç günde bir çalışan yedekleme iş akışı bunu
kendiliğinden önlüyor. Yine de duraklatma olursa Supabase panelinden
**Restore project** ile geri açılır; veri kaybı olmaz.
