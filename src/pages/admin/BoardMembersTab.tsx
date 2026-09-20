import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllBoardMembers, adminUpsertBoardMember, adminDeleteBoardMember } from '@/lib/data/boardMembers';
import type { BoardMember } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

export function BoardMembersTab() {
  const [items, setItems] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BoardMember> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllBoardMembers().then((data) => { setItems(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) { setError('Ad soyad zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertBoardMember({
        id: editing.id,
        name: editing.name.trim(),
        role: editing.role?.trim() || 'Üye',
        photo_url: editing.photo_url?.trim() || null,
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
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
    await adminDeleteBoardMember(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Yürütme Kurulu</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ role: 'Üye', display_order: items.length, is_published: true }); }}>
          <Plus size={16} /> Yeni Üye
        </button>
      </div>
      <p className="admin-hint">
        Kurumsal → Yürütme Kurulu sayfasında görev dağılımı ve fotoğraflarıyla listelenecek üyeler.
      </p>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Henüz üye eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 1fr 100px 90px' }}>
            <span>Ad Soyad</span><span>Görev / Unvan</span><span>Durum</span><span></span>
          </div>
          {items.map((item) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 1fr 100px 90px' }} key={item.id}>
              <strong style={{ fontSize: 14 }}>{item.name}</strong>
              <span style={{ fontSize: 13 }}>{item.role}</span>
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
        <AdminModal title={editing.id ? 'Üyeyi Düzenle' : 'Yeni Üye'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Ad Soyad</label>
              <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Görev / Unvan</label>
              <input value={editing.role ?? ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Başkan" />
            </div>
          </div>
          <ImageField label="Fotoğraf" value={editing.photo_url ?? ''} onChange={(url) => setEditing({ ...editing, photo_url: url })} />
          <div className="admin-field">
            <label>Gösterim Sırası</label>
            <input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
          </div>
          <div className="admin-checkbox-row">
            <input id="board-member-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="board-member-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
