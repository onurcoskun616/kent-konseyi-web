import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { adminUpdateLogo } from '@/lib/data/settings';
import defaultLogo from '@/assets/logo.png';
import { ImageField } from './shared';

export function SettingsTab({ currentLogo, onLogoChange }: { currentLogo: string; onLogoChange: (url: string) => void }) {
  const [logoUrl, setLogoUrl] = useState(currentLogo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminUpdateLogo(logoUrl || null);
      onLogoChange(logoUrl || defaultLogo);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminUpdateLogo(null);
      setLogoUrl(defaultLogo);
      onLogoChange(defaultLogo);
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

        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Önizleme</span>
          <div style={{ background: '#f2f0ec', border: '1px solid var(--line)', padding: 20, display: 'inline-flex' }}>
            {logoUrl && <img src={logoUrl} alt="Logo önizleme" style={{ height: 56, width: 'auto', display: 'block' }} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={save} disabled={saving}>
            Kaydet
          </button>
          <button className="admin-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={resetToDefault} disabled={saving}>
            <RotateCcw size={14} /> Varsayılana dön
          </button>
        </div>
      </div>
    </>
  );
}
