import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminFetchAllNews,
  adminUpsertNews,
  adminDeleteNews,
  formatNewsDate,
} from '@/lib/data';
import type { Commission, Council, NewsItem } from '@/lib/supabase';
import { AdminModal, ImageField, SlugField } from './shared';

export function NewsTab({ councils, commissions }: { councils: Council[]; commissions: Commission[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllNews().then((data) => { setNews(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Başlık zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertNews({
        id: editing.id,
        slug: editing.slug?.trim() || null,
        title: editing.title.trim(),
        category: editing.category?.trim() || 'Duyuru',
        published_at: editing.published_at || new Date().toISOString().slice(0, 10),
        excerpt: editing.excerpt?.trim() || '',
        body: editing.body?.trim() || null,
        image_url: editing.image_url?.trim() || null,
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
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    await adminDeleteNews(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Haberler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ category: 'Duyuru', published_at: new Date().toISOString().slice(0, 10), is_published: true }); }}>
          <Plus size={16} /> Yeni Haber
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : news.length === 0 ? (
        <div className="admin-empty">Henüz haber eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head"><span>Başlık</span><span>Kategori</span><span>Durum</span><span></span></div>
          {news.map((item) => (
            <div className="admin-table-row" key={item.id}>
              <div>
                <strong style={{ fontSize: 14 }}>{item.title}</strong>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{formatNewsDate(item.published_at)}</div>
              </div>
              <span style={{ fontSize: 13 }}>{item.category}</span>
              <span className={`admin-badge ${item.is_published ? 'on' : 'off'}`}>{item.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Haberi Düzenle' : 'Yeni Haber'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field">
            <label>Başlık</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <SlugField
            value={editing.slug ?? ''}
            source={editing.title ?? ''}
            onChange={(value) => setEditing({ ...editing, slug: value })}
          />
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Kategori</label>
              <select value={editing.category ?? 'Duyuru'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                <option value="Duyuru">Duyuru</option>
                <option value="Etkinlik">Etkinlik</option>
                <option value="Proje">Proje</option>
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
            <label>Özet</label>
            <textarea value={editing.excerpt ?? ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>İçerik (isteğe bağlı)</label>
            <textarea value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} style={{ minHeight: 120 }} />
          </div>
          <ImageField label="Görsel" value={editing.image_url ?? ''} onChange={(url) => setEditing({ ...editing, image_url: url })} />
          <div className="admin-checkbox-row">
            <input id="news-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="news-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
