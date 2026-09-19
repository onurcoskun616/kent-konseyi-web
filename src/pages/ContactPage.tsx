import { useState } from 'react';
import { Loader2, Mail, MapPin, Send } from 'lucide-react';
import { PageShell } from '@/components/SiteLayout';
import { SectionHeading } from '@/pages/shared';
import { submitContactForm } from '@/lib/data/contact';
import { CONTACT_SUBMISSION_TYPES } from '@/lib/supabase';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<string>(CONTACT_SUBMISSION_TYPES[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    try {
      await submitContactForm({ type, name, email, message });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setType(CONTACT_SUBMISSION_TYPES[0]);
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell title="Katılım / İletişim" eyebrow="Söz sende" description="Fikrinizi, önerinizi, gönüllülük başvurunuzu ve sorularınızı bize iletin.">
      <section className="section">
        <div className="container contact-grid">
          <div>
            <SectionHeading eyebrow="Bize ulaşın" title="Kent için sözünüzü paylaşın." text="Sizi dinlemek, birlikte üretmek ve Küçükçekmece’nin geleceğine katkı sunmak için buradayız." />
            <div className="contact-info">
              <p><MapPin size={18} /> Atatürk Mah. Kent Konseyi Merkezi<br />Küçükçekmece / İstanbul</p>
              <p><Mail size={18} /> info@kucukcekmecekentkonseyi.org</p>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            {status === 'success' && <div className="notice success">Mesajınız alındı, en kısa sürede size dönüş yapacağız.</div>}
            {status === 'error' && <div className="notice error">Bir şeyler ters gitti, lütfen tekrar deneyin.</div>}
            <label>Ad Soyad<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>E-posta<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Başvuru türü
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {CONTACT_SUBMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Mesajınız<textarea required value={message} onChange={(e) => setMessage(e.target.value)} /></label>
            <button className="button button-dark" type="submit" disabled={sending}>
              {sending ? <Loader2 size={16} className="spin" /> : <><Send size={16} /> Gönder</>}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
