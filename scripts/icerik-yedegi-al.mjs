#!/usr/bin/env node
/**
 * Site içeriğini JSON olarak dışa aktarır.
 *
 * Erişim için anon anahtarı kullanılır. Bu bilinçli bir tercih: anon
 * anahtarının gördüğü her şey zaten sitede herkese açık olduğundan, yedek
 * dosyasına kişisel veri sızması veritabanı tarafındaki RLS kurallarıyla
 * engellenmiş olur. Kod deposuna yanlışlıkla gizli veri işlenmesi mümkün
 * değil.
 *
 * Bunun bedeli: yayımlanmamış taslaklar yedeğe girmez. Taslakları da
 * kapsayan tam yedek için docs/yedekleme.md'deki elle alınan yedeğe bakın.
 *
 * Kullanım:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/icerik-yedegi-al.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ICERIK_TABLOLARI, YEDEK_DOSYASI } from './icerik-tablolari.mjs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlı olmalı.');
  process.exit(1);
}

const SAYFA_BOYUTU = 1000;

async function tabloyuCek(tablo) {
  const satirlar = [];
  for (let offset = 0; ; offset += SAYFA_BOYUTU) {
    // id'ye göre sıralama, yedek dosyasının her çalıştırmada aynı sırada
    // üretilmesini sağlar; aksi hâlde sırf sıra değiştiği için git'te
    // anlamsız değişiklikler görünür.
    const istek = `${url}/rest/v1/${tablo}?select=*&order=id.asc&limit=${SAYFA_BOYUTU}&offset=${offset}`;
    const yanit = await fetch(istek, { headers: { apikey: key, Authorization: `Bearer ${key}` } });

    if (!yanit.ok) {
      throw new Error(`${tablo} okunamadı (HTTP ${yanit.status}): ${await yanit.text()}`);
    }

    const sayfa = await yanit.json();
    satirlar.push(...sayfa);
    if (sayfa.length < SAYFA_BOYUTU) return satirlar;
  }
}

const icerik = {};
let toplam = 0;

for (const tablo of ICERIK_TABLOLARI) {
  const satirlar = await tabloyuCek(tablo);
  icerik[tablo] = satirlar;
  toplam += satirlar.length;
  console.log(`${tablo}: ${satirlar.length} satır`);
}

const yedek = {
  // Yedeğin ne zaman değil, neyi içerdiği önemli olduğu için tarih
  // ayrı bir alanda; böylece içerik değişmediğinde dosya da değişmiyor
  // ve gereksiz commit oluşmuyor.
  bicim: 1,
  aciklama: 'Küçükçekmece Kent Konseyi — yayımlanmış site içeriği yedeği. Kişisel veri içermez.',
  tablolar: icerik,
};

await mkdir(dirname(YEDEK_DOSYASI), { recursive: true });
await writeFile(YEDEK_DOSYASI, JSON.stringify(yedek, null, 2) + '\n', 'utf8');

console.log(`\nToplam ${toplam} satır → ${YEDEK_DOSYASI}`);
