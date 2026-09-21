#!/usr/bin/env node
/**
 * backups/icerik-yedegi.json dosyasını veritabanına geri yükler.
 *
 * Satırlar kendi id'leriyle upsert edilir: aynı id varsa güncellenir, yoksa
 * eklenir. Dolayısıyla hiçbir şey silinmez — yedekten sonra eklenmiş
 * içerikler yerinde kalır. Bu bilinçli bir tercih; kazara tüm siteyi
 * yedekteki hâline döndürüp yeni içerikleri yok etmemek için.
 *
 * Yazma yetkisi gerektiğinden anon değil service_role anahtarı kullanılır.
 * Bu anahtar veritabanındaki her şeye erişir; yalnızca kendi bilgisayarınızda
 * kullanın, hiçbir yere işlemeyin ve paylaşmayın.
 *
 * Kullanım:
 *   VITE_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/icerik-yedegini-yukle.mjs
 */
import { readFile } from 'node:fs/promises';
import { ICERIK_TABLOLARI, YEDEK_DOSYASI } from './icerik-tablolari.mjs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.');
  console.error('service_role anahtarı: Supabase paneli → Project Settings → API');
  process.exit(1);
}

const yedek = JSON.parse(await readFile(YEDEK_DOSYASI, 'utf8'));

if (yedek.bicim !== 1) {
  console.error(`Bu betik ${yedek.bicim} numaralı yedek biçimini tanımıyor.`);
  process.exit(1);
}

// Tek istekte çok satır göndermek zaman aşımına yol açabildiği için parçalanıyor.
const PARCA = 500;

for (const tablo of ICERIK_TABLOLARI) {
  const satirlar = yedek.tablolar[tablo] ?? [];
  if (satirlar.length === 0) {
    console.log(`${tablo}: atlandı (yedekte satır yok)`);
    continue;
  }

  for (let i = 0; i < satirlar.length; i += PARCA) {
    const parca = satirlar.slice(i, i + PARCA);
    const yanit = await fetch(`${url}/rest/v1/${tablo}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(parca),
    });

    if (!yanit.ok) {
      console.error(`\n${tablo} yazılamadı (HTTP ${yanit.status}): ${await yanit.text()}`);
      console.error('Yükleme durduruldu. Önceki tablolar yazılmış olabilir.');
      process.exit(1);
    }
  }

  console.log(`${tablo}: ${satirlar.length} satır yüklendi`);
}

console.log('\nGeri yükleme tamamlandı.');
