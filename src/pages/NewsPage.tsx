import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchNews, fetchNewsById, formatNewsDate } from '@/lib/data';
import { fetchBulletins } from '@/lib/data/bulletins';
import type { Bulletin, NewsItem } from '@/lib/supabase';
import { withBase } from '@/lib/url';

export function NewsPage({ id }: { id?: string }) {
  if (id) return <NewsDetail id={id} />;
  return <NewsList />;
}

function NewsDetail({ id }: { id: string }) {
  const [item, setItem] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    setItem(undefined);
    fetchNewsById(id).then(setItem);
  }, [id]);

  if (item === undefined) {
    return (
      <PageShell title="Haber" eyebrow="Gündem" description="">
        <section className="section"><div className="container state-message">Yükleniyor…</div></section>
      </PageShell>
    );
  }
  if (item === null) return <NewsList />;

  const paragraphs = (item.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell title={item.title} eyebrow={item.category} description={item.excerpt}>
      {item.image_url && (
        <section className="cover-hero"><img src={item.image_url} alt={item.title} /></section>
      )}

      <section className="section">
        <div className="container article-body">
          <div className="article-meta">
            <span>{item.category}</span>
            <time>{formatNewsDate(item.published_at)}</time>
          </div>
          {paragraphs.length === 0 ? (
            <p className="body-copy">{item.excerpt}</p>
          ) : (
            paragraphs.map((text) => <p className="body-copy" key={text}>{text}</p>)
          )}
          <a className="text-link" href={withBase('/haberler')}><ArrowLeft size={16} /> Tüm haberler</a>
        </div>
      </section>
    </PageShell>
  );
}

function NewsList() {
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
