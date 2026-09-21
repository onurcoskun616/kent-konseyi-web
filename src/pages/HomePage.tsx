import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteLayout } from '@/components/SiteLayout';
import { HeroSlider } from '@/components/HeroSlider';
import { SectionHeading, LinkCard, EventRow, usePageContent, useDocumentMeta } from '@/pages/shared';
import { withBase } from '@/lib/url';
import { fetchEvents, fetchNews, formatNewsDate } from '@/lib/data';
import { fetchCouncils, fetchCouncilMembersCount } from '@/lib/data/councils';
import { fetchCommissions, fetchCommissionMembersCount } from '@/lib/data/commissions';
import { fetchProjects } from '@/lib/data/projects';
import { fetchGalleryItems } from '@/lib/data/gallery';
import type { EventItem, GalleryItem, NewsItem } from '@/lib/supabase';
import { detailPath } from '@/lib/slug';

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

  const hero = usePageContent('ana-sayfa-hero', {
    eyebrow: 'Ortak aklın, ortak geleceğin adresi',
    title: 'Birlikte daha güçlü bir kent.',
    description: 'Küçükçekmece için fikri, emeği ve umudu olan herkesin buluşma noktasıyız.',
    heading: 'Yaşayan bir kent',
    body: 'Hep birlikte üretiyoruz.',
  });
  const presidentMessage = usePageContent('ana-sayfa-baskan-mesaji', {
    eyebrow: 'Başkan Mesajı',
    title: '',
    // Alıntı kartındaki cümle. Panelden boş bırakılırsa bu metin çizilir.
    description: 'Bu kentte yaşayan herkesin fikri, emeği ve hayali bizim için değerli.',
    heading: 'Kentin geleceğinde sözümüz var.',
    body: 'Küçükçekmece’yi ortak akılla, katılımcı demokrasiyle ve birlikte üretme kültürüyle geleceğe taşıyoruz.',
  });
  // Alıntı kartındaki başkan fotoğrafı, Kurumsal → Başkan Mesajı kaydından
  // okunuyor. Ana sayfa bölümüne ayrı bir fotoğraf alanı açılmadı; aynı
  // fotoğrafın iki ayrı yere yüklenmesi hem iş hem de ikisinin birbirinden
  // kopma riski demekti.
  const presidentPage = usePageContent('kurumsal-baskan-mesaji', {
    eyebrow: '', title: '', description: '', image_url: null,
  });
  const quickAccess = usePageContent('ana-sayfa-hizli-erisim', {
    eyebrow: 'Hızlı Erişim', title: '', description: '',
    heading: 'Aradığınız bilgiye kolayca ulaşın.',
  });
  const newsSection = usePageContent('ana-sayfa-haberler', {
    eyebrow: 'Gündemden', title: '', description: '', heading: 'Son haberler',
  });
  const eventsSection = usePageContent('ana-sayfa-etkinlikler', {
    eyebrow: 'Takvim', title: '', description: '', heading: 'Yaklaşan etkinlikler',
  });
  const gallerySection = usePageContent('ana-sayfa-galeri', {
    eyebrow: 'Galeri', title: '', description: '', heading: 'Birlikte üretiyoruz.',
  });

  useEffect(() => {
    Promise.all([
      fetchNews(6),
      fetchEvents(3, true),
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

  useDocumentMeta(null, hero.description);

  const galleryImages = gallery.length > 0 ? gallery.map((g) => g.media_url) : fallbackGallery;

  return (
    <SiteLayout>
      <main>
        <HeroSlider fallback={hero} />

        <section className="section home-intro">
          <div className="container home-intro-grid">
            <div>
              <SectionHeading eyebrow={presidentMessage.eyebrow} title={presidentMessage.heading ?? ''} text={presidentMessage.body} />
              <a className="text-link" href={withBase('/kurumsal/baskan-mesaji')}>Devamını Oku <ArrowRight size={16} /></a>
            </div>
            <div className="message-card">
              <span className="quote-mark">“</span>
              <p>{presidentMessage.description}</p>
              <div className="message-author">
                {presidentPage.image_url && <img src={presidentPage.image_url} alt={presidentMessage.title || 'Kent Konseyi Başkanı'} loading="lazy" />}
                {/* Ad soyad panelden girilmemişse yalnızca unvan yazılıyor. */}
                {presidentMessage.title && <strong>{presidentMessage.title}</strong>}
                <small>Kent Konseyi Başkanı</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section quick-section">
          <div className="container">
            <SectionHeading eyebrow={quickAccess.eyebrow} title={quickAccess.heading ?? ''} />
            <div className="quick-grid">
              <LinkCard title="Meclisler" text="Kentin farklı sesleriyle tanışın." href={withBase('/meclisler')} />
              <LinkCard title="Komisyonlar" text="Çalışma alanlarımızı keşfedin." href={withBase('/komisyonlar')} />
              <LinkCard title="Takvim" text="Yaklaşan buluşmaları görün." href={withBase('/takvim')} />
              <LinkCard title="Belgeler" text="Tüzük, rapor ve karar arşivi." href={withBase('/belgeler')} />
              <LinkCard title="Galeri" text="Etkinlik fotoğraflarını inceleyin." href={withBase('/galeri')} />
              <LinkCard title="Katılım Başvuruları" text="Meclis veya komisyonlara katılın." href={withBase('/iletisim')} />
            </div>
          </div>
        </section>

        <section className="section home-news">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow={newsSection.eyebrow} title={newsSection.heading ?? ''} />
              <a className="text-link" href={withBase('/haberler')}>Tüm haberler <ArrowRight size={16} /></a>
            </div>
            {news.length === 0 ? (
              <div className="state-message">Henüz haber eklenmemiş.</div>
            ) : (
              <div className="news-grid">
                {news.map((item) => (
                  <article className="news-card red has-image" key={item.id}>
                    {item.image_url && <div className="news-card-image" style={{ backgroundImage: `url(${item.image_url})` }} />}
                    <div className="news-card-body">
                      <div className="news-meta"><span>{item.category}</span><time>{formatNewsDate(item.published_at)}</time></div>
                      <h3>{item.title}</h3>
                      <p className="news-excerpt">{item.excerpt}</p>
                    </div>
                    <a href={withBase(detailPath('/haberler', item))} aria-label={item.title}><ArrowRight size={18} /></a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section home-events">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow={eventsSection.eyebrow} title={eventsSection.heading ?? ''} />
              <a className="text-link" href={withBase('/takvim')}>Takvimi gör <ArrowRight size={16} /></a>
            </div>
            {events.length === 0 ? (
              <div className="state-message">Yaklaşan etkinlik yok.</div>
            ) : (
              <div className="events-list">{events.map((item) => <EventRow item={item} key={item.id} />)}</div>
            )}
          </div>
        </section>

        <StatBand stats={stats} />

        <section className="section gallery-preview">
          <div className="container">
            <div className="section-topline">
              <SectionHeading eyebrow={gallerySection.eyebrow} title={gallerySection.heading ?? ''} />
              <a className="text-link" href={withBase('/galeri')}>Galeriyi gör <ArrowRight size={16} /></a>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <a href={withBase('/galeri')} key={`${image}-${index}`}><img src={image} alt={`Kent Konseyi etkinlik görüntüsü ${index + 1}`} /></a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
