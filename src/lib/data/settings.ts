import { supabase, type SiteSettings } from '@/lib/supabase';

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Site ayarları yüklenemedi:', error.message);
    return null;
  }
  return data as SiteSettings | null;
}

type ContactFields = Pick<SiteSettings, 'phone' | 'email' | 'address' | 'map_embed_url' | 'notification_email'>;

export async function adminUpdateContact(fields: ContactFields): Promise<SiteSettings> {
  const existing = await fetchSiteSettings();
  const payload = { ...fields, updated_at: new Date().toISOString() };

  if (existing) {
    const { data, error } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as SiteSettings;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function adminUpdateLogo(logoUrl: string | null): Promise<SiteSettings> {
  const existing = await fetchSiteSettings();

  if (existing) {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as SiteSettings;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .insert({ logo_url: logoUrl })
    .select()
    .single();
  if (error) throw error;
  return data as SiteSettings;
}
