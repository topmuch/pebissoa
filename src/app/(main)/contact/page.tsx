'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const contactInfo = [
  { key_label: 'contact_page_info', key_value: 'contact_page_phone1', Icon: Phone, href: 'tel:+245956007371' },
  { key_label: null, key_value: 'contact_page_phone2', Icon: Phone, href: 'tel:+245966364944' },
  { key_label: null, key_value: 'contact_page_email', Icon: Mail, href: 'mailto:contact@pebiss.com' },
  { key_label: null, key_value: 'contact_page_address', Icon: MapPin, href: null },
] as const;

export default function ContactPage() {
  const { t } = useTranslation();

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
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shrink-0">
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

            {/* Right: Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('contact_page_form')}
              </h2>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">{t('contact_page_form_name')}</Label>
                        <Input
                          id="contact-name"
                          placeholder={t('contact_page_name_placeholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">{t('contact_page_form_email')}</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder={t('contact_page_email_placeholder')}
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">{t('contact_page_form_subject')}</Label>
                        <Input
                          id="contact-subject"
                          placeholder={t('contact_page_subject_placeholder')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">{t('contact_page_form_message')}</Label>
                      <Textarea
                        id="contact-message"
                        placeholder={t('contact_page_message_placeholder')}
                        rows={5}
                      />
                    </div>
                    <Button className="w-full bg-[#0066CC] hover:bg-[#0055AA] text-white h-11">
                      <Send className="h-4 w-4 mr-2" />
                      {t('contact_page_form_submit')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <iframe
                title="Pebiss Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.5!2d-23.668!3d-15.597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDM1JzQ5LjIiTiAyM8KwNDAnMDQuOCJX!5e0!3m2!1sfr!2s!4v1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
