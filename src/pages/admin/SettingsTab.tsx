import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminUpdateLogo } from '@/lib/data/settings';
import { cacheSiteLogo } from '@/pages/shared';
import { ImageField } from './shared';

export function SettingsTab({ currentLogo, onLogoChange }: { currentLogo: string | null; onLogoChange: (url: string | null) => void }) {
  const [logoUrl, setLogoUrl] = useState(currentLogo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const url = logoUrl.trim() || null;
      await adminUpdateLogo(url);
      cacheSiteLogo(url);
      onLogoChange(url);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function removeLogo() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminUpdateLogo(null);
      cacheSiteLogo(null);
      setLogoUrl('');
      onLogoChange(null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="admin-content-header">
        <h2>Site Ayarları</h2>
      </div>

      <div className="admin-table" style={{ padding: 28 }}>
        {error && <div className="admin-error">{error}</div>}
        {saved && <div className="notice success">Logo güncellendi.</div>}

        <ImageField label="Site Logosu" value={logoUrl} onChange={setLogoUrl} />

        <p className="admin-hint" style={{ margin: '-6px 0 22px' }}>
          Şeffaf zeminli <strong>PNG</strong> yükleyin. JPG formatı şeffaflığı desteklemediği için
          logonun arkasında beyaz bir kutu görünür — bu özellikle koyu zeminli alt bilgi alanında
          belirgin olur. Aşağıdaki iki önizlemede de düzgün görünüyorsa logo hazırdır.
        </p>

        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Önizleme</span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: '#f2f0ec', border: '1px solid var(--line)', padding: 20, display: 'inline-flex' }}>
              {logoUrl && <img src={logoUrl} alt="Açık zemin önizlemesi" style={{ height: 56, width: 'auto', display: 'block' }} />}
            </div>
            <div style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: 20, display: 'inline-flex' }}>
              {logoUrl && <img src={logoUrl} alt="Koyu zemin (alt bilgi) önizlemesi" style={{ height: 56, width: 'auto', display: 'block' }} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={save} disabled={saving}>
            Kaydet
          </button>
          <button className="admin-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={removeLogo} disabled={saving}>
            <Trash2 size={14} /> Logoyu kaldır
          </button>
        </div>
      </div>
    </>
  );
}
