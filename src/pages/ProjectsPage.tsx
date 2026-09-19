import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchProjects } from '@/lib/data/projects';
import { PROJECT_CATEGORIES, type Project } from '@/lib/supabase';
import { withBase } from '@/lib/url';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const copy = usePageContent('projeler', {
    eyebrow: 'Üretim alanlarımız',
    title: 'Projeler / Faaliyetler',
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
              {visible.map((project, index) => (
                <article className="project-card" key={project.id}>
                  <span>0{index + 1}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <a href={withBase('/iletisim')} className="text-link">Projeyi incele <ArrowRight size={16} /></a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
