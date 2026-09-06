'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';

function TikTokIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.68 4.61V12.7a8.28 8.28 0 005.76 2.29V11.5a4.83 4.83 0 01-3.77-1.58V6.69h3.77z"/>
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const [socials, setSocials] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((config) => {
        setSocials({
          twitter: config.twitter || '',
          instagram: config.instagram || '',
          facebook: config.facebook || '',
          tiktok: config.tiktok || '',
          whatsapp: config.whatsapp || '',
          linkedin: config.linkedin || '',
        });
      })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { key: 'twitter' as const, href: socials.twitter, label: 'X (Twitter)', Icon: Twitter },
    { key: 'instagram' as const, href: socials.instagram, label: 'Instagram', Icon: Instagram },
    { key: 'facebook' as const, href: socials.facebook, label: 'Facebook', Icon: Facebook },
    { key: 'tiktok' as const, href: socials.tiktok, label: 'TikTok', Icon: TikTokIcon },
    { key: 'whatsapp' as const, href: socials.whatsapp, label: 'WhatsApp', Icon: MessageCircle },
    { key: 'linkedin' as const, href: socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
  ];

  return (
    <footer className="bg-[#242424] text-white mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center">
              <img
                src="/pebiss-logo-rgba.png"
                alt="Pebiss"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ key, href, label, Icon }) => (
                href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2.5 bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ) : null
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-lg">{t('quick_links')}</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/annuaire" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('business_directory')}
              </Link>
              <Link href="/annonces" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('professional_ads')}
              </Link>
              <Link href="/apropos" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('footer_about')}
              </Link>
              <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('contact')}
              </Link>
              <Link href="/reseaux-sociaux" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('footer_social')}
              </Link>
              <Link href="/publicite" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('footer_ads')}
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-lg">
              {t('stats_categories')}
            </h3>
            <nav className="flex flex-col gap-3">
              <Link href="/annuaire?category=mode-textile" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('mode')}
              </Link>
              <Link href="/annuaire?category=restaurants-alimentation" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('restaurants')}
              </Link>
              <Link href="/annuaire?category=tourisme-hotellerie" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('footer_tourism')}
              </Link>
              <Link href="/annuaire?category=services-financiers" className="text-sm text-white/60 hover:text-white transition-colors">
                {t('footer_finance')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-lg">{t('contact')}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0 text-white/40 mt-0.5" />
                <span>{t('contact_page_address')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-white/40" />
                <span>{t('contact_page_phone1')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="h-4 w-4 shrink-0 text-white/40" />
                <span>{t('contact_page_email')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>{t('copyright', { year: currentYear })}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">{t('legal')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}