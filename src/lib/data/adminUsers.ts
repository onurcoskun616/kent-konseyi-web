import { supabase, type AdminRole, type AdminUser } from '@/lib/supabase';

/**
 * Panel kullanıcıları.
 *
 * İşlemler iki yoldan gidiyor:
 *
 * - Rol, ad ve etkinlik değişiklikleri doğrudan admin_users tablosuna
 *   yazılıyor; yetki denetimini RLS politikaları yapıyor.
 * - Hesap açma/silme ve e-posta/şifre değiştirme Supabase Admin API'sini
 *   gerektirdiği için admin-users Edge Function'ına gidiyor. O API
 *   service_role anahtarıyla çalışıyor ve bu anahtar tarayıcıya konulamaz.
 */

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('role', { ascending: true })
    .order('email', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

/** Oturum açmış kişinin kendi satırı. Yetkisi olmayan biri için null döner. */
export async function fetchCurrentAdminUser(): Promise<AdminUser | null> {
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Yetki bilgisi okunamadı:', error.message);
    return null;
  }
  return data as AdminUser | null;
}

export async function updateAdminUser(
  id: string,
  fields: { full_name?: string | null; role?: AdminRole; is_active?: boolean },
): Promise<void> {
  const { error } = await supabase.from('admin_users').update(fields).eq('id', id);
  if (error) throw new Error(cevir(error.message));
}

type IslemSonucu = { ok?: boolean; error?: string };

async function cagir(govde: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.functions.invoke<IslemSonucu>('admin-users', { body: govde });

  // Edge Function 4xx döndüğünde supabase-js hatayı FunctionsHttpError
  // olarak sarıyor ve gövdedeki açıklama error.message'a geçmiyor; asıl
  // mesaja ulaşmak için yanıt gövdesi ayrıca okunuyor.
  if (error) {
    const yanit = (error as { context?: Response }).context;
    if (yanit && typeof yanit.json === 'function') {
      try {
        const govdeYanit = (await yanit.json()) as IslemSonucu;
        if (govdeYanit?.error) throw new Error(govdeYanit.error);
      } catch (okumaHatasi) {
        if (okumaHatasi instanceof Error && okumaHatasi.message) throw okumaHatasi;
      }
    }
    throw new Error(error.message || 'İşlem tamamlanamadı.');
  }

  if (data?.error) throw new Error(data.error);
}

export async function createAdminUser(input: {
  email: string; sifre: string; rol: AdminRole; ad_soyad: string | null;
}): Promise<void> {
  await cagir({ islem: 'olustur', ...input });
}

export async function deleteAdminUser(id: string): Promise<void> {
  await cagir({ islem: 'sil', id });
}

export async function changeAdminEmail(id: string, email: string): Promise<void> {
  await cagir({ islem: 'eposta_degistir', id, email });
}

export async function changeAdminPassword(id: string, sifre: string): Promise<void> {
  await cagir({ islem: 'sifre_degistir', id, sifre });
}

/**
 * Kendi e-posta veya şifresini değiştirmeden önce mevcut şifreyi doğrular.
 *
 * Supabase geçerli bir oturumla şifre değiştirmeye izin veriyor, mevcut
 * şifreyi sormuyor. Açık bırakılmış bir bilgisayarda bu, oturuma erişen
 * kişinin hesabı tamamen devralması anlamına gelirdi.
 */
export async function verifyCurrentPassword(email: string, sifre: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
  return !error;
}

function cevir(mesaj: string): string {
  if (mesaj.includes('son_yonetici_korunuyor')) {
    return 'Son yöneticinin yetkisi kaldırılamaz. Önce başka bir yönetici ekleyin.';
  }
  return mesaj;
}
