import { Fragment, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, ExternalLink, Facebook, Instagram, Link as LinkIcon, Linkedin, MapPin, Twitter, Youtube } from 'lucide-react';
import { fetchPageContent } from '@/lib/data/pages';
import { fetchSiteSettings } from '@/lib/data/settings';
import { fetchSocialLinks } from '@/lib/data/socialLinks';
import { externalUrl, withBase } from '@/lib/url';
import type { EventItem, SiteSettings, SocialLink } from '@/lib/supabase';
import { detailPath } from '@/lib/slug';
import { isPastEvent } from '@/lib/data/format';

// Her sayfa geçişinde SiteLayout yeniden bağlandığı için, önbelleğe alınmayan
// site ayarları istek çözülene kadar boş görünüp sonra doluyor ve yanıp sönme
// oluşuyordu. Modül içi değer + localStorage ile doğru içerik ilk render'da hazır.
function createCache<T>(key: string) {
  let value: T | undefined;
  return {
    read(): T | undefined {
      if (value !== undefined) return value;
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          value = JSON.parse(raw) as T;
          return value;
        }
      } catch {
        // localStorage engelliyse önbelleksiz devam et
      }
      return undefined;
    },
    write(next: T) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage engelliyse önbelleksiz devam et
      }
    },
  };
}

const settingsCache = createCache<SiteSettings | null>('kk-site-settings');
const socialCache = createCache<SocialLink[]>('kk-social-links');

export function cacheSiteSettings(settings: SiteSettings | null) {
  settingsCache.write(settings);
}

export function cacheSocialLinks(links: SocialLink[]) {
  socialCache.write(links);
}

export function useSiteSettings(): SiteSettings | null {
  const [settings, setSettings] = useState<SiteSettings | null>(() => settingsCache.read() ?? null);

  useEffect(() => {
    fetchSiteSettings().then((fresh) => {
      cacheSiteSettings(fresh);
      setSettings(fresh);
    });
  }, []);

  return settings;
}

export function useSiteLogo(): string | null {
  return useSiteSettings()?.logo_url ?? null;
}

export function useSocialLinks(): SocialLink[] {
  const [links, setLinks] = useState<SocialLink[]>(() => socialCache.read() ?? []);

  useEffect(() => {
    fetchSocialLinks().then((fresh) => {
      cacheSocialLinks(fresh);
      setLinks(fresh);
    });
  }, []);

  return links;
}

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  x: Twitter,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

export function SocialIcons({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="footer-social">
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] ?? LinkIcon;
        return (
          <a href={link.url} target="_blank" rel="noreferrer noopener" aria-label={link.platform} key={link.id}>
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}

const SITE_NAME = 'Küçükçekmece Kent Konseyi';
const HOME_TITLE = `${SITE_NAME} — Birlikte daha güçlü bir kent`;

// Tek sayfalık uygulama olduğu için gezinmede belge başlığı kendiliğinden
// değişmiyordu; her sayfa kendi başlığını ve açıklamasını yazar.
export function useDocumentMeta(title: string | null, description?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : HOME_TITLE;

    if (!description) return;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [title, description]);
}

export type PageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  heading?: string;
  body?: string;
  image_url?: string | null;
};

export function usePageContent(slug: string, fallback: PageCopy): PageCopy {
  const [copy, setCopy] = useState<PageCopy>(fallback);

  useEffect(() => {
    setCopy(fallback);
    fetchPageContent(slug).then((row) => {
      if (!row) return;
      setCopy({
        eyebrow: row.eyebrow || fallback.eyebrow,
        title: row.title || fallback.title,
        description: row.description || fallback.description,
        heading: row.heading || fallback.heading,
        body: row.body || fallback.body,
        image_url: row.image_url || fallback.image_url,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return copy;
}

/**
 * Panelden girilen serbest metni paragraflara çevirir.
 *
 * Boş satır yeni paragraf açıyor, tek satır sonu ise satır sonu olarak
 * çiziliyor. Önceden tek satır sonları yok sayılıyordu; bu, imza veya adres
 * gibi alt alta yazılan blokları tek satıra yapıştırıyordu.
 */
export function BodyText({ text, className = 'body-copy' }: { text: string | null | undefined; className?: string }) {
  const paragraflar = toParagraphs(text);
  return (
    <>
      {paragraflar.map((paragraf, i) => (
        <p className={className} key={i}>
          {paragraf.split('\n').map((satir, j, hepsi) => (
            <Fragment key={j}>{satir}{j < hepsi.length - 1 && <br />}</Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

/** Metinde gösterilecek paragraf var mı diye bakmak için. */
export function toParagraphs(text: string | null | undefined): string[] {
  return (text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="content-heading">
      <div className="eyebrow"><span /> {eyebrow}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function LinkCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <a className="link-card" href={href}>
      <div><h3>{title}</h3><p>{text}</p></div>
      <ArrowRight size={18} />
    </a>
  );
}

export function EventRow({ item }: { item: EventItem }) {
  const date = new Date(item.event_date);
  const kayitAdresi = externalUrl(item.registration_url);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return (
    <article className="event-row">
      <div className="event-date"><span className="event-day">{date.getDate()}</span><span className="event-month">{months[date.getMonth()]}</span></div>
      <div className="event-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="event-meta">
          {item.event_time && <span><CalendarDays size={14} /> {item.event_time}</span>}
          {item.location && <span><MapPin size={14} /> {item.location}</span>}
          {item.category && <span>{item.category}</span>}
          {/* Başvurusu açık etkinliklerde kayıt adresi listeden de
              erişilebilir olsun diye burada; geçmiş etkinlikte gizleniyor. */}
          {kayitAdresi && !isPastEvent(item.event_date) && (
            <a className="event-apply" href={kayitAdresi} target="_blank" rel="noreferrer">
              Başvur <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
      <a className="event-detail-link" href={withBase(detailPath('/takvim', item))} aria-label={`${item.title} — detay ve başvuru`}>
        <ArrowRight size={16} />
      </a>
    </article>
  );
}
