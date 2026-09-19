import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading, usePageContent } from '@/pages/shared';
import { fetchDocuments } from '@/lib/data/documents';
import { DOCUMENT_CATEGORIES, type DocumentItem } from '@/lib/supabase';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const copy = usePageContent('belgeler', {
    eyebrow: 'Arşiv',
    title: 'Belgeler',
    description: 'Tüzük, yönetmelik, rapor, karar ve çalışma belgeleri.',
    heading: 'Açık ve erişilebilir bilgi.',
    body: 'Kent Konseyi çalışmalarına ilişkin güncel belgeleri aşağıdan inceleyebilir veya indirebilirsiniz.',
  });

  useEffect(() => {
    fetchDocuments().then((data) => { setDocuments(data); setLoading(false); });
  }, []);

  const visible = activeCategory ? documents.filter((d) => d.category === activeCategory) : documents;

  return (
    <PageShell title={copy.title} eyebrow={copy.eyebrow} description={copy.description}>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Belge arşivi" title={copy.heading ?? ''} text={copy.body} />

          <div className="tab-row">
            <button className={`tab-button ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>Tümü</button>
            {DOCUMENT_CATEGORIES.map((category) => (
              <button className={`tab-button ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} key={category}>{category}</button>
            ))}
          </div>

          {loading ? (
            <div className="state-message">Yükleniyor…</div>
          ) : visible.length === 0 ? (
            <div className="state-message">Bu kategoride henüz belge eklenmemiş.</div>
          ) : (
            <div className="document-list">
              {visible.map((doc) => (
                <a className="document-row" href={doc.file_url} target="_blank" rel="noreferrer" key={doc.id}>
                  <FileText size={20} />
                  <span><strong>{doc.title}</strong><small>{doc.category} · {doc.published_at}</small></span>
                  <Download size={17} />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
