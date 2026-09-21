/*
# Etkinlik Başvuru Bağlantısı

## Amacı
Etkinlikler şimdiye kadar yalnızca duyuru amaçlıydı; etkinlik sayfasındaki
"Başvuru ve bilgi" düğmesi herkesi iletişim formuna götürüyordu. Katılımcı
toplanan etkinlikler için bu dolaylı bir yol: kişi formu doldurup yanıt
bekliyor, kayıt listesi de elle tutuluyor.

registration_url, etkinliğe özel bir kayıt adresine (Google Forms, e-Devlet
randevu sayfası, bilet sitesi vb.) doğrudan bağlanmayı sağlıyor.

## Neden yalnızca bir bağlantı
Kayıt formunun kendisi siteye gömülmedi. Kayıt alanları etkinlikten
etkinliğe değişiyor (yaş, beden, refakatçi, ulaşım tercihi...) ve bunu
yönetebilen bir form kurucusu yazmak, var olan form araçlarının çözdüğü bir
sorunu yeniden çözmek olurdu. Kişisel veri de böylece bu sitenin
veritabanında birikmiyor.

## Boş bırakılabilir
Alan boşsa etkinlik sayfası eskisi gibi iletişim formuna yönlendiriyor;
yani duyuru amaçlı etkinliklerin davranışı değişmiyor.
*/

ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_url text;

COMMENT ON COLUMN events.registration_url IS
  'Etkinliğe özel dış kayıt/başvuru adresi. Boşsa iletişim formuna yönlendirilir.';
