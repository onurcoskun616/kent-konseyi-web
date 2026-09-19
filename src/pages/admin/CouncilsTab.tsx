import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import {
  adminFetchAllCouncils,
  adminUpsertCouncil,
  adminDeleteCouncil,
  fetchCouncilMembers,
  adminUpsertCouncilMember,
  adminDeleteCouncilMember,
} from '@/lib/data/councils';
import type { Council, CouncilMember } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

export function CouncilsTab() {
  const [councils, setCouncils] = useState<Council[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Council> | null>(null);
  const [membersOf, setMembersOf] = useState<Council | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllCouncils().then((data) => { setCouncils(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.slug?.trim()) { setError('Ad ve slug zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertCouncil({
        id: editing.id,
        slug: editing.slug.trim(),
        name: editing.name.trim(),
        tagline: editing.tagline?.trim() || null,
        cover_image_url: editing.cover_image_url?.trim() || null,
        about: editing.about?.trim() || '',
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
    if (!confirm('Bu meclisi silmek istediğinize emin misiniz? Bağlı üyeler de silinecek.')) return;
    await adminDeleteCouncil(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Meclisler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ display_order: councils.length, is_published: true }); }}>
          <Plus size={16} /> Yeni Meclis
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : councils.length === 0 ? (
        <div className="admin-empty">Henüz meclis eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 120px 100px 100px' }}>
            <span>Ad</span><span>Slug</span><span>Durum</span><span></span>
          </div>
          {councils.map((council) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 120px 100px 100px' }} key={council.id}>
              <div><strong style={{ fontSize: 14 }}>{council.name}</strong></div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>/{council.slug}</span>
              <span className={`admin-badge ${council.is_published ? 'on' : 'off'}`}>{council.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => setMembersOf(council)} aria-label="Üyeler"><Users size={15} /></button>
                <button onClick={() => { setError(null); setEditing(council); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(council.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Meclisi Düzenle' : 'Yeni Meclis'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Ad</label>
              <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Slug (URL)</label>
              <input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="genclik" />
            </div>
          </div>
          <div className="admin-field">
            <label>Slogan (isteğe bağlı)</label>
            <input value={editing.tagline ?? ''} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Hakkında</label>
            <textarea value={editing.about ?? ''} onChange={(e) => setEditing({ ...editing, about: e.target.value })} style={{ minHeight: 110 }} />
          </div>
          <ImageField label="Kapak Görseli" value={editing.cover_image_url ?? ''} onChange={(url) => setEditing({ ...editing, cover_image_url: url })} />
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Sıra</label>
              <input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
            </div>
            <div className="admin-checkbox-row" style={{ alignSelf: 'end', marginBottom: 20 }}>
              <input id="council-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              <label htmlFor="council-published">Yayında</label>
            </div>
          </div>
        </AdminModal>
      )}

      {membersOf && <CouncilMembersModal council={membersOf} onClose={() => setMembersOf(null)} />}
    </>
  );
}

function CouncilMembersModal({ council, onClose }: { council: Council; onClose: () => void }) {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<CouncilMember>>({ role: 'Üye', display_order: 0 });
  const [saving, setSaving] = useState(false);

  const refresh = () => { setLoading(true); fetchCouncilMembers(council.id).then((data) => { setMembers(data); setLoading(false); }); };
  useEffect(refresh, [council.id]);

  async function save() {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      await adminUpsertCouncilMember({ ...form, council_id: council.id, name: form.name.trim(), role: form.role || 'Üye' });
      setForm({ role: 'Üye', display_order: 0 });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
    await adminDeleteCouncilMember(id);
    refresh();
  }

  return (
    <AdminModal title={`${council.name} — Üyeler`} onClose={onClose} onSave={save} saving={saving} error={null} wide>
      <div className="admin-field-row">
        <div className="admin-field"><label>Ad Soyad</label><input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="admin-field"><label>Görev</label><input value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Başkan" /></div>
      </div>
      <ImageField label="Fotoğraf" value={form.photo_url ?? ''} onChange={(url) => setForm({ ...form, photo_url: url })} />
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 18px' }}>Yukarıdaki formu doldurup "Kaydet" ile üye ekleyin; bir satırı düzenlemek için kalem simgesine tıklayın.</p>

      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : members.length === 0 ? (
        <div className="admin-empty">Henüz üye eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 1fr 80px' }}><span>Ad</span><span>Görev</span><span></span></div>
          {members.map((member) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 1fr 80px' }} key={member.id}>
              <strong style={{ fontSize: 14 }}>{member.name}</strong>
              <span style={{ fontSize: 13 }}>{member.role}</span>
              <div className="admin-row-actions">
                <button onClick={() => setForm(member)} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(member.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminModal>
  );
}
