import { supabase, type HeroSlide } from '@/lib/supabase';

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Hero slaytları yüklenemedi:', error.message);
    return [];
  }
  return (data ?? []) as HeroSlide[];
}

export async function adminFetchAllHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as HeroSlide[];
}

export async function adminUpsertHeroSlide(item: Partial<HeroSlide>): Promise<HeroSlide> {
  const payload = {
    image_url: item.image_url,
    eyebrow: item.eyebrow ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    button_label: item.button_label ?? null,
    button_href: item.button_href ?? null,
    display_order: item.display_order ?? 0,
    is_published: item.is_published ?? true,
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data as HeroSlide;
  }

  const { data, error } = await supabase
    .from('hero_slides')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as HeroSlide;
}

export async function adminDeleteHeroSlide(id: string): Promise<void> {
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);
  if (error) throw error;
}
