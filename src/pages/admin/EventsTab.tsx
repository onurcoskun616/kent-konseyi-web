import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminFetchAllEvents,
  adminUpsertEvent,
  adminDeleteEvent,
  formatEventDate,
} from '@/lib/data';
import { EVENT_CATEGORIES, type Commission, type Council, type EventItem } from '@/lib/supabase';
import { AdminModal, SlugField } from './shared';

export function EventsTab({ councils, commissions }: { councils: Council[]; commissions: Commission[] }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<EventItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllEvents().then((data) => { setEvents(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Başlık zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertEvent({
        id: editing.id,
        slug: editing.slug?.trim() || null,
        title: editing.title.trim(),
        event_date: editing.event_date || new Date().toISOString().slice(0, 10),
        event_time: editing.event_time?.trim() || null,
        location: editing.location?.trim() || null,
        description: editing.description?.trim() || '',
        category: editing.category || 'Etkinlik',
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
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    await adminDeleteEvent(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Etkinlikler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ event_date: new Date().toISOString().slice(0, 10), category: 'Etkinlik', is_published: true }); }}>
          <Plus size={16} /> Yeni Etkinlik
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : events.length === 0 ? (
        <div className="admin-empty">Henüz etkinlik eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head events"><span>Başlık</span><span>Tarih</span><span>Durum</span><span></span></div>
          {events.map((item) => (
            <div className="admin-table-row events" key={item.id}>
              <div>
                <strong style={{ fontSize: 14 }}>{item.title}</strong>
                {item.location && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{item.location}</div>}
              </div>
              <span style={{ fontSize: 13 }}>{formatEventDate(item.event_date)}{item.event_time ? ` ${item.event_time}` : ''}</span>
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
        <AdminModal title={editing.id ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field">
            <label>Etkinlik Adı</label>
            <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <SlugField
            value={editing.slug ?? ''}
            source={editing.title ?? ''}
            onChange={(value) => setEditing({ ...editing, slug: value })}
          />
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Tarih</label>
              <input type="date" value={editing.event_date ?? ''} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Saat</label>
              <input value={editing.event_time ?? ''} onChange={(e) => setEditing({ ...editing, event_time: e.target.value })} placeholder="14:00" />
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Kategori</label>
              <select value={editing.category ?? 'Etkinlik'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {EVENT_CATEGORIES.map((c) => <option value={c} key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Mekan</label>
              <input value={editing.location ?? ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
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
            <label>Açıklama</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="admin-checkbox-row">
            <input id="event-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="event-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
