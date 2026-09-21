import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { BodyText, SectionHeading, type PageCopy, usePageContent } from '@/pages/shared';
import { fetchDocuments } from '@/lib/data/documents';
import { fetchBoardMembers } from '@/lib/data/boardMembers';
import type { BoardMember, DocumentItem } from '@/lib/supabase';
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
  'kullanim-kosullari': {
    eyebrow: 'Kurumsal', title: 'Telif ve Kullanım Koşulları',
    description: 'Site içeriklerinin kullanımına ilişkin koşullar ve telif bilgisi.',
    heading: 'İçeriklerin kullanımı.',
    body: 'Bu sitedeki yazı, görsel, belge ve diğer içerikler Küçükçekmece Kent Konseyi’ne aittir.\n\nİçerikler, kaynak gösterilmesi koşuluyla haber verme, bilgilendirme ve eğitim amacıyla kullanılabilir. Ticari amaçla çoğaltılması veya yeniden yayımlanması için Kent Konseyi’nden izin alınması gerekir.\n\nSitede yer alan bilgiler güncel tutulmaya çalışılır; yine de bağlayıcı işlemler için Kent Konseyi ile iletişime geçmenizi öneririz. Siteye verilen dış bağlantıların içeriğinden ilgili siteler sorumludur.',
  },
  kvkk: {
    eyebrow: 'Kurumsal', title: 'KVKK',
    description: 'Kişisel verilerin korunması, aydınlatma, çerez ve açık rıza metinlerimiz.',
    heading: 'Verileriniz bizim için emanet.',
    body: 'Kişisel verilerinizi yalnızca iletişim ve başvuru süreçlerini yürütebilmek için, yürürlükteki mevzuata uygun olarak işleriz. Aşağıdaki başlıklardan ilgili metinlere ulaşabilirsiniz.',
  },
};

const kvkkSections: { slug: string; fallback: PageCopy }[] = [
  {
    slug: 'kurumsal-kvkk-metni',
    fallback: {
      eyebrow: 'KVKK', title: '', description: '',
      heading: 'KVKK Metni',
      body: 'Küçükçekmece Kent Konseyi, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki yükümlülüklerine uygun hareket eder.',
    },
  },
  {
    slug: 'kurumsal-aydinlatma-metni',
    fallback: {
      eyebrow: 'KVKK', title: '', description: '',
      heading: 'Aydınlatma Metni',
      body: 'Kişisel verileriniz; iletişim, başvuru ve katılım süreçlerini yürütmek amacıyla, yalnızca gerekli ölçüde ve mevzuata uygun şekilde işlenir.',
    },
  },
  {
    slug: 'kurumsal-cerez-politikasi',
    fallback: {
      eyebrow: 'KVKK', title: '', description: '',
      heading: 'Çerez Politikası',
      body: 'Web sitemiz, deneyiminizi geliştirmek amacıyla sınırlı sayıda teknik çerez kullanabilir.',
    },
  },
  {
    slug: 'kurumsal-acik-riza-metni',
    fallback: {
      eyebrow: 'KVKK', title: '', description: '',
      heading: 'Açık Rıza Metni',
      body: 'Formlar aracılığıyla paylaştığınız kişisel verilerin işlenmesine ilişkin açık rızanızı, ilgili formu göndererek vermiş olursunuz.',
    },
  },
];

function KvkkSections() {
  return (
    <div className="kvkk-accordion">
      {kvkkSections.map(({ slug, fallback }) => (
        <KvkkItem slug={slug} fallback={fallback} key={slug} />
      ))}
    </div>
  );
}

function KvkkItem({ slug, fallback }: { slug: string; fallback: PageCopy }) {
  const copy = usePageContent(slug, fallback);
  return (
    <details className="kvkk-item">
      <summary>{copy.heading}</summary>
      <div className="kvkk-item-body">
        <BodyText text={copy.body} className="" />
      </div>
    </details>
  );
}

function BoardMembersSection() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoardMembers().then((data) => { setMembers(data); setLoading(false); });
  }, []);

  if (loading) return <div className="state-message">Yükleniyor…</div>;
  if (members.length === 0) return <div className="state-message">Henüz üye eklenmemiş.</div>;

  return (
    <div className="member-grid">
      {members.map((member) => (
        <div className="member-card" key={member.id}>
          <div className="member-photo">{member.photo_url && <img src={member.photo_url} alt={member.name} />}</div>
          <strong>{member.name}</strong>
          <small>{member.role}</small>
        </div>
      ))}
    </div>
  );
}

export function InstitutionalPage({ slug = 'hakkimizda' }: { slug?: string }) {
  const key = defaults[slug] ? slug : 'hakkimizda';
  const copy = usePageContent(`kurumsal-${key}`, defaults[key]);
  const showDocs = DOC_SLUGS.has(key);
  const isPresident = key === 'baskan-mesaji';
  const isBoard = key === 'yurutme-kurulu';
  const isKvkk = key === 'kvkk';
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (!showDocs) return;
    fetchDocuments('Yönetmelik').then((all) => {
      if (key === 'tuzuk') setDocs(all.filter((d) => d.title.toLowerCase().includes('tüzük')));
      else setDocs(all);
    });
  }, [key, showDocs]);


  if (isKvkk) {
    return (
      <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
        <section className="section detail-section">
          <div className="container">
            <SectionHeading eyebrow={copy.eyebrow} title={copy.heading ?? ''} text={copy.body} />
            <KvkkSections />
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section detail-section">
        <div className="container detail-grid">
          <div>
            <SectionHeading eyebrow={copy.eyebrow} title={copy.heading ?? ''} />
            <BodyText text={copy.body} />
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
            <img
              className={isPresident && copy.image_url ? 'is-portrait' : undefined}
              src={isPresident ? (copy.image_url || communityImage) : communityImage}
              alt={isPresident ? 'Kent Konseyi Başkanı' : 'Kent Konseyi çalışmaları'}
            />
            <div className="aside-note"><CheckCircle2 size={18} /><span>{isPresident ? 'Kent Konseyi Başkanı' : 'Şeffaflık, katılım ve ortak akıl'}</span></div>
          </div>
        </div>
      </section>

      {isBoard && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <SectionHeading eyebrow="Yürütme Kurulu" title="Üyeler ve görev dağılımı." />
            <BoardMembersSection />
          </div>
        </section>
      )}
    </PageShell>
  );
}
