import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { BodyText, SectionHeading, toParagraphs, usePageContent } from '@/pages/shared';
import { fetchNews, fetchNewsBySlugOrId, formatNewsDate } from '@/lib/data';
import { fetchBulletins } from '@/lib/data/bulletins';
import { NEWS_CATEGORIES, type Bulletin, type NewsItem } from '@/lib/supabase';
import { withBase } from '@/lib/url';
import { detailPath } from '@/lib/slug';

export function NewsPage({ slug }: { slug?: string }) {
  if (slug) return <NewsDetail slug={slug} />;
  return <NewsList />;
}

function NewsDetail({ slug }: { slug: string }) {
  const [item, setItem] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    setItem(undefined);
    fetchNewsBySlugOrId(slug).then(setItem);
  }, [slug]);

  if (item === undefined) {
    return (
      <PageShell title="Haber" eyebrow="Gündem" description="">
        <section className="section"><div className="container state-message">Yükleniyor…</div></section>
      </PageShell>
    );
  }
  if (item === null) return <NewsList />;

  const paragraphs = toParagraphs(item.body);

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
            <BodyText text={item.body} />
          )}
          <a className="text-link" href={withBase('/haberler')}><ArrowLeft size={16} /> Tüm haberler</a>
        </div>
      </section>
    </PageShell>
  );
}

// Brifteki ayrım: tüm haberler, meclis haberleri, komisyon haberleri ve
// kategori bazlı (duyuru, basın bülteni vb.) filtreleme.
type NewsFilter = { kind: 'all' } | { kind: 'category'; value: string } | { kind: 'council' } | { kind: 'commission' };

function matchesFilter(item: NewsItem, filter: NewsFilter): boolean {
  if (filter.kind === 'all') return true;
  if (filter.kind === 'council') return item.council_id !== null;
  if (filter.kind === 'commission') return item.commission_id !== null;
  return item.category === filter.value;
}

function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [filter, setFilter] = useState<NewsFilter>({ kind: 'all' });
  const copy = usePageContent('haberler', {
    eyebrow: 'Gündem',
    title: 'Haberler ve Bülten',
    description: 'Kent Konseyi’nden duyurular, haberler, bültenler ve aylık gelişmeler.',
  });

  useEffect(() => {
    fetchNews(50).then(setNews);
    fetchBulletins().then(setBulletins);
  }, []);

  const visible = news.filter((item) => matchesFilter(item, filter));

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <div className="tab-row">
            <button className={`tab-button ${filter.kind === 'all' ? 'active' : ''}`} onClick={() => setFilter({ kind: 'all' })}>
              Tüm haberler
            </button>
            <button className={`tab-button ${filter.kind === 'council' ? 'active' : ''}`} onClick={() => setFilter({ kind: 'council' })}>
              Meclis haberleri
            </button>
            <button className={`tab-button ${filter.kind === 'commission' ? 'active' : ''}`} onClick={() => setFilter({ kind: 'commission' })}>
              Komisyon haberleri
            </button>
            {NEWS_CATEGORIES.map((category) => (
              <button
                className={`tab-button ${filter.kind === 'category' && filter.value === category ? 'active' : ''}`}
                onClick={() => setFilter({ kind: 'category', value: category })}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="state-message">
              {news.length === 0 ? 'Henüz haber eklenmemiş.' : 'Bu seçime uyan haber yok.'}
            </div>
          ) : (
            <div className="news-grid news-page-grid">
              {visible.map((item) => (
                <article className="news-card red" key={item.id}>
                  <div className="news-meta"><span>{item.category}</span><time>{formatNewsDate(item.published_at)}</time></div>
                  <h3>{item.title}</h3>
                  <p className="news-excerpt">{item.excerpt}</p>
                  <a href={withBase(detailPath('/haberler', item))} aria-label={item.title}><ArrowRight size={18} /></a>
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
