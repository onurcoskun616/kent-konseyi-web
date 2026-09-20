import { supabase, type BoardMember } from '@/lib/supabase';

export async function fetchBoardMembers(): Promise<BoardMember[]> {
  const { data, error } = await supabase
    .from('board_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Yürütme Kurulu üyeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as BoardMember[];
}

export async function adminFetchAllBoardMembers(): Promise<BoardMember[]> {
  const { data, error } = await supabase
    .from('board_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as BoardMember[];
}

export async function adminUpsertBoardMember(item: Partial<BoardMember>): Promise<BoardMember> {
  const payload = {
    name: item.name,
    role: item.role || 'Üye',
    photo_url: item.photo_url ?? null,
    display_order: item.display_order ?? 0,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('board_members')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as BoardMember;
  }

  const { data, error } = await supabase
    .from('board_members')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as BoardMember;
}

export async function adminDeleteBoardMember(id: string): Promise<void> {
  const { error } = await supabase.from('board_members').delete().eq('id', id);
  if (error) throw error;
}
