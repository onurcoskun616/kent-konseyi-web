import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Landmark,
  Loader2,
  Lock,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { supabase, type NewsItem, type EventItem } from '@/lib/supabase';
import {
  adminFetchAllNews,
  adminFetchAllEvents,
  adminUpsertNews,
  adminDeleteNews,
  adminUpsertEvent,
  adminDeleteEvent,
  formatNewsDate,
  formatEventDate,
} from '@/lib/data';

type Tab = 'news' | 'events';

export function Admin() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<boolean>(false);
  const [tab, setTab] = useState<Tab>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    refreshLists();
  }, [session]);

  async function refreshLists() {
    setLoadingList(true);
    try {
      const [n, e] = await Promise.all([adminFetchAllNews(), adminFetchAllEvents()]);
      setNews(n);
      setEvents(e);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function saveNews() {
    if (!editingNews) return;
    if (!editingNews.title?.trim()) {
      setFormError('Başlık zorunludur.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await adminUpsertNews({
        id: editingNews.id,
        title: editingNews.title.trim(),
        category: editingNews.category?.trim() || 'Duyuru',
        published_at: editingNews.published_at || new Date().toISOString().slice(0, 10),
        excerpt: editingNews.excerpt?.trim() || '',
        body: editingNews.body?.trim() || null,
        image_url: editingNews.image_url?.trim() || null,
        is_published: editingNews.is_published ?? true,
      });
      setEditingNews(null);
      await refreshLists();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function saveEvent() {
    if (!editingEvent) return;
    if (!editingEvent.title?.trim()) {
      setFormError('Başlık zorunludur.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await adminUpsertEvent({
        id: editingEvent.id,
        title: editingEvent.title.trim(),
        event_date: editingEvent.event_date || new Date().toISOString().slice(0, 10),
        event_time: editingEvent.event_time?.trim() || null,
        location: editingEvent.location?.trim() || null,
        description: editingEvent.description?.trim() || '',
        is_published: editingEvent.is_published ?? true,
      });
      setEditingEvent(null);
      await refreshLists();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteNewsItem(id: string) {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    try {
      await adminDeleteNews(id);
      await refreshLists();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  }

  async function deleteEventItem(id: string) {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    try {
      await adminDeleteEvent(id);
      await refreshLists();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  }

  if (!ready) {
    return <div className="admin-loading">Yükleniyor…</div>;
  }

  if (!session) {
    return <LoginScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <a className="brand" href="/yonetim">
            <span className="brand-mark"><Landmark size={22} strokeWidth={2.5} /></span>
            <span><strong>KÜÇÜKÇEKMECE</strong><small>KENT KONSEYİ</small></span>
          </a>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a className="admin-back-link" href="/"><ArrowLeft size={15} /> Siteye dön</a>
            <button className="admin-back-link" onClick={handleSignOut} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>Çıkış</button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <h4>Yönetim</h4>
          <div className={`admin-nav-item ${tab === 'news' ? 'active' : ''}`} onClick={() => setTab('news')}>
            <Newspaper size={17} /> Haberler
          </div>
          <div className={`admin-nav-item ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
            <CalendarDays size={17} /> Etkinlikler
          </div>
        </aside>

        <div className="admin-content">
          {tab === 'news' && (
            <>
              <div className="admin-content-header">
                <h2>Haberler</h2>
                <button className="button" onClick={() => { setFormError(null); setEditingNews({ category: 'Duyuru', published_at: new Date().toISOString().slice(0, 10), is_published: true }); }}>
                  <Plus size={16} /> Yeni Haber
                </button>
              </div>
              {loadingList ? (
                <div className="admin-loading">Yükleniyor…</div>
              ) : news.length === 0 ? (
                <div className="admin-empty">Henüz haber eklenmemiş.</div>
              ) : (
                <div className="admin-table">
                  <div className="admin-table-head">
                    <span>Başlık</span><span>Kategori</span><span>Durum</span><span></span>
                  </div>
                  {news.map((item) => (
                    <div className="admin-table-row" key={item.id}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{item.title}</strong>
                        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{formatNewsDate(item.published_at)}</div>
                      </div>
                      <span style={{ fontSize: 13 }}>{item.category}</span>
                      <span className={`admin-badge ${item.is_published ? 'on' : 'off'}`}>{item.is_published ? 'Yayında' : 'Taslak'}</span>
                      <div className="admin-row-actions">
                        <button onClick={() => { setFormError(null); setEditingNews(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                        <button className="danger" onClick={() => deleteNewsItem(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'events' && (
            <>
              <div className="admin-content-header">
                <h2>Etkinlikler</h2>
                <button className="button" onClick={() => { setFormError(null); setEditingEvent({ event_date: new Date().toISOString().slice(0, 10), is_published: true }); }}>
                  <Plus size={16} /> Yeni Etkinlik
                </button>
              </div>
              {loadingList ? (
                <div className="admin-loading">Yükleniyor…</div>
              ) : events.length === 0 ? (
                <div className="admin-empty">Henüz etkinlik eklenmemiş.</div>
              ) : (
                <div className="admin-table">
                  <div className="admin-table-head events">
                    <span>Başlık</span><span>Tarih</span><span>Durum</span><span></span>
                  </div>
                  {events.map((item) => (
                    <div className="admin-table-row events" key={item.id}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{item.title}</strong>
                        {item.location && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{item.location}</div>}
                      </div>
                      <span style={{ fontSize: 13 }}>{formatEventDate(item.event_date)}{item.event_time ? ` ${item.event_time}` : ''}</span>
                      <span className={`admin-badge ${item.is_published ? 'on' : 'off'}`}>{item.is_published ? 'Yayında' : 'Taslak'}</span>
                      <div className="admin-row-actions">
                        <button onClick={() => { setFormError(null); setEditingEvent(item); }} aria-label="Düzenle"><Pencil size={15} /></button>
                        <button className="danger" onClick={() => deleteEventItem(item.id)} aria-label="Sil"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingNews && (
        <NewsModal
          item={editingNews}
          onChange={setEditingNews}
          onSave={saveNews}
          onClose={() => setEditingNews(null)}
          saving={saving}
          error={formError}
        />
      )}

      {editingEvent && (
        <EventModal
          item={editingEvent}
          onChange={setEditingEvent}
          onSave={saveEvent}
          onClose={() => setEditingEvent(null)}
          saving={saving}
          error={formError}
        />
      )}
    </div>
  );
}

function LoginScreen({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await onSignIn(email, password);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div className="admin-login" style={{ background: '#f2f0ec' }}>
      <div className="admin-login-card">
        <a className="brand" href="/">
          <span className="brand-mark"><Landmark size={22} strokeWidth={2.5} /></span>
          <span><strong>KÜÇÜKÇEKMECE</strong><small>KENT KONSEYİ</small></span>
        </a>
        <h2>Yönetim Paneli</h2>
        <p className="subtitle">Devam etmek için giriş yapın</p>
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="email">E-posta</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ornek@kentkonseyi.org" />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Şifre</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="admin-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <><Lock size={15} style={{ display: 'inline', marginRight: 8 }} />Giriş Yap</>}
          </button>
        </form>
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <a className="admin-back-link" href="/"><ArrowLeft size={14} /> Ana sayfaya dön</a>
        </div>
      </div>
    </div>
  );
}

function NewsModal({
  item,
  onChange,
  onSave,
  onClose,
  saving,
  error,
}: {
  item: Partial<NewsItem>;
  onChange: (item: Partial<NewsItem>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>{item.id ? 'Haberi Düzenle' : 'Yeni Haber'}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Başlık</label>
            <input value={item.title ?? ''} onChange={(e) => onChange({ ...item, title: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Kategori</label>
              <select value={item.category ?? 'Duyuru'} onChange={(e) => onChange({ ...item, category: e.target.value })}>
                <option value="Duyuru">Duyuru</option>
                <option value="Etkinlik">Etkinlik</option>
                <option value="Proje">Proje</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Tarih</label>
              <input type="date" value={item.published_at ?? ''} onChange={(e) => onChange({ ...item, published_at: e.target.value })} />
            </div>
          </div>
          <div className="admin-field">
            <label>Özet</label>
            <textarea value={item.excerpt ?? ''} onChange={(e) => onChange({ ...item, excerpt: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>İçerik (isteğe bağlı)</label>
            <textarea value={item.body ?? ''} onChange={(e) => onChange({ ...item, body: e.target.value })} style={{ minHeight: 120 }} />
          </div>
          <div className="admin-field">
            <label>Görsel URL (isteğe bağlı)</label>
            <input value={item.image_url ?? ''} onChange={(e) => onChange({ ...item, image_url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="admin-checkbox-row">
            <input id="news-published" type="checkbox" checked={item.is_published ?? true} onChange={(e) => onChange({ ...item, is_published: e.target.checked })} />
            <label htmlFor="news-published">Yayında</label>
          </div>
        </div>
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

function EventModal({
  item,
  onChange,
  onSave,
  onClose,
  saving,
  error,
}: {
  item: Partial<EventItem>;
  onChange: (item: Partial<EventItem>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>{item.id ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Etkinlik Adı</label>
            <input value={item.title ?? ''} onChange={(e) => onChange({ ...item, title: e.target.value })} />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Tarih</label>
              <input type="date" value={item.event_date ?? ''} onChange={(e) => onChange({ ...item, event_date: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Saat</label>
              <input value={item.event_time ?? ''} onChange={(e) => onChange({ ...item, event_time: e.target.value })} placeholder="14:00" />
            </div>
          </div>
          <div className="admin-field">
            <label>Mekan</label>
            <input value={item.location ?? ''} onChange={(e) => onChange({ ...item, location: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Açıklama</label>
            <textarea value={item.description ?? ''} onChange={(e) => onChange({ ...item, description: e.target.value })} />
          </div>
          <div className="admin-checkbox-row">
            <input id="event-published" type="checkbox" checked={item.is_published ?? true} onChange={(e) => onChange({ ...item, is_published: e.target.checked })} />
            <label htmlFor="event-published">Yayında</label>
          </div>
        </div>
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
