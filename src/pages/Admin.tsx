import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  FileText,
  Inbox,
  Loader2,
  Lock,
  Newspaper,
  Send,
  Image as ImageIcon,
  LayoutTemplate,
  Settings as SettingsIcon,
  SlidersHorizontal,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { withBase } from '@/lib/url';
import { useSiteLogo } from '@/pages/shared';
import defaultLogo from '@/assets/logo.png';
import { fetchSiteSettings } from '@/lib/data/settings';
import { adminFetchAllCouncils } from '@/lib/data/councils';
import { adminFetchAllCommissions } from '@/lib/data/commissions';
import type { Commission, Council } from '@/lib/supabase';
import { NewsTab } from '@/pages/admin/NewsTab';
import { EventsTab } from '@/pages/admin/EventsTab';
import { CouncilsTab } from '@/pages/admin/CouncilsTab';
import { CommissionsTab } from '@/pages/admin/CommissionsTab';
import { ProjectsTab } from '@/pages/admin/ProjectsTab';
import { DocumentsTab } from '@/pages/admin/DocumentsTab';
import { BulletinsTab } from '@/pages/admin/BulletinsTab';
import { GalleryTab } from '@/pages/admin/GalleryTab';
import { SubmissionsTab } from '@/pages/admin/SubmissionsTab';
import { PagesTab } from '@/pages/admin/PagesTab';
import { SettingsTab } from '@/pages/admin/SettingsTab';
import { HeroSlidesTab } from '@/pages/admin/HeroSlidesTab';
import { BoardMembersTab } from '@/pages/admin/BoardMembersTab';

type Tab = 'news' | 'events' | 'councils' | 'commissions' | 'projects' | 'documents' | 'bulletins' | 'gallery' | 'submissions' | 'pages' | 'settings' | 'heroSlides' | 'boardMembers';

const NAV_ITEMS: { tab: Tab; label: string; icon: LucideIcon }[] = [
  { tab: 'pages', label: 'Sayfa İçerikleri', icon: LayoutTemplate },
  { tab: 'heroSlides', label: 'Slider / Hero Alanı', icon: SlidersHorizontal },
  { tab: 'boardMembers', label: 'Yürütme Kurulu', icon: UserCog },
  { tab: 'settings', label: 'Site Ayarları', icon: SettingsIcon },
  { tab: 'news', label: 'Haberler', icon: Newspaper },
  { tab: 'events', label: 'Etkinlikler', icon: CalendarDays },
  { tab: 'councils', label: 'Meclisler', icon: Users },
  { tab: 'commissions', label: 'Komisyonlar', icon: Briefcase },
  { tab: 'projects', label: 'Projeler', icon: Send },
  { tab: 'documents', label: 'Belgeler', icon: FileText },
  { tab: 'bulletins', label: 'Bültenler', icon: FileText },
  { tab: 'gallery', label: 'Galeri', icon: ImageIcon },
  { tab: 'submissions', label: 'Başvurular', icon: Inbox },
];

export function Admin() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<boolean>(false);
  const [tab, setTab] = useState<Tab>('news');
  const [councils, setCouncils] = useState<Council[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [logo, setLogo] = useState(defaultLogo);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
    });
    fetchSiteSettings().then((settings) => {
      if (settings?.logo_url) setLogo(settings.logo_url);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    Promise.all([adminFetchAllCouncils(), adminFetchAllCommissions()]).then(([c, k]) => {
      setCouncils(c);
      setCommissions(k);
    });
  }, [session]);

  async function handleSignIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
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
          <a className="brand" href={withBase('/yonetim')}>
            <span className={logo === defaultLogo ? 'brand-mark' : 'brand-mark is-custom'}><img src={logo} alt="" /></span>
            <span><strong>KÜÇÜKÇEKMECE</strong><small>KENT KONSEYİ</small></span>
          </a>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a className="admin-back-link" href={withBase('/')}><ArrowLeft size={15} /> Siteye dön</a>
            <button className="admin-back-link" onClick={handleSignOut} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>Çıkış</button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <h4>Yönetim</h4>
          {NAV_ITEMS.map(({ tab: itemTab, label, icon: Icon }) => (
            <div className={`admin-nav-item ${tab === itemTab ? 'active' : ''}`} onClick={() => setTab(itemTab)} key={itemTab}>
              <Icon size={17} /> {label}
            </div>
          ))}
        </aside>

        <div className="admin-content">
          {tab === 'pages' && <PagesTab />}
          {tab === 'heroSlides' && <HeroSlidesTab />}
          {tab === 'boardMembers' && <BoardMembersTab />}
          {tab === 'settings' && <SettingsTab currentLogo={logo} onLogoChange={setLogo} />}
          {tab === 'news' && <NewsTab councils={councils} commissions={commissions} />}
          {tab === 'events' && <EventsTab councils={councils} commissions={commissions} />}
          {tab === 'councils' && <CouncilsTab />}
          {tab === 'commissions' && <CommissionsTab />}
          {tab === 'projects' && <ProjectsTab councils={councils} commissions={commissions} />}
          {tab === 'documents' && <DocumentsTab councils={councils} commissions={commissions} />}
          {tab === 'bulletins' && <BulletinsTab />}
          {tab === 'gallery' && <GalleryTab councils={councils} commissions={commissions} />}
          {tab === 'submissions' && <SubmissionsTab />}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const logo = useSiteLogo(defaultLogo);

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
        <a className="brand" href={withBase('/')}>
          <span className={logo === defaultLogo ? 'brand-mark' : 'brand-mark is-custom'}><img src={logo} alt="" /></span>
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
          <a className="admin-back-link" href={withBase('/')}><ArrowLeft size={14} /> Ana sayfaya dön</a>
        </div>
      </div>
    </div>
  );
}
