import { useEffect, useState } from 'react';
import { Admin } from '@/pages/Admin';
import {
  CalendarPage,
  CommissionsPage,
  ContactPage,
  CouncilsPage,
  DocumentsPage,
  GalleryPage,
  HomePage,
  InstitutionalPage,
  NewsPage,
  ProjectsPage,
} from '@/pages/ContentPages';

function getRoute(): string {
  const path = window.location.pathname.replace(/\/$/, '');
  return path === '' ? '/' : path;
}

export function Router() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
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
  if (route === '/haberler' || route.startsWith('/haberler/')) return <NewsPage />;
  if (route === '/belgeler') return <DocumentsPage />;
  if (route === '/takvim') return <CalendarPage />;
  if (route === '/galeri') return <GalleryPage />;
  if (route === '/videolar') return <GalleryPage type="video" />;
  if (route === '/iletisim') return <ContactPage />;
  return <HomePage />;
}
