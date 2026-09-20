import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllHeroSlides, adminUpsertHeroSlide, adminDeleteHeroSlide } from '@/lib/data/heroSlides';
import type { HeroSlide } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

export function HeroSlidesTab() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<HeroSlide> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllHeroSlides().then((data) => { setItems(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.image_url?.trim()) { setError('Slayt görseli zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertHeroSlide({
        id: editing.id,
        image_url: editing.image_url.trim(),
        eyebrow: editing.eyebrow?.trim() || null,
        title: editing.title?.trim() || null,
        description: editing.description?.trim() || null,
        button_label: editing.button_label?.trim() || null,
        button_href: editing.button_href?.trim() || null,
        display_order: editing.display_order ?? 0,
        is_published: editing.is_published ?? true,
      });
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    await adminDeleteHeroSlide(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Slider / Hero Alanı</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ display_order: items.length, is_published: true }); }}>
          <Plus size={16} /> Yeni Slayt
        </button>
      </div>
      <p className="admin-hint">
        Ana sayfadaki büyük görsel alanı, burada eklediğiniz slaytlar arasında otomatik olarak dönüşümlü
        gösterilir (tanıtım görselleri, güncel etkinlik duyuruları, öne çıkan faaliyetler vb.). Hiç slayt
        eklenmemişse ana sayfa varsayılan görseli gösterir.
      </p>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Henüz slayt eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '70px 1fr 100px 90px' }}>
            <span>Sıra</span><span>Başlık</span><span>Durum</span><span></span>
          </div>
          {items.map((item) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '70px 1fr 100px 90px' }} key={item.id}>
              <span style={{ fontSize: 13 }}>{item.display_order}</span>
              <strong style={{ fontSize: 14 }}>{item.title || '(Başlıksız)'}</strong>
              <span style={{ fontSize: 13 }}>{item.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Slaytı Düzenle' : 'Yeni Slayt'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <ImageField label="Arka Plan Görseli" value={editing.image_url ?? ''} onChange={(url) => setEditing({ ...editing, image_url: url })} />
          <div className="admin-field">
            <label>Üst Etiket (eyebrow)</label>
            <input value={editing.eyebrow ?? ''} onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })} placeholder="Örn. Güncel Etkinlik" />
          </div>
          <div className="admin-field">
            <label>Başlık</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Açıklama</label>
            <textarea rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Buton Metni (isteğe bağlı)</label>
              <input value={editing.button_label ?? ''} onChange={(e) => setEditing({ ...editing, button_label: e.target.value })} placeholder="Kent için sözüm var" />
            </div>
            <div className="admin-field">
              <label>Buton Bağlantısı (isteğe bağlı)</label>
              <input value={editing.button_href ?? ''} onChange={(e) => setEditing({ ...editing, button_href: e.target.value })} placeholder="/iletisim" />
            </div>
          </div>
          <div className="admin-field">
            <label>Gösterim Sırası</label>
            <input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
          </div>
          <div className="admin-checkbox-row">
            <input id="hero-slide-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="hero-slide-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
