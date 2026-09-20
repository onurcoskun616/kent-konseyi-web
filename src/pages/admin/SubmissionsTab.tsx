import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  adminFetchAllContactSubmissions,
  adminUpdateContactSubmissionStatus,
  adminDeleteContactSubmission,
} from '@/lib/data/contact';
import { CONTACT_SUBMISSION_STATUSES, type ContactSubmission } from '@/lib/supabase';

export function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => { setLoading(true); adminFetchAllContactSubmissions().then((data) => { setSubmissions(data); setLoading(false); }); };
  useEffect(refresh, []);

  async function updateStatus(id: string, status: string) {
    await adminUpdateContactSubmissionStatus(id, status);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) return;
    await adminDeleteContactSubmission(id);
    refresh();
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Form Başvuruları</h2>
      </div>
      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : submissions.length === 0 ? (
        <div className="admin-empty">Henüz başvuru yok.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1fr 1fr 140px 130px 60px' }}>
            <span>Ad / E-posta</span><span>Mesaj</span><span>Tür</span><span>Durum</span><span></span>
          </div>
          {submissions.map((item) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '1fr 1fr 140px 130px 60px' }} key={item.id}>
              <div>
                <strong style={{ fontSize: 14 }}>{item.name}</strong>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{item.email}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item.message}</span>
              <span style={{ fontSize: 12 }}>{item.type}</span>
              <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} style={{ fontSize: 12, padding: '6px 8px' }}>
                {CONTACT_SUBMISSION_STATUSES.map((s) => <option value={s} key={s}>{s}</option>)}
              </select>
              <div className="admin-row-actions">
                <button className="danger" onClick={() => remove(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
