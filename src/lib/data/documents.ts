import { supabase, type DocumentItem } from '@/lib/supabase';

export async function fetchDocuments(category?: string): Promise<DocumentItem[]> {
  let query = supabase
    .from('documents')
    .select('*')
    .order('published_at', { ascending: false });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('Belgeler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as DocumentItem[];
}

export async function fetchDocumentsByCouncil(councilId: string): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('council_id', councilId)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Meclis belgeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as DocumentItem[];
}

export async function fetchDocumentsByCommission(commissionId: string): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('commission_id', commissionId)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Komisyon belgeleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as DocumentItem[];
}

export async function adminFetchAllDocuments(): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as DocumentItem[];
}

export async function adminUpsertDocument(item: Partial<DocumentItem>): Promise<DocumentItem> {
  const payload = {
    title: item.title,
    category: item.category || 'Rapor',
    file_url: item.file_url,
    description: item.description ?? null,
    published_at: item.published_at || new Date().toISOString().slice(0, 10),
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('documents')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as DocumentItem;
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as DocumentItem;
}

export async function adminDeleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}
