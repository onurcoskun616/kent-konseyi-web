import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading } from '@/pages/shared';
import { fetchGalleryItems } from '@/lib/data/gallery';
import type { GalleryItem } from '@/lib/supabase';

export function GalleryPage({ type = 'gallery' }: { type?: 'gallery' | 'video' }) {
  const video = type === 'video';
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetchGalleryItems(video ? 'video' : 'photo').then(setItems);
  }, [video]);

  return (
    <PageShell
      title={video ? 'Video Arşivi' : 'Fotoğraf Galerisi'}
      eyebrow="Arşiv"
      description={video ? 'Kent Konseyi çalışmalarından video kayıtları.' : 'Birlikte ürettiğimiz anlardan kareler.'}
    >
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={video ? 'Video' : 'Galeri'} title={video ? 'Çalışmalarımızdan görüntüler.' : 'Birlikte ürettiğimiz anlar.'} />
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
