import { supabase, type GalleryItem } from '@/lib/supabase';

export async function fetchGalleryItems(type?: 'photo' | 'video'): Promise<GalleryItem[]> {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (type) query = query.eq('media_type', type);

  const { data, error } = await query;
  if (error) {
    console.error('Galeri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as GalleryItem[];
}

export async function fetchGalleryByCouncil(councilId: string, limit = 8): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('council_id', councilId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Meclis galerisi yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as GalleryItem[];
}

export async function fetchGalleryByCommission(commissionId: string, limit = 8): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('commission_id', commissionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Komisyon galerisi yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as GalleryItem[];
}

export async function fetchGalleryByProject(projectId: string, limit = 12): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Proje galerisi yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as GalleryItem[];
}

export async function adminFetchAllGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export async function adminUpsertGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
  const payload = {
    title: item.title ?? null,
    media_type: item.media_type || 'photo',
    media_url: item.media_url,
    thumbnail_url: item.thumbnail_url ?? null,
    category: item.category || 'Genel',
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
    project_id: item.project_id ?? null,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('gallery_items')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as GalleryItem;
  }

  const { data, error } = await supabase
    .from('gallery_items')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as GalleryItem;
}

export async function adminDeleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw error;
}
