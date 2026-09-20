import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchGalleryItems } from '@/lib/data/gallery';
import { GALLERY_CATEGORIES, type GalleryItem } from '@/lib/supabase';

export function GalleryPage({ type = 'gallery' }: { type?: 'gallery' | 'video' }) {
  const video = type === 'video';
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const copy = usePageContent(video ? 'videolar' : 'galeri', video
    ? { eyebrow: 'Arşiv', title: 'Video Arşivi', description: 'Kent Konseyi çalışmalarından video kayıtları.', heading: 'Çalışmalarımızdan görüntüler.' }
    : { eyebrow: 'Arşiv', title: 'Fotoğraf Galerisi', description: 'Birlikte ürettiğimiz anlardan kareler.', heading: 'Birlikte ürettiğimiz anlar.' });

  useEffect(() => {
    setActiveCategory(null);
    fetchGalleryItems(video ? 'video' : 'photo').then(setItems);
  }, [video]);

  const visible = activeCategory ? items.filter((item) => item.category === activeCategory) : items;

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={video ? 'Video' : 'Galeri'} title={copy.heading ?? ''} text={copy.body} />

          <div className="tab-row">
            <button className={`tab-button ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>Tümü</button>
            {GALLERY_CATEGORIES.map((category) => (
              <button className={`tab-button ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} key={category}>{category}</button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="state-message">
              {items.length === 0
                ? `Henüz ${video ? 'video' : 'fotoğraf'} eklenmemiş.`
                : 'Bu kategoride kayıt yok.'}
            </div>
          ) : (
            <div className="gallery-grid gallery-page-grid">
              {visible.map((item) => (
                <a href={item.media_url} target="_blank" rel="noreferrer" className="gallery-tile" key={item.id}>
                  <img src={item.thumbnail_url || item.media_url} alt={item.title || 'Kent Konseyi etkinliği'} />
                  {video && <span className="play-badge"><Play size={15} /></span>}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
