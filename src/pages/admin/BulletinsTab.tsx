import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllBulletins, adminUpsertBulletin, adminDeleteBulletin } from '@/lib/data/bulletins';
import { BULLETIN_PERIODS, type Bulletin } from '@/lib/supabase';
import { AdminModal, PdfField } from './shared';

export function BulletinsTab() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Bulletin> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllBulletins().then((data) => { setBulletins(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Başlık zorunludur.'); return; }
    if (!editing.file_url?.trim()) { setError('PDF dosyası zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertBulletin({
        id: editing.id,
        title: editing.title.trim(),
        period: editing.period || 'Aylık',
        file_url: editing.file_url.trim(),
        published_at: editing.published_at || new Date().toISOString().slice(0, 10),
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
    if (!confirm('Bu bülteni silmek istediğinize emin misiniz?')) return;
    await adminDeleteBulletin(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Bültenler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ period: 'Aylık', published_at: new Date().toISOString().slice(0, 10), is_published: true }); }}>
          <Plus size={16} /> Yeni Bülten
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : bulletins.length === 0 ? (
        <div className="admin-empty">Henüz bülten eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 100px 100px 90px' }}>
            <span>Başlık</span><span>Dönem</span><span>Durum</span><span></span>
          </div>
          {bulletins.map((bulletin) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 100px 100px 90px' }} key={bulletin.id}>
              <strong style={{ fontSize: 14 }}>{bulletin.title}</strong>
              <span style={{ fontSize: 13 }}>{bulletin.period}</span>
              <span className={`admin-badge ${bulletin.is_published ? 'on' : 'off'}`}>{bulletin.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(bulletin); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(bulletin.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Bülteni Düzenle' : 'Yeni Bülten'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field">
            <label>Başlık</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Dönem</label>
              <select value={editing.period ?? 'Aylık'} onChange={(e) => setEditing({ ...editing, period: e.target.value })}>
                {BULLETIN_PERIODS.map((p) => <option value={p} key={p}>{p}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Tarih</label>
              <input type="date" value={editing.published_at ?? ''} onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} />
            </div>
          </div>
          <PdfField label="PDF Dosyası" value={editing.file_url ?? ''} onChange={(url) => setEditing({ ...editing, file_url: url })} />
          <div className="admin-checkbox-row">
            <input id="bulletin-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="bulletin-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
