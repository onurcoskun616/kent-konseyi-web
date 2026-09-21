import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllGalleryItems, adminUpsertGalleryItem, adminDeleteGalleryItem } from '@/lib/data/gallery';
import { adminFetchAllProjects } from '@/lib/data/projects';
import { GALLERY_CATEGORIES, type Commission, type Council, type GalleryItem, type Project } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

export function GalleryTab({ councils, commissions }: { councils: Council[]; commissions: Commission[] }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllGalleryItems().then((data) => { setItems(data); setLoading(false); }); };
  useEffect(refresh, []);
  useEffect(() => { adminFetchAllProjects().then(setProjects); }, []);

  async function save() {
    if (!editing) return;
    if (!editing.media_url?.trim()) { setError('Görsel/video dosyası zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertGalleryItem({
        id: editing.id,
        title: editing.title?.trim() || null,
        media_type: editing.media_type || 'photo',
        media_url: editing.media_url.trim(),
        thumbnail_url: editing.thumbnail_url?.trim() || null,
        category: editing.category || 'Genel',
        council_id: editing.council_id || null,
        commission_id: editing.commission_id || null,
        project_id: editing.project_id || null,
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
    if (!confirm('Bu galeri öğesini silmek istediğinize emin misiniz?')) return;
    await adminDeleteGalleryItem(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Galeri</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ media_type: 'photo', category: 'Genel', is_published: true }); }}>
          <Plus size={16} /> Yeni Öğe
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Henüz galeri öğesi eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 100px 130px 90px' }}>
            <span>Başlık</span><span>Tür</span><span>Kategori</span><span></span>
          </div>
          {items.map((item) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 100px 130px 90px' }} key={item.id}>
              <strong style={{ fontSize: 14 }}>{item.title || '(Başlıksız)'}</strong>
              <span style={{ fontSize: 13 }}>{item.media_type === 'video' ? 'Video' : 'Fotoğraf'}</span>
              <span style={{ fontSize: 13 }}>{item.category}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Öğeyi Düzenle' : 'Yeni Galeri Öğesi'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field">
            <label>Başlık (isteğe bağlı)</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Tür</label>
              <select value={editing.media_type ?? 'photo'} onChange={(e) => setEditing({ ...editing, media_type: e.target.value as 'photo' | 'video' })}>
                <option value="photo">Fotoğraf</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Kategori</label>
              <select value={editing.category ?? 'Genel'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {GALLERY_CATEGORIES.map((c) => <option value={c} key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Meclis (isteğe bağlı)</label>
              <select value={editing.council_id ?? ''} onChange={(e) => setEditing({ ...editing, council_id: e.target.value || null })}>
                <option value="">—</option>
                {councils.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Komisyon (isteğe bağlı)</label>
              <select value={editing.commission_id ?? ''} onChange={(e) => setEditing({ ...editing, commission_id: e.target.value || null })}>
                <option value="">—</option>
                {commissions.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label>Proje (isteğe bağlı)</label>
            <select value={editing.project_id ?? ''} onChange={(e) => setEditing({ ...editing, project_id: e.target.value || null })}>
              <option value="">—</option>
              {projects.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)}
            </select>
          </div>
          <p className="admin-hint" style={{ margin: '-8px 0 18px' }}>
            Bir proje seçerseniz bu fotoğraf o projenin sayfasındaki galeride de görünür.
          </p>
          {editing.media_type === 'video' ? (
            <div className="admin-field">
              <label>Video URL</label>
              <input value={editing.media_url ?? ''} onChange={(e) => setEditing({ ...editing, media_url: e.target.value })} placeholder="https://…" />
            </div>
          ) : (
            <ImageField label="Fotoğraf" value={editing.media_url ?? ''} onChange={(url) => setEditing({ ...editing, media_url: url })} />
          )}
          {editing.media_type === 'video' && (
            <ImageField label="Kapak Görseli (isteğe bağlı)" value={editing.thumbnail_url ?? ''} onChange={(url) => setEditing({ ...editing, thumbnail_url: url })} />
          )}
          <div className="admin-checkbox-row">
            <input id="gallery-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="gallery-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
