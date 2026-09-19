import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading } from '@/pages/shared';
import { fetchDocuments } from '@/lib/data/documents';
import type { DocumentItem } from '@/lib/supabase';

const communityImage = 'https://images.pexels.com/photos/7712023/pexels-photo-7712023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const content: Record<string, { title: string; eyebrow: string; description: string; heading: string; text: string[]; showDocs?: boolean }> = {
  hakkimizda: {
    title: 'Hakkımızda', eyebrow: 'Kurumsal',
    description: 'Küçükçekmece Kent Konseyi’nin kuruluşunu, değerlerini ve çalışma anlayışını keşfedin.',
    heading: 'Ortak aklın buluşma noktası.',
    text: [
      'Kent Konseyi; kent yaşamında yurttaşların, kurumların ve sivil toplumun ortak akıl etrafında buluştuğu demokratik bir platformdur.',
      'Küçükçekmece’nin ihtiyaçlarını birlikte tespit ediyor, çözüm önerilerini katılımcı yöntemlerle geliştiriyor ve kentimizin geleceğine birlikte yön veriyoruz.',
    ],
  },
  'kent-konseyi-hakkinda': {
    title: 'Küçükçekmece Kent Konseyi Hakkında', eyebrow: 'Kurumsal',
    description: 'Kent Konseyi’nin amacı, görevleri ve çalışma ilkeleri.',
    heading: 'Kentin her sesine açık bir yapı.',
    text: [
      'Kent Konseyleri, hemşehrilik bilincinin geliştirilmesi, kentin hak ve hukukunun korunması, sürdürülebilir kalkınma ve katılımcı yönetim anlayışının güçlendirilmesi için çalışır.',
      'Bütün çalışmalarımızda kapsayıcılık, şeffaflık, gönüllülük ve ortak üretim ilkelerini esas alıyoruz.',
    ],
  },
  'baskan-mesaji': {
    title: 'Başkan Mesajı', eyebrow: 'Kurumsal',
    description: 'Kent Konseyi Başkanımızın Küçükçekmece’ye mesajı.',
    heading: 'Birlikte daha güçlü bir Küçükçekmece.',
    text: [
      'Küçükçekmece’nin geleceğini, bu kente gönül veren herkesin katkısıyla birlikte kuracağımıza inanıyorum.',
      'Kent Konseyi olarak gençlerden kadınlara, çocuklardan engelli yurttaşlarımıza kadar her sesin duyulduğu, her fikrin değer bulduğu bir katılım alanı oluşturmayı sürdüreceğiz.',
    ],
  },
  'genel-kurul': {
    title: 'Genel Kurul', eyebrow: 'Kurumsal',
    description: 'Genel Kurul yapısı, toplantıları ve kararları.',
    heading: 'Kararların ortak zemini.',
    text: [
      'Genel Kurul, Kent Konseyi’nin en geniş katılımlı karar alma organıdır. Meclislerden, komisyonlardan ve kent paydaşlarından gelen öneriler burada değerlendirilir.',
      'Toplantı gündemlerini, kararları ve çalışma raporlarını şeffaf biçimde paylaşırız.',
    ],
  },
  'yurutme-kurulu': {
    title: 'Yürütme Kurulu', eyebrow: 'Kurumsal',
    description: 'Yürütme Kurulu üyeleri ve görevleri.',
    heading: 'Çalışmaları hayata geçiren ekip.',
    text: [
      'Yürütme Kurulu, Genel Kurul kararlarının uygulanmasını takip eder ve Kent Konseyi’nin çalışma programını koordine eder.',
      'Kurul üyeleri, farklı meclis ve komisyonların ortak çalışmalarını bir araya getirir.',
    ],
  },
  kurullar: {
    title: 'Kurullar', eyebrow: 'Kurumsal',
    description: 'Kent Konseyi bünyesinde görev yapan kurullar.',
    heading: 'Şeffaf ve düzenli çalışma.',
    text: [
      'Kent Konseyi çalışmalarının düzenli yürütülmesi için farklı görev alanlarına sahip kurullar birlikte çalışır.',
      'Kurullarımızın görev, yetki ve sorumluluklarını ilgili yönetmeliklere uygun şekilde sürdürüyoruz.',
    ],
  },
  tuzuk: {
    title: 'Tüzük', eyebrow: 'Kurumsal',
    description: 'Küçükçekmece Kent Konseyi tüzüğü.',
    heading: 'Çalışma ilkelerimizin çerçevesi.',
    text: ['Kent Konseyi’nin kuruluşunu, organlarını, görevlerini ve işleyişini belirleyen tüzük metnine buradan ulaşabilirsiniz.'],
    showDocs: true,
  },
  yonetmelikler: {
    title: 'Yönetmelikler', eyebrow: 'Kurumsal',
    description: 'Kent Konseyi yönetmelikleri ve uygulama metinleri.',
    heading: 'Ortak çalışmanın kuralları.',
    text: ['Meclislerimizin ve komisyonlarımızın çalışma esaslarını açıklayan yönetmelikler, katılımcı sürecin düzenli işlemesini sağlar.'],
    showDocs: true,
  },
  kvkk: {
    title: 'KVKK ve Gizlilik', eyebrow: 'Kurumsal',
    description: 'Kişisel verilerin korunması ve gizlilik politikamız.',
    heading: 'Verileriniz bizim için emanet.',
    text: [
      'Kişisel verilerinizi yalnızca iletişim ve başvuru süreçlerini yürütebilmek için, yürürlükteki mevzuata uygun olarak işleriz.',
      'Aydınlatma metni, başvuru formu ve veri güvenliği politikamıza bu sayfadan ulaşabilirsiniz.',
    ],
  },
};

export function InstitutionalPage({ slug = 'hakkimizda' }: { slug?: string }) {
  const item = content[slug] ?? content.hakkimizda;
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (!item.showDocs) return;
    fetchDocuments('Yönetmelik').then((all) => {
      if (slug === 'tuzuk') setDocs(all.filter((d) => d.title.toLowerCase().includes('tüzük')));
      else setDocs(all);
    });
  }, [slug, item.showDocs]);

  return (
    <PageShell title={item.title} eyebrow={item.eyebrow} description={item.description}>
      <section className="section detail-section">
        <div className="container detail-grid">
          <div>
            <SectionHeading eyebrow={item.eyebrow} title={item.heading} />
            {item.text.map((text) => <p className="body-copy" key={text}>{text}</p>)}
            {item.showDocs && (
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
              <a className="button button-dark" href="/iletisim">Bize ulaşın <ArrowRight size={16} /></a>
              <a className="text-link" href="/belgeler">Belgeler <ArrowRight size={16} /></a>
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
