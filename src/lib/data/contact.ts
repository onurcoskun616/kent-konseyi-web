import { supabase, type ContactSubmission } from '@/lib/supabase';

export async function submitContactForm(item: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  council_id?: string | null;
  commission_id?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('contact_submissions').insert({
    type: item.type,
    name: item.name,
    email: item.email,
    phone: item.phone ?? null,
    message: item.message,
    council_id: item.council_id ?? null,
    commission_id: item.commission_id ?? null,
  });
  if (error) throw error;
}

export async function adminFetchAllContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactSubmission[];
}

export async function adminUpdateContactSubmissionStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('contact_submissions').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteContactSubmission(id: string): Promise<void> {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
  if (error) throw error;
}
