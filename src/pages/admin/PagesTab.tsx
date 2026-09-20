import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { adminFetchAllPageContent, adminUpsertPageContent } from '@/lib/data/pages';
import type { PageContent } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

const LABELS: Record<string, string> = {
  'ana-sayfa-hero': 'Ana Sayfa — Hero (Üst Banner)',
  'ana-sayfa-baskan-mesaji': 'Ana Sayfa — Başkan Mesajı Girişi',
  'ana-sayfa-hizli-erisim': 'Ana Sayfa — Hızlı Erişim Başlığı',
  'ana-sayfa-haberler': 'Ana Sayfa — Haberler Bölüm Başlığı',
  'ana-sayfa-etkinlikler': 'Ana Sayfa — Etkinlikler Bölüm Başlığı',
  'ana-sayfa-galeri': 'Ana Sayfa — Galeri Bölüm Başlığı',
  meclisler: 'Meclisler — Liste Sayfası',
  komisyonlar: 'Komisyonlar — Liste Sayfası',
  projeler: 'Projeler / Faaliyetler',
  belgeler: 'Belgeler',
  haberler: 'Haberler / Bülten',
  takvim: 'Takvim',
  galeri: 'Fotoğraf Galerisi',
  videolar: 'Video Arşivi',
  iletisim: 'Katılım / İletişim',
  'kurumsal-hakkimizda': 'Kurumsal — Hakkımızda',
  'kurumsal-kent-konseyi-hakkinda': 'Kurumsal — Kent Konseyi Hakkında',
  'kurumsal-baskan-mesaji': 'Kurumsal — Başkan Mesajı',
  'kurumsal-genel-kurul': 'Kurumsal — Genel Kurul',
  'kurumsal-yurutme-kurulu': 'Kurumsal — Yürütme Kurulu',
  'kurumsal-kurullar': 'Kurumsal — Kurullar',
  'kurumsal-tuzuk': 'Kurumsal — Tüzük',
  'kurumsal-yonetmelikler': 'Kurumsal — Yönetmelikler',
  'kurumsal-kvkk': 'Kurumsal — KVKK Sayfa Başlığı',
  'kurumsal-kvkk-metni': 'Kurumsal — KVKK — KVKK Metni',
  'kurumsal-aydinlatma-metni': 'Kurumsal — KVKK — Aydınlatma Metni',
  'kurumsal-cerez-politikasi': 'Kurumsal — KVKK — Çerez Politikası',
  'kurumsal-acik-riza-metni': 'Kurumsal — KVKK — Açık Rıza Metni',
};

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

  return (
    <>
      <div className="admin-content-header">
        <h2>Sayfa İçerikleri</h2>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '-14px 0 24px' }}>
        Sitedeki her sayfanın başlık, alt başlık ve açıklama metinlerini buradan düzenleyebilirsiniz.
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
              <strong style={{ fontSize: 14 }}>{LABELS[page.slug] ?? page.slug}</strong>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{page.title}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(page); }} aria-label="Düzenle"><Pencil size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={LABELS[editing.slug ?? ''] ?? editing.slug ?? ''} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error} wide>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Üst Etiket (Eyebrow)</label>
              <input value={editing.eyebrow ?? ''} onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Başlık</label>
              <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
          </div>
          <div className="admin-field">
            <label>Açıklama (sayfa başlığı altındaki kısa metin)</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>İçerik Başlığı (isteğe bağlı)</label>
            <input value={editing.heading ?? ''} onChange={(e) => setEditing({ ...editing, heading: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>İçerik Metni (isteğe bağlı — birden fazla paragraf için boş satır bırakın)</label>
            <textarea value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} style={{ minHeight: 160 }} />
          </div>
          <ImageField label="Görsel (isteğe bağlı — örn. Başkan fotoğrafı)" value={editing.image_url ?? ''} onChange={(url) => setEditing({ ...editing, image_url: url })} />
        </AdminModal>
      )}
    </>
  );
}
