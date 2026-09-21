import { useRef, useState } from 'react';
import { AArrowDown, AArrowUp, Bold, Eye, Feather, Heading, Italic, Link2, List, Pencil } from 'lucide-react';
import { RichText } from '@/lib/richText';

/**
 * Biçimlendirme araç çubuğu olan metin alanı.
 *
 * Düğmeler seçili metni işaretlerle sarıyor. Seçim yoksa örnek bir metin
 * ekleyip onu seçili bırakıyor; böylece kullanıcı düğmeye basıp hemen
 * yazmaya devam edebiliyor ve işaretleri ezberlemesi gerekmiyor.
 *
 * Altındaki önizleme, metnin sitede nasıl görüneceğini sayfayı yayına
 * almadan gösteriyor.
 */

type Arac =
  | { tur: 'sar'; ad: string; ipucu: string; isaret: string; ornek: string; Ikon: typeof Bold }
  | { tur: 'satirBasi'; ad: string; ipucu: string; onek: string; ornek: string; Ikon: typeof Bold };

const ARACLAR: Arac[] = [
  { tur: 'sar', ad: 'Kalın', ipucu: 'Kalın (Ctrl+B)', isaret: '**', ornek: 'kalın yazı', Ikon: Bold },
  { tur: 'sar', ad: 'İnce', ipucu: 'İnce yazı', isaret: '__', ornek: 'ince yazı', Ikon: Feather },
  { tur: 'sar', ad: 'İtalik', ipucu: 'İtalik (Ctrl+I)', isaret: '*', ornek: 'italik yazı', Ikon: Italic },
  { tur: 'sar', ad: 'Büyüt', ipucu: 'Yazıyı büyüt', isaret: '++', ornek: 'büyük yazı', Ikon: AArrowUp },
  { tur: 'sar', ad: 'Küçült', ipucu: 'Yazıyı küçült', isaret: '~~', ornek: 'küçük yazı', Ikon: AArrowDown },
  { tur: 'satirBasi', ad: 'Ara başlık', ipucu: 'Ara başlık', onek: '## ', ornek: 'Ara başlık', Ikon: Heading },
  { tur: 'satirBasi', ad: 'Madde', ipucu: 'Madde işaretli liste', onek: '- ', ornek: 'Madde', Ikon: List },
];

export function RichTextField({
  label,
  value,
  onChange,
  hint,
  minHeight = 200,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  minHeight?: number;
}) {
  const alanRef = useRef<HTMLTextAreaElement>(null);
  const [onizleme, setOnizleme] = useState(false);

  /** Metni değiştirip imleci verilen aralığa alır. */
  function uygula(yeniMetin: string, secimBas: number, secimSon: number) {
    onChange(yeniMetin);
    // Değer React tarafından yazıldıktan sonra seçim ayarlanmalı.
    requestAnimationFrame(() => {
      const alan = alanRef.current;
      if (!alan) return;
      alan.focus();
      alan.setSelectionRange(secimBas, secimSon);
    });
  }

  function sar(isaret: string, ornek: string) {
    const alan = alanRef.current;
    if (!alan) return;
    const { selectionStart: bas, selectionEnd: son } = alan;
    const secili = value.slice(bas, son);
    const icerik = secili || ornek;
    const yeni = value.slice(0, bas) + isaret + icerik + isaret + value.slice(son);
    // Seçim yoksa eklenen örnek metin seçili kalıyor ki üzerine yazılabilsin.
    uygula(yeni, bas + isaret.length, bas + isaret.length + icerik.length);
  }

  function satirBasiEkle(onek: string, ornek: string) {
    const alan = alanRef.current;
    if (!alan) return;
    const { selectionStart: bas, selectionEnd: son } = alan;

    // Seçim birden çok satıra yayılıyorsa her satır işaretlenir.
    const satirBasi = value.lastIndexOf('\n', bas - 1) + 1;
    const satirSonu = value.indexOf('\n', son) === -1 ? value.length : value.indexOf('\n', son);
    const blok = value.slice(satirBasi, satirSonu);

    if (!blok.trim()) {
      const yeni = value.slice(0, satirBasi) + onek + ornek + value.slice(satirSonu);
      uygula(yeni, satirBasi + onek.length, satirBasi + onek.length + ornek.length);
      return;
    }

    const isaretli = blok
      .split('\n')
      .map((satir) => (satir.startsWith(onek) ? satir : onek + satir))
      .join('\n');
    const yeni = value.slice(0, satirBasi) + isaretli + value.slice(satirSonu);
    uygula(yeni, satirBasi, satirBasi + isaretli.length);
  }

  function baglantiEkle() {
    const alan = alanRef.current;
    if (!alan) return;
    const { selectionStart: bas, selectionEnd: son } = alan;
    const secili = value.slice(bas, son) || 'bağlantı metni';
    const parca = `[${secili}](https://)`;
    const yeni = value.slice(0, bas) + parca + value.slice(son);
    // İmleç adresin sonuna bırakılıyor; kullanıcının yapacağı ilk iş
    // adresi yapıştırmak.
    const adresSonu = bas + parca.length - 1;
    uygula(yeni, adresSonu, adresSonu);
  }

  function kisayol(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const tus = e.key.toLowerCase();
    if (tus === 'b') { e.preventDefault(); sar('**', 'kalın yazı'); }
    if (tus === 'i') { e.preventDefault(); sar('*', 'italik yazı'); }
  }

  return (
    <div className="admin-field">
      <label>{label}</label>

      <div className="rt-toolbar">
        {ARACLAR.map((arac) => (
          <button
            type="button"
            key={arac.ad}
            title={arac.ipucu}
            aria-label={arac.ipucu}
            onClick={() =>
              arac.tur === 'sar'
                ? sar(arac.isaret, arac.ornek)
                : satirBasiEkle(arac.onek, arac.ornek)
            }
          >
            <arac.Ikon size={15} />
            <span>{arac.ad}</span>
          </button>
        ))}
        <button type="button" title="Bağlantı ekle" aria-label="Bağlantı ekle" onClick={baglantiEkle}>
          <Link2 size={15} /><span>Bağlantı</span>
        </button>
        <button
          type="button"
          className={onizleme ? 'active' : ''}
          title={onizleme ? 'Düzenlemeye dön' : 'Sitede nasıl görüneceğini göster'}
          onClick={() => setOnizleme(!onizleme)}
          style={{ marginLeft: 'auto' }}
        >
          {onizleme ? <><Pencil size={15} /><span>Düzenle</span></> : <><Eye size={15} /><span>Önizleme</span></>}
        </button>
      </div>

      {onizleme ? (
        <div className="rt-preview" style={{ minHeight }}>
          {value.trim()
            ? <RichText text={value} />
            : <p className="admin-hint" style={{ margin: 0 }}>Henüz metin girilmedi.</p>}
        </div>
      ) : (
        <textarea
          ref={alanRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={kisayol}
          style={{ minHeight, borderRadius: 0 }}
        />
      )}

      <p className="admin-hint" style={{ margin: '8px 0 20px' }}>
        {hint ? <>{hint}{' '}</> : null}
        Metni seçip düğmelere basarak biçimlendirebilirsiniz. Yeni paragraf için
        bir boş satır bırakın. <strong>Önizleme</strong> düğmesi sitede nasıl
        görüneceğini gösterir.
      </p>
    </div>
  );
}
