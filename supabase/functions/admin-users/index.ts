/**
 * Panel kullanıcılarının hesap işlemleri.
 *
 * Neden ayrı bir Edge Function gerekiyor: hesap oluşturmak, silmek, bir
 * başkasının e-postasını veya şifresini değiştirmek Supabase Admin API'sini
 * gerektiriyor; o da service_role anahtarıyla çalışıyor. Bu anahtar
 * veritabanındaki her şeye erişiyor ve RLS'i hiçe sayıyor, dolayısıyla
 * tarayıcıya gönderilen pakete konulamaz. Anahtar burada, sunucuda kalıyor.
 *
 * Rol/ad/etkinlik değişiklikleri buradan geçmiyor: onlar admin_users
 * tablosuna doğrudan yazılıyor ve RLS politikalarıyla korunuyor. Burada
 * yalnızca Admin API gerektiren işlemler var.
 *
 * Yetki denetimi çağıranın JWT'sinden okunan kimliğe göre yapılıyor;
 * istek gövdesinden gelen hiçbir alan yetki belirlemiyor.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function yanit(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const yonetim = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return yanit({ error: 'Yalnızca POST' }, 405);

  // --- Çağıranın kimliği -------------------------------------------------
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return yanit({ error: 'Oturum bulunamadı.' }, 401);

  const { data: userData, error: userError } = await yonetim.auth.getUser(token);
  if (userError || !userData.user) return yanit({ error: 'Oturum geçersiz.' }, 401);
  const cagiranId = userData.user.id;

  // --- Çağıranın yetkisi (istek gövdesinden DEĞİL, veritabanından) -------
  const { data: cagiran } = await yonetim
    .from('admin_users')
    .select('role, is_active')
    .eq('id', cagiranId)
    .maybeSingle();

  if (!cagiran || !cagiran.is_active) {
    return yanit({ error: 'Bu panel için yetkiniz yok.' }, 403);
  }
  const yoneticiMi = cagiran.role === 'yonetici';

  let govde: Record<string, unknown>;
  try {
    govde = await req.json();
  } catch {
    return yanit({ error: 'Geçersiz istek.' }, 400);
  }

  const islem = String(govde.islem ?? '');
  const hedefId = govde.id ? String(govde.id) : null;
  const kendisiMi = hedefId === cagiranId;

  switch (islem) {
    // ---------------------------------------------------------------
    case 'olustur': {
      if (!yoneticiMi) return yanit({ error: 'Kullanıcı eklemek için yönetici olmalısınız.' }, 403);

      const email = String(govde.email ?? '').trim().toLowerCase();
      const sifre = String(govde.sifre ?? '');
      const rol = String(govde.rol ?? 'editor');
      const adSoyad = govde.ad_soyad ? String(govde.ad_soyad).trim() : null;

      if (!email || !sifre) return yanit({ error: 'E-posta ve şifre zorunludur.' }, 400);
      if (sifre.length < 8) return yanit({ error: 'Şifre en az 8 karakter olmalıdır.' }, 400);
      if (rol !== 'yonetici' && rol !== 'editor') return yanit({ error: 'Geçersiz rol.' }, 400);

      // email_confirm: SMTP kurulu olmadığı için doğrulama e-postası
      // gönderilemiyor; hesap doğrudan kullanılabilir açılıyor.
      const { data: yeni, error: olusturmaHatasi } = await yonetim.auth.admin.createUser({
        email, password: sifre, email_confirm: true,
      });
      if (olusturmaHatasi || !yeni.user) {
        return yanit({ error: olusturmaHatasi?.message ?? 'Hesap oluşturulamadı.' }, 400);
      }

      const { error: satirHatasi } = await yonetim.from('admin_users').insert({
        id: yeni.user.id, email, full_name: adSoyad, role: rol,
      });
      if (satirHatasi) {
        // Yetki satırı yazılamadıysa hesabı bırakmak, panele girebilen ama
        // hiçbir şey yapamayan bir hayalet hesap bırakırdı.
        await yonetim.auth.admin.deleteUser(yeni.user.id);
        return yanit({ error: satirHatasi.message }, 400);
      }
      return yanit({ ok: true, id: yeni.user.id });
    }

    // ---------------------------------------------------------------
    case 'sil': {
      if (!yoneticiMi) return yanit({ error: 'Kullanıcı silmek için yönetici olmalısınız.' }, 403);
      if (!hedefId) return yanit({ error: 'Kullanıcı belirtilmedi.' }, 400);
      if (kendisiMi) return yanit({ error: 'Kendi hesabınızı silemezsiniz.' }, 400);

      // auth.users silinince admin_users satırı da düşüyor; son yöneticiyi
      // koruyan tetikleyici bu sırada devreye girip işlemi durdurabiliyor.
      // Kullanıcıya anlaşılır bir mesaj dönmek için burada da bakılıyor.
      const { data: kalan } = await yonetim
        .from('admin_users')
        .select('id')
        .eq('role', 'yonetici')
        .eq('is_active', true)
        .neq('id', hedefId);

      if (!kalan || kalan.length === 0) {
        return yanit({ error: 'Son yöneticiyi silemezsiniz. Önce başka bir yönetici ekleyin.' }, 400);
      }

      const { error } = await yonetim.auth.admin.deleteUser(hedefId);
      if (error) return yanit({ error: error.message }, 400);
      return yanit({ ok: true });
    }

    // ---------------------------------------------------------------
    case 'eposta_degistir': {
      if (!hedefId) return yanit({ error: 'Kullanıcı belirtilmedi.' }, 400);
      if (!yoneticiMi && !kendisiMi) return yanit({ error: 'Yalnızca kendi e-postanızı değiştirebilirsiniz.' }, 403);

      const email = String(govde.email ?? '').trim().toLowerCase();
      if (!email.includes('@')) return yanit({ error: 'Geçerli bir e-posta girin.' }, 400);

      const { error } = await yonetim.auth.admin.updateUserById(hedefId, {
        email, email_confirm: true,
      });
      if (error) return yanit({ error: error.message }, 400);

      // admin_users.email yalnızca gösterim için tutuluyor; auth ile
      // ayrışmaması için birlikte güncelleniyor.
      await yonetim.from('admin_users').update({ email }).eq('id', hedefId);
      return yanit({ ok: true });
    }

    // ---------------------------------------------------------------
    case 'sifre_degistir': {
      if (!hedefId) return yanit({ error: 'Kullanıcı belirtilmedi.' }, 400);
      if (!yoneticiMi && !kendisiMi) return yanit({ error: 'Yalnızca kendi şifrenizi değiştirebilirsiniz.' }, 403);

      const sifre = String(govde.sifre ?? '');
      if (sifre.length < 8) return yanit({ error: 'Şifre en az 8 karakter olmalıdır.' }, 400);

      const { error } = await yonetim.auth.admin.updateUserById(hedefId, { password: sifre });
      if (error) return yanit({ error: error.message }, 400);
      return yanit({ ok: true });
    }

    default:
      return yanit({ error: 'Bilinmeyen işlem.' }, 400);
  }
});
