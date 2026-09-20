import { useState } from 'react';
import { ArrowRight, Bell, ChevronDown, Instagram, Mail, MapPin, Menu, Search, X, Youtube } from 'lucide-react';
import { withBase } from '@/lib/url';
import { useSiteLogo } from '@/pages/shared';

export type NavGroup = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const navGroups: NavGroup[] = [
  { label: 'Ana Sayfa', href: '/' },
  {
    label: 'Kurumsal', href: '/kurumsal', children: [
      { label: 'Hakkımızda', href: '/kurumsal/hakkimizda' },
      { label: 'Küçükçekmece Kent Konseyi Hakkında', href: '/kurumsal/kent-konseyi-hakkinda' },
      { label: 'Başkanın Mesajı', href: '/kurumsal/baskan-mesaji' },
      { label: 'Genel Kurul', href: '/kurumsal/genel-kurul' },
      { label: 'Yürütme Kurulu', href: '/kurumsal/yurutme-kurulu' },
      { label: 'Kurullar', href: '/kurumsal/kurullar' },
      { label: 'Tüzük', href: '/kurumsal/tuzuk' },
      { label: 'Yönetmelikler', href: '/kurumsal/yonetmelikler' },
      { label: 'KVKK', href: '/kurumsal/kvkk' },
    ],
  },
  {
    label: 'Meclisler', href: '/meclisler', children: [
      { label: 'Gençlik Meclisi', href: '/meclisler/genclik' },
      { label: 'Kadın Meclisi', href: '/meclisler/kadin' },
      { label: 'Öğrenci Meclisi', href: '/meclisler/ogrenci' },
      { label: 'Engelli Meclisi', href: '/meclisler/engelli' },
    ],
  },
  {
    label: 'Komisyonlar', href: '/komisyonlar', children: [
      { label: 'Gençlik ve Spor', href: '/komisyonlar/genclik-spor' },
      { label: 'Halkla İlişkiler, Tanıtım ve İletişim', href: '/komisyonlar/halkla-iliskiler' },
      { label: 'Afet Farkındalık ve Kentsel Dönüşüm', href: '/komisyonlar/afet-kentsel-donusum' },
      { label: 'Ekonomi', href: '/komisyonlar/ekonomi' },
      { label: 'Eğitim', href: '/komisyonlar/egitim' },
      { label: 'Çevre ve Sağlık', href: '/komisyonlar/cevre-saglik' },
      { label: 'Sanat', href: '/komisyonlar/sanat-kultur' },
      { label: 'Muhtarlar', href: '/komisyonlar/muhtarlar' },
    ],
  },
  { label: 'Projeler ve Faaliyetler', href: '/projeler' },
  { label: 'Haberler ve Bülten', href: '/haberler' },
  { label: 'Belgeler', href: '/belgeler' },
  { label: 'Takvim', href: '/takvim' },
  {
    label: 'Galeri', href: '/galeri', children: [
      { label: 'Fotoğraf Galerisi', href: '/galeri' },
      { label: 'Video Arşivi', href: '/videolar' },
    ],
  },
  { label: 'İletişim ve Katılım', href: '/iletisim' },
];

function go(href: string) {
  window.history.pushState({}, '', withBase(href));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const logo = useSiteLogo();

  return (
    <div className="app-shell">
      <div className="topline"><div className="container topline-inner"><span>İstanbul · Küçükçekmece</span><div className="topline-links"><a href="/takvim" onClick={(e) => { e.preventDefault(); go('/takvim'); }}>Etkinlik Takvimi</a><a href="/iletisim" onClick={(e) => { e.preventDefault(); go('/iletisim'); }}>İletişim</a><a href={withBase('/yonetim')}>Yönetim</a></div></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="/" onClick={(e) => { e.preventDefault(); go('/'); close(); }} aria-label="Küçükçekmece Kent Konseyi ana sayfa"><span className="brand-mark">{logo && <img src={logo} alt="" />}</span><span><strong>KÜÇÜKÇEKMECE</strong><small>KENT KONSEYİ</small></span></a>
          <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Ana menü">
            {navGroups.map((group) => group.children ? (
              <details className="nav-dropdown" key={group.label}>
                <summary>{group.label}<ChevronDown size={13} /></summary>
                <div className="dropdown-menu">
                  {!group.children.some((child) => child.href === group.href) && (
                    <a href={group.href} onClick={(e) => { e.preventDefault(); go(group.href); close(); }}>Genel Bakış</a>
                  )}
                  {group.children.map((child) => <a href={child.href} key={child.href} onClick={(e) => { e.preventDefault(); go(child.href); close(); }}>{child.label}</a>)}
                </div>
              </details>
            ) : <a href={group.href} key={group.label} onClick={(e) => { e.preventDefault(); go(group.href); close(); }}>{group.label}</a>)}
          </nav>
          <div className="header-actions"><button className="icon-button" aria-label="Ara"><Search size={19} /></button><a className="header-cta" href="/iletisim" onClick={(e) => { e.preventDefault(); go('/iletisim'); }}>Kent için sözüm var <ArrowRight size={16} /></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menüyü aç veya kapat">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        </div>
      </header>
      {children}
      <SiteFooter logo={logo} />
    </div>
  );
}

function SiteFooter({ logo }: { logo: string | null }) {
  return <footer className="site-footer"><div className="container footer-top"><div><a className="brand footer-brand" href="/" onClick={(e) => { e.preventDefault(); go('/'); }}><span className="brand-mark">{logo && <img src={logo} alt="" />}</span><span><strong>KÜÇÜKÇEKMECE</strong><small>KENT KONSEYİ</small></span></a><p>Ortak akılla, birlikte daha güzel bir kent için.</p></div><div className="footer-contact"><p><MapPin size={17} /> Atatürk Mah. Kent Konseyi Merkezi<br />Küçükçekmece / İstanbul</p><p><Mail size={17} /> info@kucukcekmecekentkonseyi.org</p></div><div className="footer-social"><a href={withBase('/iletisim')} aria-label="Instagram"><Instagram size={18} /></a><a href={withBase('/videolar')} aria-label="Youtube"><Youtube size={18} /></a><a href={withBase('/haberler')} aria-label="Duyurular"><Bell size={18} /></a></div></div><div className="container footer-bottom"><span>© 2026 Küçükçekmece Kent Konseyi</span><div><a href={withBase('/kurumsal/kvkk')}>KVKK</a><a href={withBase('/kurumsal/tuzuk')}>Tüzük</a><a href={withBase('/iletisim')}>İletişim</a></div></div></footer>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-hero"><div className="container page-hero-inner"><div className="eyebrow light"><span /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div></section>;
}

export function PageShell({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) {
  return <SiteLayout><main><PageHero eyebrow={eyebrow} title={title} description={description} />{children}</main></SiteLayout>;
}
