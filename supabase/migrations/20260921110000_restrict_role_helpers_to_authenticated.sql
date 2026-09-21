/*
# Yetki Yardımcılarını Yalnızca Oturum Açmışlara Aç

## Sorun
current_admin_role(), is_admin() ve is_staff() oluşturulurken PostgreSQL
varsayılanı gereği PUBLIC'e EXECUTE verilmişti; bu da anon rolünü kapsıyor.
Supabase güvenlik denetimi üçünü de "oturum açmadan çağrılabilir SECURITY
DEFINER fonksiyonu" olarak işaretledi.

## Neden authenticated'ten alınamıyor
Denendi ve RLS kırıldı: politika ifadeleri çağıran rolün yetkisiyle
değerlendirildiği için, EXECUTE olmadan yönetici bile haber ekleyemiyor
("permission denied for function is_staff"). Yani bu yetki politikaların
çalışması için zorunlu.

Zararsız da: fonksiyonlar parametre almıyor ve yalnızca çağıranın kendi
rolünü döndürüyor; başka kimse hakkında bilgi vermiyor.

## Yapılan
anon'un bunlara ihtiyacı yok — rol denetimi yapan bütün politikalar
"TO authenticated". Ziyaretçinin yaptığı iki iş, siteyi okumak ve iletişim
formu göndermek, bu fonksiyonlara hiç uğramıyor (denenerek doğrulandı).
Bu yüzden yetki PUBLIC ve anon'dan alınıp yalnızca authenticated'e veriliyor.
*/

REVOKE EXECUTE ON FUNCTION public.current_admin_role() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin()           FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff()           FROM public, anon;

GRANT EXECUTE ON FUNCTION public.current_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()           TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff()           TO authenticated;
