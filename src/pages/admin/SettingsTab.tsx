import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminUpdateLogo, adminUpdateContact, fetchSiteSettings } from '@/lib/data/settings';
import { adminFetchAllSocialLinks, adminUpsertSocialLink, adminDeleteSocialLink } from '@/lib/data/socialLinks';
import { cacheSiteSettings, cacheSocialLinks } from '@/pages/shared';
import { SOCIAL_PLATFORMS, type SocialLink } from '@/lib/supabase';
import { ImageField } from './shared';

export function SettingsTab({ currentLogo, onLogoChange }: { currentLogo: string | null; onLogoChange: (url: string | null) => void }) {
  return (
    <>
      <div className="admin-content-header">
        <h2>Site Ayarları</h2>
      </div>
      <LogoSection currentLogo={currentLogo} onLogoChange={onLogoChange} />
      <ContactSection />
      <SocialSection />
    </>
  );
}

function LogoSection({ currentLogo, onLogoChange }: { currentLogo: string | null; onLogoChange: (url: string | null) => void }) {
  const [logoUrl, setLogoUrl] = useState(currentLogo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function persist(url: string | null) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await adminUpdateLogo(url);
      cacheSiteSettings(updated);
      setLogoUrl(url ?? '');
      onLogoChange(url);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-table" style={{ padding: 28, marginBottom: 24 }}>
      <h3 className="admin-section-title">Logo</h3>
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
        <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={() => persist(logoUrl.trim() || null)} disabled={saving}>
          Kaydet
        </button>
        <button className="admin-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={() => persist(null)} disabled={saving}>
          <Trash2 size={14} /> Logoyu kaldır
        </button>
      </div>
    </div>
  );
}

function ContactSection() {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((settings) => {
      setAddress(settings?.address ?? '');
      setPhone(settings?.phone ?? '');
      setEmail(settings?.email ?? '');
      setMapUrl(settings?.map_embed_url ?? '');
      setNotifyEmail(settings?.notification_email ?? '');
      setLoading(false);
    });
  }, []);

  async function save() {
    const trimmedMap = mapUrl.trim();
    if (trimmedMap && !trimmedMap.startsWith('https://')) {
      setError('Harita adresi https:// ile başlamalıdır.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await adminUpdateContact({
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        map_embed_url: trimmedMap || null,
        notification_email: notifyEmail.trim() || null,
      });
      cacheSiteSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-loading">Yükleniyor…</div>;

  return (
    <div className="admin-table" style={{ padding: 28, marginBottom: 24 }}>
      <h3 className="admin-section-title">İletişim Bilgileri</h3>
      <p className="admin-hint" style={{ margin: '0 0 20px' }}>
        Bu bilgiler hem İletişim sayfasında hem de sitenin alt bilgi alanında görünür.
        Boş bıraktığınız alanlar hiç gösterilmez.
      </p>
      {error && <div className="admin-error">{error}</div>}
      {saved && <div className="notice success">İletişim bilgileri güncellendi.</div>}

      <div className="admin-field">
        <label>Adres (satır atlamak için Enter kullanın)</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={'Atatürk Mah. Kent Konseyi Merkezi\nKüçükçekmece / İstanbul'} />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0212 000 00 00" />
        </div>
        <div className="admin-field">
          <label>E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@kucukcekmecekentkonseyi.org" />
        </div>
      </div>
      <div className="admin-field">
        <label>Harita gömme adresi (isteğe bağlı)</label>
        <input value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
      </div>
      <p className="admin-hint" style={{ margin: '-8px 0 20px' }}>
        Google Haritalar'da konumu açıp <strong>Paylaş → Harita yerleştir</strong> bölümündeki
        <code> src=&quot;...&quot;</code> adresini buraya yapıştırın. Yalnızca https adresleri kabul edilir.
      </p>

      <div className="admin-field">
        <label>Bildirim adresi (isteğe bağlı)</label>
        <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="Boş bırakılırsa yukarıdaki e-posta kullanılır" />
      </div>
      <p className="admin-hint" style={{ margin: '-8px 0 20px' }}>
        İletişim formuna yeni bir başvuru geldiğinde bu adrese bildirim e-postası gönderilir.
        Sitede görünmez; yalnızca bildirim için kullanılır. Bildirimlerin çalışması için
        e-posta servisi ayarının bir kez yapılmış olması gerekir.
      </p>

      <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={save} disabled={saving}>
        Kaydet
      </button>
    </div>
  );
}

function SocialSection() {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<SocialLink>>({ platform: SOCIAL_PLATFORMS[0], display_order: 0, is_published: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    adminFetchAllSocialLinks().then((data) => {
      setItems(data);
      cacheSocialLinks(data.filter((link) => link.is_published));
      setLoading(false);
    });
  };
  useEffect(refresh, []);

  async function save() {
    if (!form.url?.trim()) { setError('Bağlantı adresi zorunludur.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminUpsertSocialLink({
        id: form.id,
        platform: form.platform || 'Diğer',
        url: form.url.trim(),
        display_order: form.display_order ?? items.length,
        is_published: form.is_published ?? true,
      });
      setForm({ platform: SOCIAL_PLATFORMS[0], display_order: 0, is_published: true });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu bağlantıyı silmek istediğinize emin misiniz?')) return;
    await adminDeleteSocialLink(id);
    refresh();
  }

  return (
    <div className="admin-table" style={{ padding: 28 }}>
      <h3 className="admin-section-title">Sosyal Medya</h3>
      <p className="admin-hint" style={{ margin: '0 0 20px' }}>
        Eklediğiniz hesaplar alt bilgi alanında ve İletişim sayfasında ikon olarak görünür.
        Facebook, Instagram, X, YouTube ve LinkedIn için kendi ikonu kullanılır; diğer
        platformlar genel bir bağlantı ikonuyla gösterilir.
      </p>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-field-row">
        <div className="admin-field">
          <label>Platform</label>
          <select value={form.platform ?? ''} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            {SOCIAL_PLATFORMS.map((p) => <option value={p} key={p}>{p}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label>Bağlantı adresi</label>
          <input value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://instagram.com/hesap" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="admin-submit" style={{ width: 'auto', padding: '11px 22px' }} onClick={save} disabled={saving}>
          {form.id ? 'Güncelle' : <><Plus size={15} style={{ display: 'inline', marginRight: 6 }} />Ekle</>}
        </button>
        {form.id && (
          <button className="admin-btn-secondary" onClick={() => setForm({ platform: SOCIAL_PLATFORMS[0], display_order: 0, is_published: true })}>
            Vazgeç
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Henüz sosyal medya bağlantısı eklenmemiş.</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '140px 1fr 90px' }}>
            <span>Platform</span><span>Adres</span><span></span>
          </div>
          {items.map((item) => (
            <div className="admin-table-row" style={{ gridTemplateColumns: '140px 1fr 90px' }} key={item.id}>
              <strong style={{ fontSize: 14 }}>{item.platform}</strong>
              <span style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setError(null); setForm(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="danger" onClick={() => remove(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
