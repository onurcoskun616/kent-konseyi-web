/*
# Tetikleyici Fonksiyonlarının RPC Erişimini Kapat

## Sorun
limit_contact_submission_rate() ve notify_contact_submission() tetikleyici
fonksiyonları SECURITY DEFINER; PostgreSQL yeni fonksiyonlara varsayılan
olarak PUBLIC'e EXECUTE verdiği için ikisi de PostgREST üzerinden
/rest/v1/rpc/... adresinden anon ve authenticated rollerince çağrılabilir
durumdaydı. Supabase güvenlik denetimi de bunu işaretledi.

Pratikte sömürülebilir değiller: trigger dönen bir fonksiyon tetikleyici
bağlamı dışında çağrıldığında PostgreSQL hata veriyor. Yine de SECURITY
DEFINER bir fonksiyonun dışarıdan çağrılabilir olması gereksiz bir yüzey;
ilerideki bir düzenlemede fonksiyonun davranışı değişirse sessizce gerçek
bir açığa dönüşebilir.

## Çözüm
Her iki fonksiyondan da EXECUTE yetkisi geri alınıyor. Tetikleyiciler
etkilenmiyor: tetikleyici fonksiyonu tablo sahibinin yetkisiyle çalışıyor,
çağıranın EXECUTE yetkisine bakılmıyor.
*/

REVOKE EXECUTE ON FUNCTION public.limit_contact_submission_rate() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_contact_submission()     FROM public, anon, authenticated;
