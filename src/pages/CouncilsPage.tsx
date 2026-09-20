import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Users } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, EventRow, usePageContent } from '@/pages/shared';
import { fetchCouncilBySlug, fetchCouncilMembers, fetchCouncils } from '@/lib/data/councils';
import { fetchNewsByCouncil, formatNewsDate, formatDateRange } from '@/lib/data';
import { fetchEventsByCouncil } from '@/lib/data/events';
import { fetchProjectsByCouncil } from '@/lib/data/projects';
import { fetchDocumentsByCouncil } from '@/lib/data/documents';
import type { Council, CouncilMember, DocumentItem, EventItem, NewsItem, Project } from '@/lib/supabase';
import { withBase } from '@/lib/url';

const cardColors = ['', 'green', 'amber', 'blue'];

export function CouncilsPage({ slug }: { slug?: string }) {
  if (slug) return <CouncilDetail slug={slug} />;
  return <CouncilsList />;
}

function CouncilsList() {
  const [councils, setCouncils] = useState<Council[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = usePageContent('meclisler', {
    eyebrow: 'Meclisler',
    title: 'Meclislerimiz',
    description: 'Küçükçekmece’nin farklı seslerinin bir araya geldiği katılım kanalları.',
    heading: 'Kentin farklı sesleri bir arada.',
  });

  useEffect(() => {
    fetchCouncils().then((data) => { setCouncils(data); setLoading(false); });
  }, []);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section councils-section">
        <div className="container">
          <SectionHeading eyebrow="Katılım" title={copy.heading ?? ''} text={copy.body} />
          {loading ? (
            <div className="state-message">Yükleniyor…</div>
          ) : councils.length === 0 ? (
            <div className="state-message">Henüz meclis eklenmemiş.</div>
          ) : (
            <div className="council-grid">
              {councils.map((council, index) => (
                <a className={`council-card ${cardColors[index % cardColors.length]}`} href={withBase(`/meclisler/${council.slug}`)} key={council.id}>
                  <div className="card-icon"><Users size={20} /></div>
                  <h3>{council.name}</h3>
                  <p>{council.tagline || council.about}</p>
                  <ArrowRight className="card-arrow" size={18} />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function CouncilDetail({ slug }: { slug: string }) {
  const [council, setCouncil] = useState<Council | null | undefined>(undefined);
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    setCouncil(undefined);
    fetchCouncilBySlug(slug).then((found) => {
      setCouncil(found);
      if (!found) return;
      Promise.all([
        fetchCouncilMembers(found.id),
        fetchProjectsByCouncil(found.id),
        fetchEventsByCouncil(found.id),
        fetchNewsByCouncil(found.id),
        fetchDocumentsByCouncil(found.id),
      ]).then(([m, p, e, n, d]) => { setMembers(m); setProjects(p); setEvents(e); setNews(n); setDocuments(d); });
    });
  }, [slug]);

  if (council === undefined) {
    return <PageShell title="Meclis" eyebrow="Meclisler" description=""><section className="section"><div className="container state-message">Yükleniyor…</div></section></PageShell>;
  }
  if (council === null) return <CouncilsList />;

  return (
    <PageShell title={council.name} eyebrow="Meclisler" description={council.tagline || council.about}>
      {council.cover_image_url && (
        <section className="cover-hero"><img src={council.cover_image_url} alt={council.name} /></section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Hakkında" title="Sözünüzü birlikte büyütelim." text={council.about} />
          <a className="button button-dark" href={withBase('/iletisim')}>Meclise katıl <ArrowRight size={16} /></a>
        </div>
      </section>

      {members.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Yönetim" title="Başkan ve yönetim." />
            <div className="member-grid">
              {members.map((member) => (
                <div className="member-card" key={member.id}>
                  <div className="member-photo">{member.photo_url && <img src={member.photo_url} alt={member.name} />}</div>
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeading eyebrow="Faaliyetler" title="Yürüttüğümüz çalışmalar." />
          {projects.length === 0 ? (
            <div className="state-message">Henüz faaliyet eklenmemiş.</div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <span>{formatDateRange(project.start_date, project.end_date) || project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {events.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Faaliyet Takvimi" title="Meclisin etkinlik takvimi." />
            <div className="events-list">{events.map((item) => <EventRow item={item} key={item.id} />)}</div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Gündem" title="Meclis haberleri." />
            <div className="news-grid">
              {news.map((item) => (
                <article className="news-card red" key={item.id}>
                  <div className="news-meta"><span>{item.category}</span><time>{formatNewsDate(item.published_at)}</time></div>
                  <h3>{item.title}</h3>
                  <p className="news-excerpt">{item.excerpt}</p>
                  <a href={withBase(`/haberler/${item.id}`)} aria-label={item.title}><ArrowRight size={18} /></a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Arşiv" title="Belgeler." />
            <div className="document-list">
              {documents.map((doc) => (
                <a className="document-row" href={doc.file_url} target="_blank" rel="noreferrer" key={doc.id}>
                  <FileText size={20} />
                  <span><strong>{doc.title}</strong><small>{doc.category} · {doc.published_at}</small></span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
