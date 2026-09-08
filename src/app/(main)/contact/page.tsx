'use client';

/**
 * Page /contact — refonte complète :
 *  - Cartes de coordonnées au style de la marque (bleu logo)
 *  - Formulaire FONCTIONNEL : POST /api/contact → arrive dans l'onglet
 *    « Messages » du dashboard (états chargement / succès / erreur + toasts)
 *  - Grande carte Leaflet (tuiles OpenStreetMap en <img>, sans clé API ni iframe)
 *    agrandie + bouton « Itinéraire » (Google Maps) pour être guidé jusqu'à nous
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Navigation,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

// Coordonnées du siège (Pluba - Curva de Djon Cubala, Bissau)
const MAP_LAT = 11.8817;
const MAP_LON = -15.6181;

// Carte Leaflet (JS bundlé localement + tuiles OSM en <img> — aucune iframe externe,
// fiable dans tous les environnements). ssr:false : Leaflet requiert window.
const BissauMap = dynamic(() => import('@/components/shared/bissau-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  ),
});

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_LAT},${MAP_LON}`;
const OSM_FULLSCREEN_URL = `https://www.openstreetmap.org/?mlat=${MAP_LAT}&mlon=${MAP_LON}#map=16/${MAP_LAT}/${MAP_LON}`;

const contactInfo = [
  { key_label: 'contact_page_info', key_value: 'contact_page_phone1', Icon: Phone, href: 'tel:+245956007371' },
  { key_label: null, key_value: 'contact_page_phone2', Icon: Phone, href: 'tel:+245966364944' },
  { key_label: null, key_value: 'contact_page_email', Icon: Mail, href: 'mailto:contact@pebiss.com' },
  { key_label: null, key_value: 'contact_page_address', Icon: MapPin, href: null },
] as const;

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactFormState = { name: '', email: '', phone: '', subject: '', message: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const set = (key: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation côté client
    if (form.name.trim().length < 2 || !EMAIL_RE.test(form.email.trim()) || form.message.trim().length < 5) {
      toast.error(t('contact_page_required_fields'));
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error('send failed');

      toast.success(t('contact_page_form_success_title'), {
        description: t('contact_page_form_success_msg'),
      });
      setForm(INITIAL_FORM);
      setIsSent(true);
    } catch {
      toast.error(t('contact_page_form_error_title'), {
        description: t('contact_page_form_error_msg'),
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('contact_page_title')}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('contact_page_subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Contact Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                {t('contact_page_info')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((item, idx) => {
                  const content = (
                    <Card key={idx} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#0066CC]/10 text-[#0066CC] shrink-0">
                          <item.Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          {item.key_label && (
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              {t(item.key_label)}
                            </p>
                          )}
                          <p className="text-sm font-medium text-foreground break-all">
                            {t(item.key_value)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  if (item.href) {
                    return (
                      <a key={idx} href={item.href} className="block">
                        {content}
                      </a>
                    );
                  }
                  return <div key={idx}>{content}</div>;
                })}
              </div>

              {/* Working Hours */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-100 text-green-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">
                        {t('contact_page_hours')}
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{t('contact_page_hours_week')}</p>
                        <p>{t('contact_page_hours_sat')}</p>
                        <p className="text-red-500 font-medium">{t('contact_page_hours_sun')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Contact Form — fonctionnel */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('contact_page_form')}
              </h2>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {isSent ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{t('contact_page_form_success_title')}</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t('contact_page_form_success_msg')}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setIsSent(false)}
                      >
                        {t('contact_page_form')}
                      </Button>
                    </div>
                  ) : (
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">
                            {t('contact_page_form_name')} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            placeholder={t('contact_page_name_placeholder')}
                            value={form.name}
                            onChange={set('name')}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">
                            {t('contact_page_form_email')} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder={t('contact_page_email_placeholder')}
                            value={form.email}
                            onChange={set('email')}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">{t('contact_page_form_phone')}</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder={t('contact_page_phone_placeholder')}
                            value={form.phone}
                            onChange={set('phone')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-subject">{t('contact_page_form_subject')}</Label>
                          <Input
                            id="contact-subject"
                            placeholder={t('contact_page_subject_placeholder')}
                            value={form.subject}
                            onChange={set('subject')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">
                          {t('contact_page_form_message')} <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder={t('contact_page_message_placeholder')}
                          rows={5}
                          value={form.message}
                          onChange={set('message')}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSending}
                        className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white h-11 rounded-full"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('contact_page_form_sending')}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t('contact_page_form_submit')}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map — grande carte OpenStreetMap + itinéraire */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[#0066CC]" />
                {t('contact_page_map_title')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t('contact_page_map_subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('contact_page_map_directions')}
                </Button>
              </a>
              <a
                href={OSM_FULLSCREEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" className="rounded-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:inline">{t('contact_page_map_open')}</span>
                </Button>
              </a>
            </div>
          </div>

          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-[420px] md:h-[560px]">
                <BissauMap />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
