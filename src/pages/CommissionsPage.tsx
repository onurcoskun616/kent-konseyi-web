import { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchCommissionBySlug, fetchCommissionMembers, fetchCommissions } from '@/lib/data/commissions';
import { fetchNewsByCommission, formatNewsDate } from '@/lib/data';
import { fetchProjectsByCommission } from '@/lib/data/projects';
import { fetchDocumentsByCommission } from '@/lib/data/documents';
import type { Commission, CommissionMember, DocumentItem, NewsItem, Project } from '@/lib/supabase';

export function CommissionsPage({ slug }: { slug?: string }) {
  if (slug) return <CommissionDetail slug={slug} />;
  return <CommissionsList />;
}

function CommissionsList() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = usePageContent('komisyonlar', {
    eyebrow: 'Komisyonlar',
    title: 'Komisyonlar',
    description: 'Kent Konseyi’nin çalışma alanlarına göre oluşturduğu uzmanlık ve üretim grupları.',
    heading: 'Kent için çalışan ekipler.',
    body: 'Komisyonlarımız, kent gündemindeki konulara odaklanır; araştırır, öneri geliştirir ve uygulanabilir çözümler üretir.',
  });

  useEffect(() => {
    fetchCommissions().then((data) => { setCommissions(data); setLoading(false); });
  }, []);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section commissions-section">
        <div className="container">
          <SectionHeading eyebrow="Birlikte üretiyoruz" title={copy.heading ?? ''} text={copy.body} />
          {loading ? (
            <div className="state-message">Yükleniyor…</div>
          ) : commissions.length === 0 ? (
            <div className="state-message">Henüz komisyon eklenmemiş.</div>
          ) : (
            <div className="commission-grid">
              {commissions.map((commission, index) => (
                <div className="commission-card" key={commission.id}>
                  <span className="commission-number">0{index + 1}</span>
                  <div className="commission-icon"><Briefcase size={22} /></div>
                  <h3>{commission.name}</h3>
                  <p>{commission.tagline || commission.about}</p>
                  <a href={`/komisyonlar/${commission.slug}`} aria-label={commission.name}><ArrowRight size={16} /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function CommissionDetail({ slug }: { slug: string }) {
  const [commission, setCommission] = useState<Commission | null | undefined>(undefined);
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    setCommission(undefined);
    fetchCommissionBySlug(slug).then((found) => {
      setCommission(found);
      if (!found) return;
      Promise.all([
        fetchCommissionMembers(found.id),
        fetchProjectsByCommission(found.id),
        fetchNewsByCommission(found.id),
        fetchDocumentsByCommission(found.id),
      ]).then(([m, p, n, d]) => { setMembers(m); setProjects(p); setNews(n); setDocuments(d); });
    });
  }, [slug]);

  if (commission === undefined) {
    return <PageShell title="Komisyon" eyebrow="Komisyonlar" description=""><section className="section"><div className="container state-message">Yükleniyor…</div></section></PageShell>;
  }
  if (commission === null) return <CommissionsList />;

  return (
    <PageShell title={commission.name} eyebrow="Komisyonlar" description={commission.tagline || commission.about}>
      {commission.cover_image_url && (
        <section className="cover-hero"><img src={commission.cover_image_url} alt={commission.name} /></section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Hakkında" title="Çalışma alanımız." text={commission.about} />
        </div>
      </section>

      {members.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Yönetim" title="Komisyon başkanı ve yönetimi." />
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
              {projects.map((project, index) => (
                <article className="project-card" key={project.id}>
                  <span>0{index + 1}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {news.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Gündem" title="Komisyon haberleri." />
            <div className="news-grid">
              {news.map((item) => (
                <article className="news-card red" key={item.id}>
                  <div className="news-meta"><span>{item.category}</span><time>{formatNewsDate(item.published_at)}</time></div>
                  <h3>{item.title}</h3>
                  <p className="news-excerpt">{item.excerpt}</p>
                  <a href={`/haberler/${item.id}`} aria-label={item.title}><ArrowRight size={18} /></a>
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
