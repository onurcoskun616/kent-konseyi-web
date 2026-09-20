import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchProjects, fetchProjectById } from '@/lib/data/projects';
import { fetchCouncilById } from '@/lib/data/councils';
import { fetchCommissionById } from '@/lib/data/commissions';
import { fetchNewsByCouncil, fetchNewsByCommission, formatNewsDate, formatDateRange } from '@/lib/data';
import { PROJECT_CATEGORIES, type Commission, type Council, type NewsItem, type Project } from '@/lib/supabase';
import { withBase } from '@/lib/url';

export function ProjectsPage({ id }: { id?: string }) {
  if (id) return <ProjectDetail id={id} />;
  return <ProjectsList />;
}

function ProjectDetail({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [owner, setOwner] = useState<{ label: string; name: string; href: string } | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setProject(undefined);
    setOwner(null);
    setNews([]);
    fetchProjectById(id).then((found) => {
      setProject(found);
      if (!found) return;
      if (found.council_id) {
        fetchCouncilById(found.council_id).then((c: Council | null) => {
          if (c) setOwner({ label: 'Yürütücü meclis', name: c.name, href: `/meclisler/${c.slug}` });
        });
        fetchNewsByCouncil(found.council_id, 3).then(setNews);
      } else if (found.commission_id) {
        fetchCommissionById(found.commission_id).then((c: Commission | null) => {
          if (c) setOwner({ label: 'Yürütücü komisyon', name: c.name, href: `/komisyonlar/${c.slug}` });
        });
        fetchNewsByCommission(found.commission_id, 3).then(setNews);
      }
    });
  }, [id]);

  if (project === undefined) {
    return (
      <PageShell title="Proje" eyebrow="Projeler" description="">
        <section className="section"><div className="container state-message">Yükleniyor…</div></section>
      </PageShell>
    );
  }
  if (project === null) return <ProjectsList />;

  const tarih = formatDateRange(project.start_date, project.end_date);
  const paragraphs = (project.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell title={project.title} eyebrow={project.category} description={project.description}>
      {project.cover_image_url && (
        <section className="cover-hero"><img src={project.cover_image_url} alt={project.title} /></section>
      )}

      <section className="section">
        <div className="container article-body">
          <div className="article-meta">
            <span>{project.category}</span>
            {tarih && <time>{tarih}</time>}
          </div>

          {owner && (
            <p className="body-copy" style={{ marginBottom: 26 }}>
              {owner.label}: <a className="text-link" href={withBase(owner.href)}>{owner.name} <ArrowRight size={15} /></a>
            </p>
          )}

          {paragraphs.length === 0 ? (
            <p className="body-copy">{project.description}</p>
          ) : (
            paragraphs.map((text) => <p className="body-copy" key={text}>{text}</p>)
          )}

          <a className="text-link" href={withBase('/projeler')}><ArrowLeft size={16} /> Tüm projeler</a>
        </div>
      </section>

      {news.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Gündem" title="İlgili haberler." />
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
    </PageShell>
  );
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const copy = usePageContent('projeler', {
    eyebrow: 'Üretim alanlarımız',
    title: 'Projeler ve Faaliyetler',
    description: 'Kentimiz için geliştirdiğimiz projeler, faaliyetler ve ortak çalışmalar.',
    heading: 'Fikirden faaliyete.',
    body: 'Kent Konseyi’nin meclis ve komisyonlarıyla birlikte yürüttüğü çalışmaları inceleyin.',
  });

  useEffect(() => {
    fetchProjects().then((data) => { setProjects(data); setLoading(false); });
  }, []);

  const visible = activeCategory ? projects.filter((p) => p.category === activeCategory) : projects;

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Projeler" title={copy.heading ?? ''} text={copy.body} />

          <div className="tab-row">
            <button className={`tab-button ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>Tümü</button>
            {PROJECT_CATEGORIES.map((category) => (
              <button className={`tab-button ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} key={category}>{category}</button>
            ))}
          </div>

          {loading ? (
            <div className="state-message">Yükleniyor…</div>
          ) : visible.length === 0 ? (
            <div className="state-message">Bu kategoride henüz proje eklenmemiş.</div>
          ) : (
            <div className="project-grid">
              {visible.map((project) => (
                <article className="project-card" key={project.id}>
                  <span>{formatDateRange(project.start_date, project.end_date) || project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <a href={withBase(`/projeler/${project.id}`)} className="text-link">Projeyi incele <ArrowRight size={16} /></a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
