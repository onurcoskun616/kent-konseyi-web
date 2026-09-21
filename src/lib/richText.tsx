import { Fragment, type ReactNode } from 'react';

/**
 * Panelden girilen metinlerin basit biçimlendirmesi.
 *
 * ## Neden HTML değil
 * Zengin metin düzenleyicilerin çoğu HTML üretir ve o HTML sayfaya
 * dangerouslySetInnerHTML ile basılır. Bu, temizleme (sanitize) kodundaki
 * tek bir açığın ziyaretçinin tarayıcısında kod çalıştırmasına dönüşmesi
 * demek. İçeriği yalnızca yetkili kişiler giriyor olsa da editör hesabı
 * artık daha düşük yetkili bir rol; oradan gelen bir metnin siteyi ele
 * geçirebilmesi kabul edilebilir değil.
 *
 * Bu yüzden metin işaretlerle saklanıyor ve doğrudan React elemanlarına
 * çevriliyor. Sayfaya hiçbir noktada ham HTML yazılmıyor, dolayısıyla
 * XSS yapısal olarak mümkün değil.
 *
 * ## İşaretler
 *   **kalın**      __ince__      *italik*
 *   ++büyük++      ~~küçük~~
 *   ## Ara başlık  (satır başında)
 *   - Madde        (satır başında)
 *   [bağlantı metni](https://adres)
 *
 * Boş satır yeni paragraf açar, tek satır sonu satır sonu olur.
 * İşaret kullanılmamış düz metin eskisi gibi çalışır; bu biçim geriye
 * dönük uyumlu.
 */

/** Sıra önemli: uzun işaretler kısa olanlardan önce denenmeli (** ile * gibi). */
const SARMALAYICILAR: { isaret: string; sar: (icerik: ReactNode, key: number) => ReactNode }[] = [
  { isaret: '**', sar: (i, k) => <strong key={k}>{i}</strong> },
  { isaret: '__', sar: (i, k) => <span className="rt-light" key={k}>{i}</span> },
  { isaret: '++', sar: (i, k) => <span className="rt-lg" key={k}>{i}</span> },
  { isaret: '~~', sar: (i, k) => <span className="rt-sm" key={k}>{i}</span> },
  { isaret: '*',  sar: (i, k) => <em key={k}>{i}</em> },
];

function kacir(isaret: string) {
  return isaret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Tek bir düzenli ifadede hem sarmalayıcılar hem bağlantılar aranıyor;
// böylece metin tek geçişte, soldan sağa çözümleniyor.
const INLINE = new RegExp(
  SARMALAYICILAR.map(({ isaret }) => {
    const e = kacir(isaret);
    return `${e}(?=\\S)([\\s\\S]*?\\S)${e}`;
  }).join('|') + '|\\[([^\\]\\n]+)\\]\\((https?://[^\\s)]+)\\)',
  'g',
);

/** Satır içi işaretleri çözer. Sarmalayıcılar iç içe kullanılabilir. */
function satirIci(metin: string, anahtar = 0): ReactNode[] {
  const parcalar: ReactNode[] = [];
  let son = 0;
  let k = anahtar;

  for (const eslesme of metin.matchAll(INLINE)) {
    const konum = eslesme.index ?? 0;
    if (konum > son) parcalar.push(metin.slice(son, konum));

    // Gruplar sırayla: her sarmalayıcı için bir içerik grubu, sonra
    // bağlantı için metin ve adres grupları.
    const sarmalayiciSayisi = SARMALAYICILAR.length;
    let islendi = false;
    for (let i = 0; i < sarmalayiciSayisi; i++) {
      const icerik = eslesme[i + 1];
      if (icerik !== undefined) {
        parcalar.push(SARMALAYICILAR[i].sar(satirIci(icerik, k + 1), k++));
        islendi = true;
        break;
      }
    }
    if (!islendi) {
      const baglantiMetni = eslesme[sarmalayiciSayisi + 1];
      const adres = eslesme[sarmalayiciSayisi + 2];
      parcalar.push(
        <a className="rt-link" href={adres} target="_blank" rel="noreferrer" key={k++}>
          {baglantiMetni}
        </a>,
      );
    }
    son = konum + eslesme[0].length;
  }

  if (son < metin.length) parcalar.push(metin.slice(son));
  return parcalar;
}

/** Tek satır sonlarını <br> olarak çizer. */
function satirlar(metin: string): ReactNode {
  const hepsi = metin.split('\n');
  return hepsi.map((satir, i) => (
    <Fragment key={i}>
      {satirIci(satir)}
      {i < hepsi.length - 1 && <br />}
    </Fragment>
  ));
}

type Blok =
  | { tur: 'paragraf'; metin: string }
  | { tur: 'baslik'; metin: string }
  | { tur: 'liste'; maddeler: string[] };

/** Metni paragraf, ara başlık ve liste bloklarına ayırır. */
export function bloklaraAyir(metin: string | null | undefined): Blok[] {
  const bloklar: Blok[] = [];

  for (const ham of (metin ?? '').split(/\n\s*\n/)) {
    const parca = ham.trim();
    if (!parca) continue;

    const satirDizisi = parca.split('\n').map((s) => s.trim());

    // Blok, madde satırları ve düz satır öbeklerine ayrılıyor. Böylece
    // araya boş satır koymayı unutan biri ("Şunları yapıyoruz:" hemen
    // ardından maddeler) listesini düz metin olarak görmüyor.
    let birikenSatirlar: string[] = [];
    let birikenMaddeler: string[] = [];

    const duzBirikimiBosalt = () => {
      if (birikenSatirlar.length === 0) return;
      const tek = birikenSatirlar.length === 1 ? birikenSatirlar[0] : null;
      if (tek && tek.startsWith('## ')) {
        bloklar.push({ tur: 'baslik', metin: tek.slice(3).trim() });
      } else {
        bloklar.push({ tur: 'paragraf', metin: birikenSatirlar.join('\n') });
      }
      birikenSatirlar = [];
    };
    const listeBirikiminiBosalt = () => {
      if (birikenMaddeler.length === 0) return;
      bloklar.push({ tur: 'liste', maddeler: birikenMaddeler });
      birikenMaddeler = [];
    };

    for (const satir of satirDizisi) {
      if (satir.startsWith('- ')) {
        duzBirikimiBosalt();
        birikenMaddeler.push(satir.slice(2).trim());
      } else if (satir.startsWith('## ')) {
        duzBirikimiBosalt();
        listeBirikiminiBosalt();
        bloklar.push({ tur: 'baslik', metin: satir.slice(3).trim() });
      } else {
        listeBirikiminiBosalt();
        birikenSatirlar.push(satir);
      }
    }
    duzBirikimiBosalt();
    listeBirikiminiBosalt();
  }

  return bloklar;
}

/** Metinde gösterilecek bir şey var mı? */
export function metinVar(metin: string | null | undefined): boolean {
  return bloklaraAyir(metin).length > 0;
}

export function RichText({
  text,
  className = 'body-copy',
}: {
  text: string | null | undefined;
  className?: string;
}) {
  return (
    <>
      {bloklaraAyir(text).map((blok, i) => {
        if (blok.tur === 'baslik') {
          return <h3 className="rt-heading" key={i}>{satirIci(blok.metin)}</h3>;
        }
        if (blok.tur === 'liste') {
          return (
            <ul className={`rt-list ${className}`} key={i}>
              {blok.maddeler.map((madde, j) => <li key={j}>{satirIci(madde)}</li>)}
            </ul>
          );
        }
        return <p className={className} key={i}>{satirlar(blok.metin)}</p>;
      })}
    </>
  );
}
