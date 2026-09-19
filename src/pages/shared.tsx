import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { fetchPageContent } from '@/lib/data/pages';
import type { EventItem } from '@/lib/supabase';

export type PageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  heading?: string;
  body?: string;
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
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return copy;
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
        </div>
      </div>
    </article>
  );
}
