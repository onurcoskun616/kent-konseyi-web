import { supabase, type NewsItem } from '@/lib/supabase';

export async function fetchNews(limit = 6): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Haberler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export async function fetchNewsByCouncil(councilId: string, limit = 6): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('council_id', councilId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Meclis haberleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export async function fetchNewsByCommission(commissionId: string, limit = 6): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('commission_id', commissionId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Komisyon haberleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export type AdminNewsItem = NewsItem;

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
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
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
