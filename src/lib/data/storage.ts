import { supabase } from '@/lib/supabase';

function randomFileName(originalName: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const id = crypto.randomUUID();
  return ext ? `${id}.${ext}` : id;
}

export async function uploadFile(bucket: 'media' | 'documents', file: File): Promise<string> {
  const path = randomFileName(file.name);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
