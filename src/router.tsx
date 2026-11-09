import { useEffect, useState } from 'react';
import { Admin } from '@/pages/Admin';
import { HomePage } from '@/pages/HomePage';
import { InstitutionalPage } from '@/pages/InstitutionalPage';
import { CouncilsPage } from '@/pages/CouncilsPage';
import { CommissionsPage } from '@/pages/CommissionsPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { NewsPage } from '@/pages/NewsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { ContactPage } from '@/pages/ContactPage';

// Kaldırılan sayfaların eski adresleri. Daha önce paylaşılmış veya yer
// imine eklenmiş bağlantılar boşa düşmesin diye yenisine yönlendiriliyor.
const ESKI_ADRESLER: Record<string, string> = {
  '/kurumsal/hakkimizda': '/kurumsal/kent-konseyi-hakkinda',
};

function getRoute(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = window.location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  path = path.replace(/\/$/, '');
  return path === '' ? '/' : path;
}

/** Eski adresi yenisiyle değiştirir; adres çubuğu da güncellenir. */
function yonlendir(route: string): string {
  const yeni = ESKI_ADRESLER[route];
  if (!yeni) return route;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  window.history.replaceState({}, '', base + yeni);
  return yeni;
}

export function Router() {
  const [route, setRoute] = useState(() => yonlendir(getRoute()));

  useEffect(() => {
    const onPop = () => setRoute(yonlendir(getRoute()));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route.startsWith('/yonetim')) return <Admin />;
  if (route === '/') return <HomePage />;
  if (route === '/kurumsal') return <InstitutionalPage />;
  if (route.startsWith('/kurumsal/')) return <InstitutionalPage slug={route.split('/')[2]} />;
  if (route === '/meclisler') return <CouncilsPage />;
  if (route.startsWith('/meclisler/')) return <CouncilsPage slug={route.split('/')[2]} />;
  if (route === '/komisyonlar') return <CommissionsPage />;
  if (route.startsWith('/komisyonlar/')) return <CommissionsPage slug={route.split('/')[2]} />;
  if (route === '/projeler') return <ProjectsPage />;
  if (route.startsWith('/projeler/')) return <ProjectsPage slug={route.split('/')[2]} />;
  if (route === '/haberler') return <NewsPage />;
  if (route.startsWith('/haberler/')) return <NewsPage slug={route.split('/')[2]} />;
  if (route === '/belgeler') return <DocumentsPage />;
  if (route === '/takvim') return <CalendarPage />;
  if (route.startsWith('/takvim/')) return <CalendarPage slug={route.split('/')[2]} />;
  if (route === '/galeri') return <GalleryPage />;
  if (route === '/videolar') return <GalleryPage type="video" />;
  if (route === '/iletisim') return <ContactPage />;
  return <HomePage />;
}
