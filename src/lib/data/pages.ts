import { supabase, type PageContent } from '@/lib/supabase';

export async function fetchPageContent(slug: string): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Sayfa içeriği yüklenemedi:', error.message);
    return null;
  }
  return data as PageContent | null;
}

export async function adminFetchAllPageContent(): Promise<PageContent[]> {
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .order('slug', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PageContent[];
}

export async function adminUpsertPageContent(item: Partial<PageContent> & { slug: string }): Promise<PageContent> {
  const payload = {
    eyebrow: item.eyebrow?.trim() || null,
    title: item.title?.trim() || null,
    description: item.description?.trim() || null,
    heading: item.heading?.trim() || null,
    body: item.body?.trim() || null,
    image_url: item.image_url?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('site_pages')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as PageContent;
  }

  const { data, error } = await supabase
    .from('site_pages')
    .insert({ slug: item.slug, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as PageContent;
}
