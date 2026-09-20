import { supabase, type Commission, type CommissionMember } from '@/lib/supabase';

export async function fetchCommissions(): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Komisyonlar yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as Commission[];
}

export async function fetchCommissionBySlug(slug: string): Promise<Commission | null> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Komisyon yüklenemedi:', error.message);
    return null;
  }
  return data as Commission | null;
}

export async function fetchCommissionById(id: string): Promise<Commission | null> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Komisyon yüklenemedi:', error.message);
    return null;
  }
  return data as Commission | null;
}

export async function fetchCommissionMembers(commissionId: string): Promise<CommissionMember[]> {
  const { data, error } = await supabase
    .from('commission_members')
    .select('*')
    .eq('commission_id', commissionId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Komisyon üyeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as CommissionMember[];
}

export async function fetchCommissionMembersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('commission_members')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Komisyon üye sayısı yüklenemedi:', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function adminFetchAllCommissions(): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Commission[];
}

export async function adminUpsertCommission(item: Partial<Commission>): Promise<Commission> {
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
      .from('commissions')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as Commission;
  }

  const { data, error } = await supabase
    .from('commissions')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Commission;
}

export async function adminDeleteCommission(id: string): Promise<void> {
  const { error } = await supabase.from('commissions').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertCommissionMember(item: Partial<CommissionMember>): Promise<CommissionMember> {
  const payload = {
    commission_id: item.commission_id,
    name: item.name,
    role: item.role || 'Üye',
    photo_url: item.photo_url ?? null,
    display_order: item.display_order ?? 0,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('commission_members')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as CommissionMember;
  }

  const { data, error } = await supabase
    .from('commission_members')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CommissionMember;
}

export async function adminDeleteCommissionMember(id: string): Promise<void> {
  const { error } = await supabase.from('commission_members').delete().eq('id', id);
  if (error) throw error;
}
