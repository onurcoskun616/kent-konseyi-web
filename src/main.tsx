import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './router.tsx';
import { isSupabaseConfigured } from './lib/supabase.ts';
import './index.css';

function ConfigBanner() {
  return (
    <div style={{ background: '#b91016', color: 'white', fontSize: 13, padding: '10px 16px', textAlign: 'center' }}>
      Supabase bağlantı bilgileri eksik (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Site statik içerikle çalışıyor, canlı veriler görünmeyecek.
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {!isSupabaseConfigured && <ConfigBanner />}
    <Router />
  </StrictMode>
);
