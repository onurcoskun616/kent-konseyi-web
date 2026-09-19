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
  council_id: string | null;
  commission_id: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string;
  category: string;
  is_published: boolean;
  council_id: string | null;
  commission_id: string | null;
  created_at: string;
};

export type Council = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  cover_image_url: string | null;
  about: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type CouncilMember = {
  id: string;
  council_id: string;
  name: string;
  role: string;
  photo_url: string | null;
  display_order: number;
  created_at: string;
};

export type Commission = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  cover_image_url: string | null;
  about: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type CommissionMember = {
  id: string;
  commission_id: string;
  name: string;
  role: string;
  photo_url: string | null;
  display_order: number;
  created_at: string;
};

export const PROJECT_CATEGORIES = [
  'Devam Eden',
  'Tamamlanan',
  'Sosyal Sorumluluk',
  'Eğitim',
  'Kültür-Sanat',
  'Uluslararası',
] as const;

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  body: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  council_id: string | null;
  commission_id: string | null;
  is_published: boolean;
  created_at: string;
};

export const DOCUMENT_CATEGORIES = [
  'Karar',
  'Rapor',
  'Tutanak',
  'Form',
  'Yönetmelik',
  'Stratejik Plan',
] as const;

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  description: string | null;
  published_at: string;
  council_id: string | null;
  commission_id: string | null;
  is_published: boolean;
  created_at: string;
};

export const BULLETIN_PERIODS = ['Aylık', 'Yıllık'] as const;

export type Bulletin = {
  id: string;
  title: string;
  period: string;
  file_url: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
};

export const GALLERY_CATEGORIES = [
  'Genel Kurul',
  'Yürütme Kurulu',
  'Meclisler',
  'Komisyonlar',
  'Eğitimler',
  'Projeler',
  'Sergiler',
  'Genel',
] as const;

export type GalleryItem = {
  id: string;
  title: string | null;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  category: string;
  council_id: string | null;
  commission_id: string | null;
  is_published: boolean;
  created_at: string;
};

export const CONTACT_SUBMISSION_TYPES = [
  'Fikrimi paylaşmak istiyorum',
  'Gönüllü olmak istiyorum',
  'Meclise katılmak istiyorum',
  'Komisyona katılmak istiyorum',
  'Bilgi almak istiyorum',
] as const;

export const CONTACT_SUBMISSION_STATUSES = ['Yeni', 'İncelendi', 'Yanıtlandı'] as const;

export type ContactSubmission = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  council_id: string | null;
  commission_id: string | null;
  status: string;
  created_at: string;
};
