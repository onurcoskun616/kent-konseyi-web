import { useEffect, useState } from 'react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, EventRow } from '@/pages/shared';
import { fetchEvents } from '@/lib/data';
import type { EventItem } from '@/lib/supabase';

export function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => { fetchEvents(50).then(setEvents); }, []);

  return (
    <PageShell title="Etkinlik Takvimi" eyebrow="Takvim" description="Toplantılar, çalıştaylar, meclis buluşmaları ve kent etkinlikleri.">
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Yaklaşan etkinlikler" title="Takviminize ekleyin." text="Kent Konseyi’nin yaklaşan tüm etkinliklerini burada bulabilirsiniz." />
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
