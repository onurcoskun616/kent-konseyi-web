import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, EventRow, usePageContent } from '@/pages/shared';
import { fetchEvents, fetchEventBySlugOrId, formatEventDate } from '@/lib/data';
import { fetchCouncilById } from '@/lib/data/councils';
import { fetchCommissionById } from '@/lib/data/commissions';
import { EVENT_CATEGORIES, type EventItem } from '@/lib/supabase';
import { withBase } from '@/lib/url';
import { detailPath } from '@/lib/slug';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function CalendarPage({ slug }: { slug?: string }) {
  if (slug) return <EventDetail slug={slug} />;
  return <CalendarView />;
}

function EventDetail({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined);
  const [owner, setOwner] = useState<{ label: string; name: string; href: string } | null>(null);

  useEffect(() => {
    setEvent(undefined);
    setOwner(null);
    fetchEventBySlugOrId(slug).then((found) => {
      setEvent(found);
      if (!found) return;
      if (found.council_id) {
        fetchCouncilById(found.council_id).then((c) => {
          if (c) setOwner({ label: 'Düzenleyen meclis', name: c.name, href: `/meclisler/${c.slug}` });
        });
      } else if (found.commission_id) {
        fetchCommissionById(found.commission_id).then((c) => {
          if (c) setOwner({ label: 'Düzenleyen komisyon', name: c.name, href: `/komisyonlar/${c.slug}` });
        });
      }
    });
  }, [slug]);

  if (event === undefined) {
    return (
      <PageShell title="Etkinlik" eyebrow="Takvim" description="">
        <section className="section"><div className="container state-message">Yükleniyor…</div></section>
      </PageShell>
    );
  }
  if (event === null) return <CalendarView />;

  return (
    <PageShell title={event.title} eyebrow={event.category} description={event.description}>
      <section className="section">
        <div className="container article-body">
          <div className="event-facts">
            <div><CalendarDays size={17} /><span>{formatEventDate(event.event_date)}{event.event_time ? ` · ${event.event_time}` : ''}</span></div>
            {event.location && <div><MapPin size={17} /><span>{event.location}</span></div>}
          </div>

          {owner && (
            <p className="body-copy">
              {owner.label}: <a className="text-link" href={withBase(owner.href)}>{owner.name} <ArrowRight size={15} /></a>
            </p>
          )}

          <p className="body-copy">{event.description}</p>

          <div className="detail-actions">
            <a className="button button-dark" href={withBase('/iletisim')}>Başvuru ve bilgi <ArrowRight size={16} /></a>
            <a className="text-link" href={withBase('/takvim')}><ArrowLeft size={16} /> Takvime dön</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CalendarView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'liste' | 'ay'>('liste');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => new Date());

  const copy = usePageContent('takvim', {
    eyebrow: 'Takvim',
    title: 'Etkinlik Takvimi',
    description: 'Toplantılar, çalıştaylar, meclis buluşmaları ve kent etkinlikleri.',
    heading: 'Takviminize ekleyin.',
    body: 'Kent Konseyi’nin yaklaşan tüm etkinliklerini burada bulabilirsiniz.',
  });

  useEffect(() => {
    fetchEvents(200).then((data) => { setEvents(data); setLoading(false); });
  }, []);

  const visible = useMemo(
    () => (activeCategory ? events.filter((e) => e.category === activeCategory) : events),
    [events, activeCategory],
  );

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Yaklaşan etkinlikler" title={copy.heading ?? ''} text={copy.body} />

          <div className="tab-row">
            <button className={`tab-button ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>Tümü</button>
            {EVENT_CATEGORIES.map((category) => (
              <button className={`tab-button ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} key={category}>{category}</button>
            ))}
          </div>

          <div className="calendar-toolbar">
            <div className="view-switch">
              <button className={view === 'liste' ? 'active' : ''} onClick={() => setView('liste')}>Liste</button>
              <button className={view === 'ay' ? 'active' : ''} onClick={() => setView('ay')}>Aylık</button>
            </div>
            {view === 'ay' && (
              <div className="month-nav">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Önceki ay"><ChevronLeft size={17} /></button>
                <strong>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</strong>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Sonraki ay"><ChevronRight size={17} /></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="state-message">Yükleniyor…</div>
          ) : view === 'ay' ? (
            <MonthGrid cursor={cursor} events={visible} />
          ) : visible.length === 0 ? (
            <div className="state-message">Bu kategoride etkinlik yok.</div>
          ) : (
            <div className="events-list">{visible.map((item) => <EventRow item={item} key={item.id} />)}</div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function MonthGrid({ cursor, events }: { cursor: Date; events: EventItem[] }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Hafta pazartesi başlar: JS'te 0 = Pazar olduğu için kaydırıyoruz.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date().toISOString().slice(0, 10);

  const byDay = new Map<string, EventItem[]>();
  for (const event of events) {
    const key = event.event_date.slice(0, 10);
    const list = byDay.get(key);
    if (list) list.push(event);
    else byDay.set(key, [event]);
  }

  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(<div className="calendar-day is-empty" key={`bos-${i}`} />);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = byDay.get(key) ?? [];
    cells.push(
      <div className={`calendar-day ${key === today ? 'is-today' : ''}`} key={key}>
        <span className="calendar-day-number">{day}</span>
        {dayEvents.map((event) => (
          <a className="calendar-event" href={withBase(detailPath('/takvim', event))} title={event.title} key={event.id}>
            {event.event_time && <small>{event.event_time}</small>}
            {event.title}
          </a>
        ))}
      </div>,
    );
  }

  // Son hafta eksik kalmasın diye kalan günler boş hücreyle tamamlanır.
  const trailingBlanks = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailingBlanks; i += 1) cells.push(<div className="calendar-day is-empty" key={`son-${i}`} />);

  return (
    <div className="calendar-grid">
      {WEEKDAYS.map((weekday) => <div className="calendar-weekday" key={weekday}>{weekday}</div>)}
      {cells}
    </div>
  );
}
