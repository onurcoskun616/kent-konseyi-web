import { supabase, type Council, type CouncilMember } from '@/lib/supabase';

export async function fetchCouncils(): Promise<Council[]> {
  const { data, error } = await supabase
    .from('councils')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Meclisler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Council[];
}

export async function fetchCouncilBySlug(slug: string): Promise<Council | null> {
  const { data, error } = await supabase
    .from('councils')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Meclis yüklenemedi:', error.message);
    return null;
  }
  return data as Council | null;
}

export async function fetchCouncilMembers(councilId: string): Promise<CouncilMember[]> {
  const { data, error } = await supabase
    .from('council_members')
    .select('*')
    .eq('council_id', councilId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Meclis üyeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as CouncilMember[];
}

export async function fetchCouncilMembersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('council_members')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Meclis üye sayısı yüklenemedi:', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function adminFetchAllCouncils(): Promise<Council[]> {
  const { data, error } = await supabase
    .from('councils')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Council[];
}

export async function adminUpsertCouncil(item: Partial<Council>): Promise<Council> {
  const payload = {
    slug: item.slug,
    name: item.name,
    tagline: item.tagline ?? null,
    cover_image_url: item.cover_image_url ?? null,
    about: item.about ?? '',
    display_order: item.display_order ?? 0,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('councils')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as Council;
  }

  const { data, error } = await supabase
    .from('councils')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Council;
}

export async function adminDeleteCouncil(id: string): Promise<void> {
  const { error } = await supabase.from('councils').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertCouncilMember(item: Partial<CouncilMember>): Promise<CouncilMember> {
  const payload = {
    council_id: item.council_id,
    name: item.name,
    role: item.role || 'Üye',
    photo_url: item.photo_url ?? null,
    display_order: item.display_order ?? 0,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('council_members')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as CouncilMember;
  }

  const { data, error } = await supabase
    .from('council_members')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CouncilMember;
}

export async function adminDeleteCouncilMember(id: string): Promise<void> {
  const { error } = await supabase.from('council_members').delete().eq('id', id);
  if (error) throw error;
}
