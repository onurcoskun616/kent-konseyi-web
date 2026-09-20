import { supabase, type SocialLink } from '@/lib/supabase';

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Sosyal medya bağlantıları yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as SocialLink[];
}

export async function adminFetchAllSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SocialLink[];
}

export async function adminUpsertSocialLink(item: Partial<SocialLink>): Promise<SocialLink> {
  const payload = {
    platform: item.platform,
    url: item.url,
    display_order: item.display_order ?? 0,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('social_links')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as SocialLink;
  }

  const { data, error } = await supabase
    .from('social_links')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as SocialLink;
}

export async function adminDeleteSocialLink(id: string): Promise<void> {
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) throw error;
}
