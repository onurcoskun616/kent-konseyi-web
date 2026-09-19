import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllDocuments, adminUpsertDocument, adminDeleteDocument } from '@/lib/data/documents';
import { DOCUMENT_CATEGORIES, type Commission, type Council, type DocumentItem } from '@/lib/supabase';
import { AdminModal, PdfField } from './shared';

export function DocumentsTab({ councils, commissions }: { councils: Council[]; commissions: Commission[] }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<DocumentItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllDocuments().then((data) => { setDocuments(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Başlık zorunludur.'); return; }
    if (!editing.file_url?.trim()) { setError('PDF dosyası zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertDocument({
        id: editing.id,
        title: editing.title.trim(),
        category: editing.category || 'Rapor',
        file_url: editing.file_url.trim(),
        description: editing.description?.trim() || null,
        published_at: editing.published_at || new Date().toISOString().slice(0, 10),
        council_id: editing.council_id || null,
        commission_id: editing.commission_id || null,
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
    if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;
    await adminDeleteDocument(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Belgeler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ category: 'Rapor', published_at: new Date().toISOString().slice(0, 10), is_published: true }); }}>
          <Plus size={16} /> Yeni Belge
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : documents.length === 0 ? (
        <div className="admin-empty">Henüz belge eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 130px 100px 90px' }}>
            <span>Başlık</span><span>Kategori</span><span>Durum</span><span></span>
          </div>
          {documents.map((doc) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 130px 100px 90px' }} key={doc.id}>
              <strong style={{ fontSize: 14 }}>{doc.title}</strong>
              <span style={{ fontSize: 13 }}>{doc.category}</span>
              <span className={`admin-badge ${doc.is_published ? 'on' : 'off'}`}>{doc.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(doc); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(doc.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Belgeyi Düzenle' : 'Yeni Belge'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field">
            <label>Başlık</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Kategori</label>
              <select value={editing.category ?? 'Rapor'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {DOCUMENT_CATEGORIES.map((c) => <option value={c} key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Tarih</label>
              <input type="date" value={editing.published_at ?? ''} onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} />
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
            <label>Açıklama (isteğe bağlı)</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <PdfField label="PDF Dosyası" value={editing.file_url ?? ''} onChange={(url) => setEditing({ ...editing, file_url: url })} />
          <div className="admin-checkbox-row">
            <input id="document-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="document-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
