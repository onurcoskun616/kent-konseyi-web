import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase ortam değişkenleri eksik. .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  published_at: string;
  excerpt: string;
  body: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string;
  is_published: boolean;
  created_at: string;
};
