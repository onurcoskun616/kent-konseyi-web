import { useEffect, useState } from 'react';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchNews, formatNewsDate } from '@/lib/data';
import { fetchBulletins } from '@/lib/data/bulletins';
import type { Bulletin, NewsItem } from '@/lib/supabase';
import { withBase } from '@/lib/url';

export function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const copy = usePageContent('haberler', {
    eyebrow: 'Gündem',
    title: 'Haberler / Bülten',
    description: 'Kent Konseyi’nden duyurular, haberler, bültenler ve aylık gelişmeler.',
  });

  useEffect(() => {
    fetchNews(50).then(setNews);
    fetchBulletins().then(setBulletins);
  }, []);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          {news.length === 0 ? (
            <div className="state-message">Henüz haber eklenmemiş.</div>
          ) : (
            <div className="news-grid news-page-grid">
              {news.map((item) => (
                <article className="news-card red" key={item.id}>
                  <div className="news-meta"><span>{item.category}</span><time>{formatNewsDate(item.published_at)}</time></div>
                  <h3>{item.title}</h3>
                  <p className="news-excerpt">{item.excerpt}</p>
                  <a href={withBase(`/haberler/${item.id}`)} aria-label={item.title}><ArrowRight size={18} /></a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {bulletins.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Yayınlar" title="Aylık ve yıllık bültenler." />
            <div className="document-list">
              {bulletins.map((bulletin) => (
                <a className="document-row" href={bulletin.file_url} target="_blank" rel="noreferrer" key={bulletin.id}>
                  <FileText size={20} />
                  <span><strong>{bulletin.title}</strong><small>{bulletin.period} Bülten · {bulletin.published_at}</small></span>
                  <Download size={17} />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
