import { supabase, type Project } from '@/lib/supabase';

export async function fetchProjects(category?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('Projeler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Proje yüklenemedi:', error.message);
    return null;
  }
  return data as Project | null;
}

export async function fetchProjectsByCouncil(councilId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('council_id', councilId)
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Meclis projeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function fetchProjectsByCommission(commissionId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('commission_id', commissionId)
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Komisyon projeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function adminFetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function adminUpsertProject(item: Partial<Project>): Promise<Project> {
  const payload = {
    title: item.title,
    category: item.category || 'Devam Eden',
    description: item.description ?? '',
    body: item.body ?? null,
    cover_image_url: item.cover_image_url ?? null,
    start_date: item.start_date ?? null,
    end_date: item.end_date ?? null,
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function adminDeleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
