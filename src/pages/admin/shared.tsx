import { useRef, useState } from 'react';
import { Check, Loader2, Trash2, Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/data/storage';
import { slugify } from '@/lib/slug';

export function AdminModal({
  title,
  onClose,
  onSave,
  saving,
  error,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={wide ? { maxWidth: 720 } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-grid">{children}</div>
        <div className="admin-modal-actions">
          <button className="admin-btn-secondary" onClick={onClose}>İptal</button>
          <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={onSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <><Check size={15} style={{ display: 'inline', marginRight: 7 }} />Kaydet</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadField({
  label,
  value,
  onChange,
  bucket,
  accept,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket: 'media' | 'documents';
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(bucket, file);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… veya dosya yükleyin" style={{ flex: 1 }} />
        <button
          type="button"
          className="admin-btn-secondary"
          style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />} Yükle
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''; }}
        />
      </div>
      {uploadError && <small style={{ color: 'var(--red)' }}>{uploadError}</small>}
    </div>
  );
}

export function SlugField({ value, source, onChange }: { value: string; source: string; onChange: (value: string) => void }) {
  return (
    <div className="admin-field">
      <label>Adres (slug)</label>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={value}
          onChange={(e) => onChange(slugify(e.target.value))}
          placeholder="genclik-meclisi-calistayi"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="admin-btn-secondary"
          style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
          onClick={() => onChange(slugify(source))}
          disabled={!source.trim()}
        >
          Başlıktan üret
        </button>
      </div>
      <small style={{ color: 'var(--muted)', fontSize: 12, display: 'block', marginTop: 6 }}>
        Boş bırakılırsa adres kayıt numarasıyla oluşur. Yayındaki bir kaydın adresini
        değiştirmek eski bağlantıları kırar.
      </small>
    </div>
  );
}

export function ImageField(props: { label: string; value: string; onChange: (url: string) => void }) {
  return <UploadField {...props} bucket="media" accept="image/*" />;
}

export function PdfField(props: { label: string; value: string; onChange: (url: string) => void }) {
  return <UploadField {...props} bucket="documents" accept="application/pdf" />;
}

export function ConfirmDeleteButton({ onDelete, label = 'Sil' }: { onDelete: () => void; label?: string }) {
  return (
    <button
      className="danger"
      aria-label={label}
      onClick={() => { if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) onDelete(); }}
    >
      <Trash2 size={15} />
    </button>
  );
}
