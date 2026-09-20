import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error('Supabase ortam değişkenleri eksik (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). .env dosyasını veya deploy ortamındaki secret\'ları kontrol edin.');
}

// Site, ortam değişkenleri eksik olsa bile bir blank sayfa yerine düzgün render olabilsin diye
// geçerli biçimli bir placeholder URL'e düşer; bu durumda tüm veri çağrıları zaten hatayı
// yakalayıp boş sonuç döndürecek şekilde tasarlandı (bkz. lib/data/*).
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

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

export const EVENT_CATEGORIES = [
  'Etkinlik',
  'Meclis Toplantısı',
  'Komisyon Toplantısı',
  'Eğitim',
  'Çalıştay',
  'Sergi',
  'Başvuru',
] as const;

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

export type SiteSettings = {
  id: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  map_embed_url: string | null;
  updated_at: string;
};

export const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'X', 'YouTube', 'LinkedIn', 'Diğer'] as const;

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type HeroSlide = {
  id: string;
  image_url: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  button_label: string | null;
  button_href: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type PageContent = {
  id: string;
  slug: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  heading: string | null;
  body: string | null;
  image_url: string | null;
  updated_at: string;
};

export type BoardMember = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

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
