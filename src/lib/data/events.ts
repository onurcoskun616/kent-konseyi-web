import { supabase, type EventItem } from '@/lib/supabase';
import { isUuid } from '@/lib/slug';

export async function fetchEvents(limit = 5, upcomingOnly = false): Promise<EventItem[]> {
  let query = supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(limit);

  // "Yaklaşan etkinlikler" bağlamlarında geçmiş tarihli kayıtlar listenin
  // başına düşmesin diye bugünden öncesi elenir; takvim sayfası geçmiş
  // ayları da gezebilmek için tüm kayıtları ister.
  if (upcomingOnly) query = query.gte('event_date', new Date().toISOString().slice(0, 10));

  const { data, error } = await query;
  if (error) {
    console.error('Etkinlikler yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as EventItem[];
}

export async function fetchEventBySlugOrId(value: string): Promise<EventItem | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq(isUuid(value) ? 'id' : 'slug', value)
    .maybeSingle();

  if (error) {
    console.error('Etkinlik yüklenemedi:', error.message);
    return null;
  }
  return data as EventItem | null;
}

export async function fetchEventsByCouncil(councilId: string, limit = 10): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('council_id', councilId)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Meclis etkinlikleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as EventItem[];
}

export async function fetchEventsByCommission(commissionId: string, limit = 10): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('commission_id', commissionId)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Komisyon etkinlikleri yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as EventItem[];
}

export type AdminEventItem = EventItem;

export async function adminFetchAllEvents(): Promise<AdminEventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminEventItem[];
}

export async function adminUpsertEvent(item: Partial<EventItem>): Promise<EventItem> {
  const payload = {
    slug: item.slug || null,
    title: item.title,
    event_date: item.event_date,
    event_time: item.event_time,
    location: item.location,
    description: item.description,
    category: item.category || 'Etkinlik',
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as EventItem;
  }

  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as EventItem;
}

export async function adminDeleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
