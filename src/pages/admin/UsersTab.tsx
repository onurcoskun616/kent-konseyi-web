import { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  changeAdminEmail,
  changeAdminPassword,
  verifyCurrentPassword,
} from '@/lib/data/adminUsers';
import { ADMIN_ROLES, type AdminRole, type AdminUser } from '@/lib/supabase';
import { AdminModal } from './shared';

export function UsersTab({ me, onMeChange }: { me: AdminUser; onMeChange: (user: AdminUser) => void }) {
  return (
    <>
      <div className="admin-content-header">
        <h2>Kullanıcılar</h2>
      </div>
      <HesabimSection me={me} onMeChange={onMeChange} />
      {me.role === 'yonetici' && <KullaniciListesi me={me} />}
    </>
  );
}

/* ================= Kendi hesabı ================= */

function HesabimSection({ me, onMeChange }: { me: AdminUser; onMeChange: (user: AdminUser) => void }) {
  const [email, setEmail] = useState(me.email);
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  const epostaDegisti = email.trim().toLowerCase() !== me.email.toLowerCase();
  const sifreDegisecek = yeniSifre.length > 0;

  async function kaydet() {
    setHata(null);
    setBasari(null);

    if (!epostaDegisti && !sifreDegisecek) {
      setHata('Değiştirilecek bir şey girmediniz.');
      return;
    }
    if (sifreDegisecek && yeniSifre.length < 8) {
      setHata('Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (sifreDegisecek && yeniSifre !== yeniSifreTekrar) {
      setHata('Yeni şifre iki alanda aynı değil.');
      return;
    }
    if (!mevcutSifre) {
      setHata('Değişikliği onaylamak için mevcut şifrenizi girin.');
      return;
    }

    setKaydediliyor(true);
    try {
      // Mevcut şifre doğrulanmadan devam edilmiyor: açık bırakılmış bir
      // oturuma erişen kişi aksi hâlde hesabı tamamen devralabilirdi.
      const dogru = await verifyCurrentPassword(me.email, mevcutSifre);
      if (!dogru) {
        setHata('Mevcut şifreniz hatalı.');
        return;
      }

      if (sifreDegisecek) await changeAdminPassword(me.id, yeniSifre);
      if (epostaDegisti) await changeAdminEmail(me.id, email.trim().toLowerCase());

      onMeChange({ ...me, email: epostaDegisti ? email.trim().toLowerCase() : me.email });
      setMevcutSifre('');
      setYeniSifre('');
      setYeniSifreTekrar('');
      setBasari(
        epostaDegisti && sifreDegisecek ? 'E-posta ve şifreniz güncellendi.'
          : epostaDegisti ? 'E-posta adresiniz güncellendi. Bundan sonra bu adresle giriş yapacaksınız.'
          : 'Şifreniz güncellendi.',
      );
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'İşlem tamamlanamadı.');
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <div className="admin-table" style={{ padding: 28, marginBottom: 24 }}>
      <h3 className="admin-section-title">Hesabım</h3>
      <p className="admin-hint" style={{ margin: '0 0 20px' }}>
        Giriş bilgilerinizi buradan değiştirirsiniz. Yetkiniz:{' '}
        <strong>{ADMIN_ROLES.find((r) => r.value === me.role)?.label}</strong>.
      </p>
      {hata && <div className="admin-error">{hata}</div>}
      {basari && <div className="notice success">{basari}</div>}

      <div className="admin-field">
        <label>E-posta</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="admin-field-row">
        <div className="admin-field">
          <label>Yeni şifre (değiştirmeyecekseniz boş bırakın)</label>
          <input type="password" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="admin-field">
          <label>Yeni şifre (tekrar)</label>
          <input type="password" value={yeniSifreTekrar} onChange={(e) => setYeniSifreTekrar(e.target.value)} autoComplete="new-password" />
        </div>
      </div>

      <div className="admin-field">
        <label>Mevcut şifreniz</label>
        <input type="password" value={mevcutSifre} onChange={(e) => setMevcutSifre(e.target.value)} autoComplete="current-password" />
      </div>
      <p className="admin-hint" style={{ margin: '-8px 0 20px' }}>
        Değişikliği onaylamak için mevcut şifreniz gerekiyor.
      </p>

      <button className="admin-submit" style={{ width: 'auto', padding: '12px 26px' }} onClick={kaydet} disabled={kaydediliyor}>
        Kaydet
      </button>
    </div>
  );
}

/* ================= Kullanıcı listesi (yalnızca yönetici) ================= */

type Form = { email: string; ad_soyad: string; rol: AdminRole; sifre: string };
const BOS_FORM: Form = { email: '', ad_soyad: '', rol: 'editor', sifre: '' };

function KullaniciListesi({ me }: { me: AdminUser }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [sifreSifirla, setSifreSifirla] = useState<AdminUser | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [listeHatasi, setListeHatasi] = useState<string | null>(null);

  const yenile = () => {
    setYukleniyor(true);
    fetchAdminUsers()
      .then((data) => { setUsers(data); setListeHatasi(null); })
      .catch((err) => setListeHatasi(err instanceof Error ? err.message : 'Liste yüklenemedi.'))
      .finally(() => setYukleniyor(false));
  };
  useEffect(yenile, []);

  async function ekle() {
    if (!form) return;
    setKaydediliyor(true);
    setHata(null);
    try {
      await createAdminUser({
        email: form.email.trim().toLowerCase(),
        sifre: form.sifre,
        rol: form.rol,
        ad_soyad: form.ad_soyad.trim() || null,
      });
      setForm(null);
      yenile();
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kullanıcı eklenemedi.');
    } finally {
      setKaydediliyor(false);
    }
  }

  async function sifreyiDegistir() {
    if (!sifreSifirla) return;
    setKaydediliyor(true);
    setHata(null);
    try {
      await changeAdminPassword(sifreSifirla.id, form?.sifre ?? '');
      setSifreSifirla(null);
      setForm(null);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Şifre değiştirilemedi.');
    } finally {
      setKaydediliyor(false);
    }
  }

  async function alanGuncelle(user: AdminUser, fields: { role?: AdminRole; is_active?: boolean }) {
    setListeHatasi(null);
    try {
      await updateAdminUser(user.id, fields);
      yenile();
    } catch (err) {
      setListeHatasi(err instanceof Error ? err.message : 'Güncellenemedi.');
    }
  }

  async function sil(user: AdminUser) {
    if (!confirm(`${user.email} hesabını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setListeHatasi(null);
    try {
      await deleteAdminUser(user.id);
      yenile();
    } catch (err) {
      setListeHatasi(err instanceof Error ? err.message : 'Silinemedi.');
    }
  }

  const SUTUNLAR = '1.4fr 120px 110px 110px';

  return (
    <div className="admin-table" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h3 className="admin-section-title" style={{ margin: 0 }}>Panel Kullanıcıları</h3>
        <button className="button" onClick={() => { setHata(null); setForm({ ...BOS_FORM }); }}>
          <Plus size={16} /> Yeni Kullanıcı
        </button>
      </div>
      <p className="admin-hint" style={{ margin: '14px 0 20px' }}>
        {ADMIN_ROLES.map((r) => (
          <span key={r.value} style={{ display: 'block' }}>
            <strong>{r.label}:</strong> {r.hint}
          </span>
        ))}
      </p>
      {listeHatasi && <div className="admin-error">{listeHatasi}</div>}

      {yukleniyor ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: SUTUNLAR }}>
            <span>Kullanıcı</span><span>Yetki</span><span>Durum</span><span></span>
          </div>
          {users.map((user) => {
            const kendisi = user.id === me.id;
            return (
              <div className="admin-table-row" style={{ gridTemplateColumns: SUTUNLAR }} key={user.id}>
                <div>
                  <strong style={{ fontSize: 14 }}>{user.full_name || user.email}</strong>
                  {user.full_name && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{user.email}</div>}
                  {kendisi && <div style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700, marginTop: 3 }}>Siz</div>}
                </div>

                {/* Kendi yetkisini düşürmek panelden kilitlenmeye yol açar. */}
                {kendisi ? (
                  <span style={{ fontSize: 13, alignSelf: 'center' }}>{ADMIN_ROLES.find((r) => r.value === user.role)?.label}</span>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) => alanGuncelle(user, { role: e.target.value as AdminRole })}
                    style={{ fontSize: 13, padding: '6px 8px', alignSelf: 'center' }}
                  >
                    {ADMIN_ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
                  </select>
                )}

                {kendisi ? (
                  <span className="admin-badge on" style={{ alignSelf: 'center', justifySelf: 'start' }}>Etkin</span>
                ) : (
                  <button
                    className={`admin-badge ${user.is_active ? 'on' : 'off'}`}
                    style={{ border: 0, cursor: 'pointer', alignSelf: 'center', justifySelf: 'start' }}
                    onClick={() => alanGuncelle(user, { is_active: !user.is_active })}
                    title={user.is_active ? 'Erişimi kapat' : 'Erişimi aç'}
                  >
                    {user.is_active ? 'Etkin' : 'Kapalı'}
                  </button>
                )}

                <div className="admin-row-actions">
                  {!kendisi && (
                    <>
                      <button
                        onClick={() => { setHata(null); setForm({ ...BOS_FORM }); setSifreSifirla(user); }}
                        aria-label="Şifre belirle" title="Şifre belirle"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button className="danger" onClick={() => sil(user)} aria-label="Sil" title="Sil">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && !sifreSifirla && (
        <AdminModal title="Yeni Kullanıcı" onClose={() => setForm(null)} onSave={ekle} saving={kaydediliyor} error={hata}>
          <div className="admin-field">
            <label>Ad Soyad (isteğe bağlı)</label>
            <input value={form.ad_soyad} onChange={(e) => setForm({ ...form, ad_soyad: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>E-posta</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@kentkonseyi.org" />
          </div>
          <div className="admin-field">
            <label>Başlangıç şifresi</label>
            <input type="password" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} autoComplete="new-password" />
          </div>
          <p className="admin-hint" style={{ margin: '-8px 0 18px' }}>
            En az 8 karakter. Kullanıcı giriş yaptıktan sonra <strong>Kullanıcılar → Hesabım</strong>{' '}
            bölümünden kendi şifresini değiştirebilir.
          </p>
          <div className="admin-field">
            <label>Yetki</label>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as AdminRole })}>
              {ADMIN_ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
            </select>
          </div>
          <p className="admin-hint" style={{ margin: '-8px 0 0' }}>
            {ADMIN_ROLES.find((r) => r.value === form.rol)?.hint}
          </p>
        </AdminModal>
      )}

      {form && sifreSifirla && (
        <AdminModal
          title={`${sifreSifirla.email} için şifre belirle`}
          onClose={() => { setSifreSifirla(null); setForm(null); }}
          onSave={sifreyiDegistir}
          saving={kaydediliyor}
          error={hata}
        >
          <div className="admin-field">
            <label>Yeni şifre</label>
            <input type="password" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} autoComplete="new-password" />
          </div>
          <p className="admin-hint" style={{ margin: '-8px 0 0' }}>
            En az 8 karakter. Yeni şifreyi kullanıcıya siz iletmelisiniz; sistem e-posta göndermiyor.
          </p>
        </AdminModal>
      )}
    </div>
  );
}
