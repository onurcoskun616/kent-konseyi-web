/*
# Site Ayarları (site_settings)

## Amacı
Sitenin logosu gibi tek bir global ayarı admin panelinden değiştirilebilir
hale getirmek. Tek satırlık (singleton) bir tablo: logo_url boşsa site,
koddaki varsayılan logoyu kullanmaya devam eder.

## Güvenlik
- RLS etkin. SELECT herkese açık.
- UPDATE yalnızca authenticated (yönetim paneli). INSERT/DELETE yok —
  satır bu migration ile bir kez oluşturulur, sadece güncellenir.
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO site_settings (logo_url)
SELECT NULL
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
