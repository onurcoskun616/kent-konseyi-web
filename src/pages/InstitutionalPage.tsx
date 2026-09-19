import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent, type PageCopy } from '@/pages/shared';
import { fetchDocuments } from '@/lib/data/documents';
import type { DocumentItem } from '@/lib/supabase';
import { withBase } from '@/lib/url';

const communityImage = 'https://images.pexels.com/photos/7712023/pexels-photo-7712023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const DOC_SLUGS = new Set(['tuzuk', 'yonetmelikler']);

const defaults: Record<string, PageCopy> = {
  hakkimizda: {
    eyebrow: 'Kurumsal', title: 'Hakkımızda',
    description: 'Küçükçekmece Kent Konseyi’nin kuruluşunu, değerlerini ve çalışma anlayışını keşfedin.',
    heading: 'Ortak aklın buluşma noktası.',
    body: 'Kent Konseyi; kent yaşamında yurttaşların, kurumların ve sivil toplumun ortak akıl etrafında buluştuğu demokratik bir platformdur.\n\nKüçükçekmece’nin ihtiyaçlarını birlikte tespit ediyor, çözüm önerilerini katılımcı yöntemlerle geliştiriyor ve kentimizin geleceğine birlikte yön veriyoruz.',
  },
  'kent-konseyi-hakkinda': {
    eyebrow: 'Kurumsal', title: 'Küçükçekmece Kent Konseyi Hakkında',
    description: 'Kent Konseyi’nin amacı, görevleri ve çalışma ilkeleri.',
    heading: 'Kentin her sesine açık bir yapı.',
    body: 'Kent Konseyleri, hemşehrilik bilincinin geliştirilmesi, kentin hak ve hukukunun korunması, sürdürülebilir kalkınma ve katılımcı yönetim anlayışının güçlendirilmesi için çalışır.\n\nBütün çalışmalarımızda kapsayıcılık, şeffaflık, gönüllülük ve ortak üretim ilkelerini esas alıyoruz.',
  },
  'baskan-mesaji': {
    eyebrow: 'Kurumsal', title: 'Başkan Mesajı',
    description: 'Kent Konseyi Başkanımızın Küçükçekmece’ye mesajı.',
    heading: 'Birlikte daha güçlü bir Küçükçekmece.',
    body: 'Küçükçekmece’nin geleceğini, bu kente gönül veren herkesin katkısıyla birlikte kuracağımıza inanıyorum.\n\nKent Konseyi olarak gençlerden kadınlara, çocuklardan engelli yurttaşlarımıza kadar her sesin duyulduğu, her fikrin değer bulduğu bir katılım alanı oluşturmayı sürdüreceğiz.',
  },
  'genel-kurul': {
    eyebrow: 'Kurumsal', title: 'Genel Kurul',
    description: 'Genel Kurul yapısı, toplantıları ve kararları.',
    heading: 'Kararların ortak zemini.',
    body: 'Genel Kurul, Kent Konseyi’nin en geniş katılımlı karar alma organıdır. Meclislerden, komisyonlardan ve kent paydaşlarından gelen öneriler burada değerlendirilir.\n\nToplantı gündemlerini, kararları ve çalışma raporlarını şeffaf biçimde paylaşırız.',
  },
  'yurutme-kurulu': {
    eyebrow: 'Kurumsal', title: 'Yürütme Kurulu',
    description: 'Yürütme Kurulu üyeleri ve görevleri.',
    heading: 'Çalışmaları hayata geçiren ekip.',
    body: 'Yürütme Kurulu, Genel Kurul kararlarının uygulanmasını takip eder ve Kent Konseyi’nin çalışma programını koordine eder.\n\nKurul üyeleri, farklı meclis ve komisyonların ortak çalışmalarını bir araya getirir.',
  },
  kurullar: {
    eyebrow: 'Kurumsal', title: 'Kurullar',
    description: 'Kent Konseyi bünyesinde görev yapan kurullar.',
    heading: 'Şeffaf ve düzenli çalışma.',
    body: 'Kent Konseyi çalışmalarının düzenli yürütülmesi için farklı görev alanlarına sahip kurullar birlikte çalışır.\n\nKurullarımızın görev, yetki ve sorumluluklarını ilgili yönetmeliklere uygun şekilde sürdürüyoruz.',
  },
  tuzuk: {
    eyebrow: 'Kurumsal', title: 'Tüzük',
    description: 'Küçükçekmece Kent Konseyi tüzüğü.',
    heading: 'Çalışma ilkelerimizin çerçevesi.',
    body: 'Kent Konseyi’nin kuruluşunu, organlarını, görevlerini ve işleyişini belirleyen tüzük metnine buradan ulaşabilirsiniz.',
  },
  yonetmelikler: {
    eyebrow: 'Kurumsal', title: 'Yönetmelikler',
    description: 'Kent Konseyi yönetmelikleri ve uygulama metinleri.',
    heading: 'Ortak çalışmanın kuralları.',
    body: 'Meclislerimizin ve komisyonlarımızın çalışma esaslarını açıklayan yönetmelikler, katılımcı sürecin düzenli işlemesini sağlar.',
  },
  kvkk: {
    eyebrow: 'Kurumsal', title: 'KVKK ve Gizlilik',
    description: 'Kişisel verilerin korunması ve gizlilik politikamız.',
    heading: 'Verileriniz bizim için emanet.',
    body: 'Kişisel verilerinizi yalnızca iletişim ve başvuru süreçlerini yürütebilmek için, yürürlükteki mevzuata uygun olarak işleriz.\n\nAydınlatma metni, başvuru formu ve veri güvenliği politikamıza bu sayfadan ulaşabilirsiniz.',
  },
};

export function InstitutionalPage({ slug = 'hakkimizda' }: { slug?: string }) {
  const key = defaults[slug] ? slug : 'hakkimizda';
  const copy = usePageContent(`kurumsal-${key}`, defaults[key]);
  const showDocs = DOC_SLUGS.has(key);
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (!showDocs) return;
    fetchDocuments('Yönetmelik').then((all) => {
      if (key === 'tuzuk') setDocs(all.filter((d) => d.title.toLowerCase().includes('tüzük')));
      else setDocs(all);
    });
  }, [key, showDocs]);

  const paragraphs = (copy.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section detail-section">
        <div className="container detail-grid">
          <div>
            <SectionHeading eyebrow={copy.eyebrow} title={copy.heading ?? ''} />
            {paragraphs.map((text) => <p className="body-copy" key={text}>{text}</p>)}
            {showDocs && (
              docs.length === 0 ? (
                <div className="state-message" style={{ padding: '20px 0', textAlign: 'left' }}>Henüz belge eklenmemiş.</div>
              ) : (
                <div className="document-list" style={{ marginTop: 22 }}>
                  {docs.map((doc) => (
                    <a className="document-row" href={doc.file_url} target="_blank" rel="noreferrer" key={doc.id}>
                      <FileText size={20} />
                      <span><strong>{doc.title}</strong><small>PDF · {doc.published_at}</small></span>
                      <Download size={17} />
                    </a>
                  ))}
                </div>
              )
            )}
            <div className="detail-actions">
              <a className="button button-dark" href={withBase('/iletisim')}>Bize ulaşın <ArrowRight size={16} /></a>
              <a className="text-link" href={withBase('/belgeler')}>Belgeler <ArrowRight size={16} /></a>
            </div>
          </div>
          <div className="detail-aside">
            <img src={communityImage} alt="Kent Konseyi çalışmaları" />
            <div className="aside-note"><CheckCircle2 size={18} /><span>Şeffaflık, katılım ve ortak akıl</span></div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
