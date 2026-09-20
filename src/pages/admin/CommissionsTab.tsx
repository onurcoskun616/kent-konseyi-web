import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import {
  adminFetchAllCommissions,
  adminUpsertCommission,
  adminDeleteCommission,
  fetchCommissionMembers,
  adminUpsertCommissionMember,
  adminDeleteCommissionMember,
} from '@/lib/data/commissions';
import type { Commission, CommissionMember } from '@/lib/supabase';
import { AdminModal, ImageField } from './shared';

export function CommissionsTab() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Commission> | null>(null);
  const [membersOf, setMembersOf] = useState<Commission | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllCommissions().then((data) => { setCommissions(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.slug?.trim()) { setError('Ad ve slug zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertCommission({
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
    if (!confirm('Bu komisyonu silmek istediğinize emin misiniz? Bağlı üyeler de silinecek.')) return;
    await adminDeleteCommission(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Komisyonlar</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ display_order: commissions.length, is_published: true }); }}>
          <Plus size={16} /> Yeni Komisyon
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : commissions.length === 0 ? (
        <div className="admin-empty">Henüz komisyon eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 120px 100px 100px' }}>
            <span>Ad</span><span>Slug</span><span>Durum</span><span></span>
          </div>
          {commissions.map((commission) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 120px 100px 100px' }} key={commission.id}>
              <div><strong style={{ fontSize: 14 }}>{commission.name}</strong></div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>/{commission.slug}</span>
              <span className={`admin-badge ${commission.is_published ? 'on' : 'off'}`}>{commission.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => setMembersOf(commission)} aria-label="Üyeler"><Users size={15} /></button>
                <button onClick={() => { setError(null); setEditing(commission); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(commission.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Komisyonu Düzenle' : 'Yeni Komisyon'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Ad</label>
              <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Slug (URL)</label>
              <input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="egitim" />
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
              <input id="commission-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              <label htmlFor="commission-published">Yayında</label>
            </div>
          </div>
        </AdminModal>
      )}

      {membersOf && <CommissionMembersModal commission={membersOf} onClose={() => setMembersOf(null)} />}
    </>
  );
}

function CommissionMembersModal({ commission, onClose }: { commission: Commission; onClose: () => void }) {
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<CommissionMember>>({ role: 'Üye', display_order: 0 });
  const [saving, setSaving] = useState(false);

  const refresh = () => { setLoading(true); fetchCommissionMembers(commission.id).then((data) => { setMembers(data); setLoading(false); }); };
  useEffect(refresh, [commission.id]);

  async function save() {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      await adminUpsertCommissionMember({ ...form, commission_id: commission.id, name: form.name.trim(), role: form.role || 'Üye' });
      setForm({ role: 'Üye', display_order: 0 });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
    await adminDeleteCommissionMember(id);
    refresh();
  }

  return (
    <AdminModal title={`${commission.name} — Üyeler`} onClose={onClose} onSave={save} saving={saving} error={null} wide>
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
