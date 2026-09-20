import { useEffect, useState } from 'react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, EventRow, usePageContent } from '@/pages/shared';
import { fetchEvents } from '@/lib/data';
import type { EventItem } from '@/lib/supabase';

export function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const copy = usePageContent('takvim', {
    eyebrow: 'Takvim',
    title: 'Etkinlik Takvimi',
    description: 'Toplantılar, çalıştaylar, meclis buluşmaları ve kent etkinlikleri.',
    heading: 'Takviminize ekleyin.',
    body: 'Kent Konseyi’nin yaklaşan tüm etkinliklerini burada bulabilirsiniz.',
  });

  useEffect(() => { fetchEvents(50).then(setEvents); }, []);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Yaklaşan etkinlikler" title={copy.heading ?? ''} text={copy.body} />
          {events.length === 0 ? (
            <div className="state-message">Yaklaşan etkinlik yok.</div>
          ) : (
            <div className="events-list">{events.map((item) => <EventRow item={item} key={item.id} />)}</div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
