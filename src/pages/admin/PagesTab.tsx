import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { adminFetchAllPageContent, adminUpsertPageContent } from '@/lib/data/pages';
import type { PageContent } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

/**
 * Her kaydın hangi alanları kullandığı burada tanımlı.
 *
 * Önceden bütün kayıtlar için aynı altı alan gösteriliyordu. Oysa her sayfa
 * bunların hepsini çizmiyor: örneğin ana sayfa bölümleri "Açıklama" alanını
 * hiç okumuyor, görsel yalnızca Kurumsal → Başkan Mesajı sayfasında
 * kullanılıyor. Sonuç olarak yöneticinin doldurduğu alan sessizce hiçbir
 * yerde görünmeyebiliyordu.
 *
 * Burada yalnızca ilgili sayfanın gerçekten çizdiği alanlar listeleniyor ve
 * her alanın etiketi metnin sitede nereye düştüğünü söylüyor.
 *
 * Yeni bir alan bir sayfada kullanılmaya başlanırsa buraya da eklenmeli;
 * aksi hâlde panelden doldurulamaz.
 */
type Alan = 'eyebrow' | 'title' | 'description' | 'heading' | 'body' | 'image_url';

type Tanim = {
  ad: string;
  nerede: string;
  alanlar: Alan[];
  etiket?: Partial<Record<Alan, string>>;
};

// Tam sayfalar: üstte koyu banner (eyebrow + title + description),
// altında bir içerik bölümü (heading + body).
const TAM_SAYFA = (ad: string, yol: string): Tanim => ({
  ad,
  nerede: `${yol} adresindeki sayfa.`,
  alanlar: ['eyebrow', 'title', 'description', 'heading', 'body'],
});

// Yalnızca üst banner'ı olan sayfalar.
const BANNER_SAYFA = (ad: string, yol: string): Tanim => ({
  ad,
  nerede: `${yol} adresindeki sayfa. İçerik listesi kendiliğinden geliyor, bu kayıt yalnızca üstteki banner'ı besliyor.`,
  alanlar: ['eyebrow', 'title', 'description'],
});

// Ana sayfa bölümleri: sayfa değil, ana sayfanın bir parçası.
const ANA_SAYFA_BOLUMU = (ad: string, nerede: string, alanlar: Alan[] = ['eyebrow', 'heading']): Tanim => ({
  ad,
  nerede,
  alanlar,
  etiket: {
    eyebrow: 'Üst Etiket (başlığın üstündeki küçük kırmızı yazı)',
    heading: 'Bölüm Başlığı (ana sayfada görünen büyük yazı)',
    body: 'Bölüm Metni (başlığın altındaki paragraf)',
  },
});

// KVKK alt metinleri: açılır kapanır bloklar hâlinde.
const ACILIR_METIN = (ad: string): Tanim => ({
  ad,
  nerede: 'Kurumsal → KVKK ve Gizlilik sayfasında açılır kapanır blok olarak görünür.',
  alanlar: ['heading', 'body'],
  etiket: { heading: 'Blok Başlığı (tıklanınca açılan satır)', body: 'Metin' },
});

const SAYFALAR: Record<string, Tanim> = {
  'ana-sayfa-hero': {
    ad: 'Ana Sayfa — Hero (Üst Banner)',
    nerede: 'Ana sayfanın en üstündeki büyük görsel alan. Slider’da hiç görsel yoksa buradaki metinler kullanılır.',
    alanlar: ['eyebrow', 'title', 'description', 'heading', 'body'],
    etiket: {
      eyebrow: 'Üst Etiket (büyük başlığın üstündeki yazı)',
      title: 'Büyük Başlık',
      description: 'Başlığın altındaki açıklama',
      heading: 'Sol Alt Rozet — Başlık',
      body: 'Sol Alt Rozet — Alt Yazı',
    },
  },
  'ana-sayfa-baskan-mesaji': ANA_SAYFA_BOLUMU(
    'Ana Sayfa — Başkan Mesajı Girişi',
    'Ana sayfadaki kısa başkan mesajı bölümü. Başkanın tam mesajı ve fotoğrafı bu kayıtta değil, listedeki “Kurumsal — Başkan Mesajı” kaydında.',
    ['eyebrow', 'heading', 'body'],
  ),
  'ana-sayfa-hizli-erisim': ANA_SAYFA_BOLUMU('Ana Sayfa — Hızlı Erişim Başlığı', 'Ana sayfadaki hızlı erişim kartlarının üstündeki başlık. Kartların kendisi sabittir.'),
  'ana-sayfa-haberler': ANA_SAYFA_BOLUMU('Ana Sayfa — Haberler Bölüm Başlığı', 'Ana sayfadaki haber kartlarının üstündeki başlık. Haberler Haberler sekmesinden gelir.'),
  'ana-sayfa-etkinlikler': ANA_SAYFA_BOLUMU('Ana Sayfa — Etkinlikler Bölüm Başlığı', 'Ana sayfadaki etkinlik listesinin üstündeki başlık. Etkinlikler Etkinlikler sekmesinden gelir.'),
  'ana-sayfa-galeri': ANA_SAYFA_BOLUMU('Ana Sayfa — Galeri Bölüm Başlığı', 'Ana sayfadaki galeri önizlemesinin üstündeki başlık. Fotoğraflar Galeri sekmesinden gelir.'),

  meclisler: TAM_SAYFA('Meclisler — Liste Sayfası', '/meclisler'),
  komisyonlar: TAM_SAYFA('Komisyonlar — Liste Sayfası', '/komisyonlar'),
  projeler: TAM_SAYFA('Projeler / Faaliyetler', '/projeler'),
  belgeler: TAM_SAYFA('Belgeler', '/belgeler'),
  haberler: BANNER_SAYFA('Haberler / Bülten', '/haberler'),
  takvim: TAM_SAYFA('Takvim', '/takvim'),
  galeri: TAM_SAYFA('Fotoğraf Galerisi', '/galeri'),
  videolar: TAM_SAYFA('Video Arşivi', '/videolar'),
  iletisim: TAM_SAYFA('Katılım / İletişim', '/iletisim'),

  'kurumsal-hakkimizda': TAM_SAYFA('Kurumsal — Hakkımızda', '/kurumsal/hakkimizda'),
  'kurumsal-kent-konseyi-hakkinda': TAM_SAYFA('Kurumsal — Kent Konseyi Hakkında', '/kurumsal/kent-konseyi-hakkinda'),
  'kurumsal-baskan-mesaji': {
    ad: 'Kurumsal — Başkan Mesajı',
    nerede: '/kurumsal/baskan-mesaji adresindeki sayfa. Başkanın tam mesajı ve fotoğrafı buraya girilir.',
    alanlar: ['eyebrow', 'title', 'description', 'heading', 'body', 'image_url'],
    etiket: {
      body: 'Başkanın Mesajı (birden fazla paragraf için boş satır bırakın)',
      image_url: 'Başkan Fotoğrafı',
    },
  },
  'kurumsal-genel-kurul': TAM_SAYFA('Kurumsal — Genel Kurul', '/kurumsal/genel-kurul'),
  'kurumsal-yurutme-kurulu': TAM_SAYFA('Kurumsal — Yürütme Kurulu', '/kurumsal/yurutme-kurulu'),
  'kurumsal-kurullar': TAM_SAYFA('Kurumsal — Kurullar', '/kurumsal/kurullar'),
  'kurumsal-tuzuk': TAM_SAYFA('Kurumsal — Tüzük', '/kurumsal/tuzuk'),
  'kurumsal-yonetmelikler': TAM_SAYFA('Kurumsal — Yönetmelikler', '/kurumsal/yonetmelikler'),
  'kurumsal-kullanim-kosullari': TAM_SAYFA('Kurumsal — Telif ve Kullanım Koşulları', '/kurumsal/kullanim-kosullari'),
  'kurumsal-kvkk': BANNER_SAYFA('Kurumsal — KVKK Sayfa Başlığı', '/kurumsal/kvkk'),
  'kurumsal-kvkk-metni': ACILIR_METIN('Kurumsal — KVKK — KVKK Metni'),
  'kurumsal-aydinlatma-metni': ACILIR_METIN('Kurumsal — KVKK — Aydınlatma Metni'),
  'kurumsal-cerez-politikasi': ACILIR_METIN('Kurumsal — KVKK — Çerez Politikası'),
  'kurumsal-acik-riza-metni': ACILIR_METIN('Kurumsal — KVKK — Açık Rıza Metni'),
};

// Tanımı olmayan bir kayıt için: hiçbir alanı gizlemektense hepsini göster.
const VARSAYILAN: Tanim = {
  ad: '',
  nerede: '',
  alanlar: ['eyebrow', 'title', 'description', 'heading', 'body', 'image_url'],
};

const GENEL_ETIKET: Record<Alan, string> = {
  eyebrow: 'Üst Etiket (başlığın üstündeki küçük kırmızı yazı)',
  title: 'Sayfa Başlığı (üstteki koyu banner’daki büyük başlık)',
  description: 'Banner Açıklaması (sayfa başlığının altındaki kısa metin)',
  heading: 'Bölüm Başlığı',
  body: 'Bölüm Metni (birden fazla paragraf için boş satır bırakın)',
  image_url: 'Görsel',
};

function tanim(slug: string): Tanim {
  return SAYFALAR[slug] ?? { ...VARSAYILAN, ad: slug };
}

function etiket(t: Tanim, alan: Alan): string {
  return t.etiket?.[alan] ?? GENEL_ETIKET[alan];
}

export function PagesTab() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageContent> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllPageContent().then((data) => { setPages(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing?.slug) return;
    setSaving(true);
    setError(null);
    try {
      await adminUpsertPageContent({
        id: editing.id,
        slug: editing.slug,
        eyebrow: editing.eyebrow ?? '',
        title: editing.title ?? '',
        description: editing.description ?? '',
        heading: editing.heading ?? '',
        body: editing.body ?? '',
        image_url: editing.image_url ?? '',
      });
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  const duzenlenen = editing ? tanim(editing.slug ?? '') : null;

  return (
    <>
      <div className="admin-content-header">
        <h2>Sayfa İçerikleri</h2>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '-14px 0 24px' }}>
        Sitedeki sabit metinleri buradan düzenlersiniz. Her kayıt sitede tek bir yeri besler;
        hangi yeri beslediği düzenleme ekranının başında yazıyor. Haber, etkinlik, proje gibi
        listeler buradan değil, kendi sekmelerinden yönetilir.
      </p>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 1fr 90px' }}>
            <span>Sayfa</span><span>Başlık</span><span></span>
          </div>
          {pages.map((page) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 1fr 90px' }} key={page.id}>
              <strong style={{ fontSize: 14 }}>{tanim(page.slug).ad}</strong>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{page.title || page.heading}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(page); }} aria-label="Düzenle"><Pencil size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && duzenlenen && (
        <AdminModal title={duzenlenen.ad} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error} wide>
          {duzenlenen.nerede && (
            <p className="admin-hint" style={{ margin: '0 0 20px' }}>{duzenlenen.nerede}</p>
          )}

          {duzenlenen.alanlar.includes('eyebrow') && (
            <div className="admin-field">
              <label>{etiket(duzenlenen, 'eyebrow')}</label>
              <input value={editing.eyebrow ?? ''} onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })} />
            </div>
          )}
          {duzenlenen.alanlar.includes('title') && (
            <div className="admin-field">
              <label>{etiket(duzenlenen, 'title')}</label>
              <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
          )}
          {duzenlenen.alanlar.includes('description') && (
            <div className="admin-field">
              <label>{etiket(duzenlenen, 'description')}</label>
              <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
          )}
          {duzenlenen.alanlar.includes('heading') && (
            <div className="admin-field">
              <label>{etiket(duzenlenen, 'heading')}</label>
              <input value={editing.heading ?? ''} onChange={(e) => setEditing({ ...editing, heading: e.target.value })} />
            </div>
          )}
          {duzenlenen.alanlar.includes('body') && (
            <div className="admin-field">
              <label>{etiket(duzenlenen, 'body')}</label>
              <textarea value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} style={{ minHeight: 160 }} />
            </div>
          )}
          {duzenlenen.alanlar.includes('image_url') && (
            <ImageField label={etiket(duzenlenen, 'image_url')} value={editing.image_url ?? ''} onChange={(url) => setEditing({ ...editing, image_url: url })} />
          )}
        </AdminModal>
      )}
    </>
  );
}
