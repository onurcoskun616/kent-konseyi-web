import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminFetchAllProjects, adminUpsertProject, adminDeleteProject } from '@/lib/data/projects';
import { PROJECT_CATEGORIES, type Commission, type Council, type Project } from '@/lib/supabase';
import { AdminModal, ImageField, PdfField, SlugField } from './shared';

export function ProjectsTab({ councils, commissions }: { councils: Council[]; commissions: Commission[] }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); adminFetchAllProjects().then((data) => { setProjects(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function save() {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Başlık zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertProject({
        id: editing.id,
        slug: editing.slug?.trim() || null,
        title: editing.title.trim(),
        category: editing.category || 'Devam Eden',
        description: editing.description?.trim() || '',
        body: editing.body?.trim() || null,
        cover_image_url: editing.cover_image_url?.trim() || null,
        start_date: editing.start_date || null,
        end_date: editing.end_date || null,
        result_report: editing.result_report?.trim() || null,
        result_report_url: editing.result_report_url?.trim() || null,
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
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    await adminDeleteProject(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Projeler / Faaliyetler</h2>
        <button className="button" onClick={() => { setError(null); setEditing({ category: 'Devam Eden', is_published: true }); }}>
          <Plus size={16} /> Yeni Proje
        </button>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">Henüz proje eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 150px 100px 90px' }}>
            <span>Başlık</span><span>Kategori</span><span>Durum</span><span></span>
          </div>
          {projects.map((project) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 150px 100px 90px' }} key={project.id}>
              <strong style={{ fontSize: 14 }}>{project.title}</strong>
              <span style={{ fontSize: 13 }}>{project.category}</span>
              <span className={`admin-badge ${project.is_published ? 'on' : 'off'}`}>{project.is_published ? 'Yayında' : 'Taslak'}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setEditing(project); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(project.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Projeyi Düzenle' : 'Yeni Proje'} onClose={() => setEditing(null)} onSave={save} saving={saving} error={error}>
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
              <select value={editing.category ?? 'Devam Eden'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {PROJECT_CATEGORIES.map((c) => <option value={c} key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Başlangıç Tarihi</label>
              <input type="date" value={editing.start_date ?? ''} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Bitiş Tarihi</label>
              <input type="date" value={editing.end_date ?? ''} onChange={(e) => setEditing({ ...editing, end_date: e.target.value })} />
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
            <label>Kısa Açıklama</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Detay (isteğe bağlı)</label>
            <textarea value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} style={{ minHeight: 120 }} />
          </div>
          <ImageField label="Kapak Görseli" value={editing.cover_image_url ?? ''} onChange={(url) => setEditing({ ...editing, cover_image_url: url })} />

          <h4 className="admin-section-title" style={{ marginTop: 8 }}>Sonuç Raporu</h4>
          <p className="admin-hint" style={{ margin: '0 0 16px' }}>
            Proje tamamlandığında doldurun. Boş bırakılırsa proje sayfasında sonuç
            bölümü hiç görünmez. Projeye ait fotoğrafları <strong>Galeri</strong>{' '}
            sekmesinden, ilgili projeyi seçerek ekleyebilirsiniz.
          </p>
          <div className="admin-field">
            <label>Sonuç Değerlendirmesi (isteğe bağlı)</label>
            <textarea value={editing.result_report ?? ''} onChange={(e) => setEditing({ ...editing, result_report: e.target.value })} style={{ minHeight: 120 }} placeholder="Projede neler yapıldı, hangi sonuçlara ulaşıldı?" />
          </div>
          <PdfField label="Ayrıntılı Rapor (PDF, isteğe bağlı)" value={editing.result_report_url ?? ''} onChange={(url) => setEditing({ ...editing, result_report_url: url })} />

          <div className="admin-checkbox-row">
            <input id="project-published" type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <label htmlFor="project-published">Yayında</label>
          </div>
        </AdminModal>
      )}
    </>
  );
}
