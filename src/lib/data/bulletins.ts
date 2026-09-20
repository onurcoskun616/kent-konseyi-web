import { supabase, type Bulletin } from '@/lib/supabase';

export async function fetchBulletins(): Promise<Bulletin[]> {
  const { data, error } = await supabase
    .from('bulletins')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Bültenler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Bulletin[];
}

export async function adminFetchAllBulletins(): Promise<Bulletin[]> {
  const { data, error } = await supabase
    .from('bulletins')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Bulletin[];
}

export async function adminUpsertBulletin(item: Partial<Bulletin>): Promise<Bulletin> {
  const payload = {
    title: item.title,
    period: item.period || 'Aylık',
    file_url: item.file_url,
    published_at: item.published_at || new Date().toISOString().slice(0, 10),
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('bulletins')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as Bulletin;
  }

  const { data, error } = await supabase
    .from('bulletins')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Bulletin;
}

export async function adminDeleteBulletin(id: string): Promise<void> {
  const { error } = await supabase.from('bulletins').delete().eq('id', id);
  if (error) throw error;
}
