import { supabase, type NewsItem, type EventItem } from './supabase';

function formatDate(iso: string): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatNewsDate(iso: string): string {
  return formatDate(iso);
}

export function formatEventDate(iso: string): string {
  return formatDate(iso);
}

export async function fetchNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Haberler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export async function fetchEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Etkinlikler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as EventItem[];
}

export type AdminNewsItem = NewsItem;
export type AdminEventItem = EventItem;

export async function adminFetchAllNews(): Promise<AdminNewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminNewsItem[];
}

export async function adminUpsertNews(item: Partial<NewsItem>): Promise<NewsItem> {
  const payload = {
    title: item.title,
    category: item.category,
    published_at: item.published_at,
    excerpt: item.excerpt,
    body: item.body,
    image_url: item.image_url,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('news')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as NewsItem;
  }

  const { data, error } = await supabase
    .from('news')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as NewsItem;
}

export async function adminDeleteNews(id: string): Promise<void> {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

export async function adminFetchAllEvents(): Promise<AdminEventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminEventItem[];
}

export async function adminUpsertEvent(item: Partial<EventItem>): Promise<EventItem> {
  const payload = {
    title: item.title,
    event_date: item.event_date,
    event_time: item.event_time,
    location: item.location,
    description: item.description,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as EventItem;
  }

  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as EventItem;
}

export async function adminDeleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
