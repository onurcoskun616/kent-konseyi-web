import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteLayout } from '@/components/SiteLayout';
import { SectionHeading, LinkCard, EventRow } from '@/pages/shared';
import { fetchEvents, fetchNews, formatNewsDate } from '@/lib/data';
import { fetchCouncils, fetchCouncilMembersCount } from '@/lib/data/councils';
import { fetchCommissions, fetchCommissionMembersCount } from '@/lib/data/commissions';
import { fetchProjects } from '@/lib/data/projects';
import { fetchGalleryItems } from '@/lib/data/gallery';
import type { EventItem, GalleryItem, NewsItem } from '@/lib/supabase';

const heroImage = 'https://images.pexels.com/photos/20027734/pexels-photo-20027734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const fallbackGallery = [
  'https://images.pexels.com/photos/7712023/pexels-photo-7712023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/8416867/pexels-photo-8416867.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/17872545/pexels-photo-17872545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/8518777/pexels-photo-8518777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

type Stats = { councils: number; commissions: number; projects: number; members: number };

function StatBand({ stats }: { stats: Stats | null }) {
  return (
    <section className="stat-band">
      <div className="container stat-grid">
        <div><strong>{stats ? stats.councils : '–'}</strong><span>Aktif meclis</span></div>
        <div><strong>{stats ? stats.commissions : '–'}</strong><span>Çalışma komisyonu</span></div>
        <div><strong>{stats ? stats.projects : '–'}</strong><span>Proje / faaliyet</span></div>
        <div><strong>{stats ? stats.members : '–'}</strong><span>Katılımcı üye</span></div>
      </div>
    </section>
  );
}

export function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetchNews(3),
      fetchEvents(3),
      fetchGalleryItems('photo'),
      fetchCouncils(),
      fetchCommissions(),
      fetchProjects(),
      fetchCouncilMembersCount(),
      fetchCommissionMembersCount(),
    ]).then(([n, e, g, councils, commissions, projects, councilMembers, commissionMembers]) => {
      setNews(n);
      setEvents(e);
      setGallery(g.slice(0, 6));
      setStats({
        councils: councils.length,
        commissions: commissions.length,
        projects: projects.length,
        members: councilMembers + commissionMembers,
      });
    });
  }, []);

  const galleryImages = gallery.length > 0 ? gallery.map((g) => g.media_url) : fallbackGallery;

  return (
    <SiteLayout>
      <main>
        <section className="hero" id="anasayfa">
          <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="eyebrow light"><span /> Ortak aklın, ortak geleceğin adresi</div>
              <h1>Birlikte daha<br /><em>güçlü</em> bir kent.</h1>
              <p>Küçükçekmece için fikri, emeği ve umudu olan herkesin buluşma noktasıyız.</p>
              <div className="hero-actions">
                <a className="button button-light" href="/iletisim">Kent için sözüm var <ArrowRight size={17} /></a>
                <a className="text-link light-link" href="/kurumsal/hakkimizda">Kent Konseyi nedir? <ArrowRight size={16} /></a>
              </div>
            </div>
            <div className="hero-note"><span>01</span><div><strong>Yaşayan bir kent</strong><small>Hep birlikte üretiyoruz.</small></div></div>
          </div>
        </section>

        <section className="welcome-strip">
          <div className="container welcome-grid">
            <div className="eyebrow"><span /> Küçükçekmece Kent Konseyi</div>
            <p>Yaşadığımız kenti birlikte düşünüyor, birlikte tasarlıyor ve birlikte güzelleştiriyoruz.</p>
            <a className="text-link" href="/kurumsal/hakkimizda">Bizi tanıyın <ArrowRight size={16} /></a>
          </div>
        </section>

        <section className="section home-intro">
          <div className="container home-intro-grid">
            <div>
              <SectionHeading eyebrow="Başkan Mesajı" title="Kentin geleceğinde sözümüz var." text="Küçükçekmece’yi ortak akılla, katılımcı demokrasiyle ve birlikte üretme kültürüyle geleceğe taşıyoruz." />
              <a className="text-link" href="/kurumsal/baskan-mesaji">Başkanın mesajını oku <ArrowRight size={16} /></a>
            </div>
            <div className="message-card">
              <span className="quote-mark">“</span>
              <p>Bu kentte yaşayan herkesin fikri, emeği ve hayali bizim için değerli.</p>
              <strong>Kent Konseyi Başkanı</strong>
            </div>
          </div>
        </section>

        <section className="section quick-section">
          <div className="container">
            <SectionHeading eyebrow="Hızlı Erişim" title="Aradığınız bilgiye kolayca ulaşın." />
            <div className="quick-grid">
              <LinkCard title="Meclisler" text="Kentin farklı sesleriyle tanışın." href="/meclisler" />
              <LinkCard title="Komisyonlar" text="Çalışma alanlarımızı keşfedin." href="/komisyonlar" />
              <LinkCard title="Belgeler" text="Tüzük, rapor ve karar arşivi." href="/belgeler" />
              <LinkCard title="Etkinlik Takvimi" text="Yaklaşan buluşmaları görün." href="/takvim" />
            </div>
          </div>
        </section>

        <StatBand stats={stats} />

        <section className="section home-news">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow="Gündemden" title="Son haberler" />
              <a className="text-link" href="/haberler">Tüm haberler <ArrowRight size={16} /></a>
            </div>
            {news.length === 0 ? (
              <div className="state-message">Henüz haber eklenmemiş.</div>
            ) : (
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
            )}
          </div>
        </section>

        <section className="section home-events">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow="Takvim" title="Yaklaşan etkinlikler" />
              <a className="text-link" href="/takvim">Takvimi gör <ArrowRight size={16} /></a>
            </div>
            {events.length === 0 ? (
              <div className="state-message">Yaklaşan etkinlik yok.</div>
            ) : (
              <div className="events-list">{events.map((item) => <EventRow item={item} key={item.id} />)}</div>
            )}
          </div>
        </section>

        <section className="section gallery-preview">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow="Galeri" title="Birlikte üretiyoruz." />
              <a className="text-link" href="/galeri">Galeriyi gör <ArrowRight size={16} /></a>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <a href="/galeri" key={`${image}-${index}`}><img src={image} alt={`Kent Konseyi etkinlik görüntüsü ${index + 1}`} /></a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
