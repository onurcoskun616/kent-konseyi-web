import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchGalleryItems } from '@/lib/data/gallery';
import type { GalleryItem } from '@/lib/supabase';

export function GalleryPage({ type = 'gallery' }: { type?: 'gallery' | 'video' }) {
  const video = type === 'video';
  const [items, setItems] = useState<GalleryItem[]>([]);
  const copy = usePageContent(video ? 'videolar' : 'galeri', video
    ? { eyebrow: 'Arşiv', title: 'Video Arşivi', description: 'Kent Konseyi çalışmalarından video kayıtları.', heading: 'Çalışmalarımızdan görüntüler.' }
    : { eyebrow: 'Arşiv', title: 'Fotoğraf Galerisi', description: 'Birlikte ürettiğimiz anlardan kareler.', heading: 'Birlikte ürettiğimiz anlar.' });

  useEffect(() => {
    fetchGalleryItems(video ? 'video' : 'photo').then(setItems);
  }, [video]);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={video ? 'Video' : 'Galeri'} title={copy.heading ?? ''} text={copy.body} />
          {items.length === 0 ? (
            <div className="state-message">Henüz {video ? 'video' : 'fotoğraf'} eklenmemiş.</div>
          ) : (
            <div className="gallery-grid gallery-page-grid">
              {items.map((item) => (
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
