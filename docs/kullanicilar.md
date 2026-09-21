# Panel Kullanıcıları ve Yetkilendirme

Yönetim paneline birden fazla kişi kendi hesabıyla girebilir. Her hesabın
bir yetki düzeyi vardır.

## Roller

| | Yönetici | Editör |
|---|---|---|
| Haber, etkinlik, proje, belge, bülten, galeri | ✓ | ✓ |
| Meclis ve komisyonlar, üyeleri | ✓ | ✓ |
| Sayfa metinleri, slider, Yürütme Kurulu | ✓ | ✓ |
| Form başvurularını görme | ✓ | ✓ |
| Site Ayarları (logo, iletişim, sosyal medya) | ✓ | — |
| Kullanıcı ekleme, silme, yetki değiştirme | ✓ | — |

Site ayarları yöneticiye ayrıldı: sitenin kimliğini belirleyen, nadiren
değişen ve yanlış değiştirildiğinde her sayfayı etkileyen alanlar.

## Kullanıcı ekleme

**Kullanıcılar → Panel Kullanıcıları → Yeni Kullanıcı.**

E-posta, bir başlangıç şifresi (en az 8 karakter) ve yetki girin. Hesap
anında kullanılabilir olur; sistem e-posta göndermiyor, dolayısıyla
başlangıç şifresini kişiye siz iletmelisiniz. Kişi giriş yaptıktan sonra
**Kullanıcılar → Hesabım** bölümünden kendi şifresini değiştirebilir.

## Erişimi kapatma

Listedeki **Etkin / Kapalı** rozetine tıklayın. Hesap ve geçmişi durur,
yalnızca giriş engellenir. Ayrılan biri için silmek yerine bunu tercih edin.

Kalıcı silmek için çöp kutusu simgesini kullanın; hesap Supabase'den de
silinir.

## Kendi bilgilerinizi değiştirme

**Kullanıcılar → Hesabım.** E-posta ve şifrenizi buradan değiştirirsiniz.
Her iki değişiklik de mevcut şifrenizi girmenizi ister: açık bırakılmış bir
bilgisayarda oturuma erişen kişinin hesabı devralmasını önlemek için.

E-postanızı değiştirdikten sonra girişte yeni adresi kullanırsınız.

## Kilitlenmeye karşı koruma

Sistem son yöneticinin silinmesine, editöre düşürülmesine ve pasife
alınmasına izin vermez; aksi hâlde paneli açabilen kimse kalmayabilirdi.
Kendi yetkinizi ve durumunuzu da kendi üzerinizde değiştiremezsiniz.
Yetkinizi başkası değiştirebilir.

## Yetki nerede denetleniyor

Panelde bir sekmeyi gizlemek yetkilendirme değildir: sitenin anon anahtarı
tarayıcıya gönderilen paketin içinde ve o anahtarla veritabanı API'sine
doğrudan istek atmak mümkün. Bu yüzden yetki denetimi veritabanındaki RLS
politikalarında; paneldeki gizleme yalnızca görsel katman.

Yetki "oturum açmış olmak"a değil, `admin_users` tablosunda **etkin bir
satırınızın bulunmasına** bağlı. Supabase'te kendi kendine kayıt açık olsa
bile, kayıt olan biri bu tabloda olmadığı için hiçbir şey yazamaz; panele
girdiğinde "Yetkiniz yok" ekranını görür.

Yine de gereksiz hesap birikmemesi için Supabase panelinde
**Authentication → Sign In / Providers → Allow new users to sign up**
ayarını kapalı tutmanızı öneririm.

## Teknik not

Hesap açma, silme ve bir başkasının e-posta/şifresini değiştirme işlemleri
Supabase Admin API'sini gerektiriyor; o da `service_role` anahtarıyla
çalışıyor. Bu anahtar veritabanındaki her şeye erişip RLS'i hiçe saydığı
için tarayıcıya konulamaz. Bu işlemler `admin-users` adlı Edge Function
üzerinden geçiyor ve anahtar sunucuda kalıyor.

Rol, ad ve etkinlik değişiklikleri Edge Function'dan geçmiyor; doğrudan
`admin_users` tablosuna yazılıyor ve RLS politikalarıyla korunuyor.
