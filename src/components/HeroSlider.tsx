import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { withBase } from '@/lib/url';
import { fetchHeroSlides } from '@/lib/data';
import type { HeroSlide } from '@/lib/supabase';

const AUTOPLAY_MS = 6000;
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/20027734/pexels-photo-20027734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

type HeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
  heading?: string;
  body?: string;
};

export function HeroSlider({ fallback }: { fallback: HeroCopy }) {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetchHeroSlides().then(setSlides);
  }, []);

  const displaySlides = useMemo<HeroSlide[]>(() => {
    if (slides && slides.length > 0) return slides;
    return [
      {
        id: 'fallback',
        image_url: FALLBACK_IMAGE,
        eyebrow: fallback.eyebrow,
        title: fallback.title,
        description: fallback.description,
        button_label: 'Kent için sözüm var',
        button_href: '/iletisim',
        display_order: 0,
        is_published: true,
        created_at: '',
      },
    ];
  }, [slides, fallback]);

  useEffect(() => {
    if (active >= displaySlides.length) setActive(0);
  }, [displaySlides, active]);

  useEffect(() => {
    if (paused || displaySlides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % displaySlides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, displaySlides.length]);

  const current = displaySlides[active] ?? displaySlides[0];

  return (
    <section
      className="hero"
      id="anasayfa"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-image ${index === active ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${slide.image_url})` }}
        />
      ))}
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div className="hero-copy">
          <div className="eyebrow light"><span /> {current.eyebrow ?? fallback.eyebrow}</div>
          <h1>{current.title ?? fallback.title}</h1>
          <p>{current.description ?? fallback.description}</p>
          <div className="hero-actions">
            <a className="button button-light" href={withBase(current.button_href || '/iletisim')}>
              {current.button_label || 'Kent için sözüm var'} <ArrowRight size={17} />
            </a>
            <a className="text-link light-link" href={withBase('/kurumsal/hakkimizda')}>Kent Konseyi nedir? <ArrowRight size={16} /></a>
          </div>
        </div>
        <div className="hero-note"><span>01</span><div><strong>{fallback.heading}</strong><small>{fallback.body}</small></div></div>

        {displaySlides.length > 1 && (
          <div className="hero-dots" role="tablist" aria-label="Slayt gezinme">
            {displaySlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`${index + 1}. slayt`}
                className={index === active ? 'is-active' : ''}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
