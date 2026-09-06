'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';

function TikTokIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.68 4.61V12.7a8.28 8.28 0 005.76 2.29V11.5a4.83 4.83 0 01-3.77-1.58V6.69h3.77z"/>
    </svg>
  );
}

const socialNetworks = [
  {
    key_name: 'social_page_facebook',
    key_desc: 'social_page_facebook_desc',
    key_field: 'facebook' as const,
    followers: '12K',
    Icon: Facebook,
    color: 'bg-[#1877F2]',
    hoverColor: 'hover:bg-[#1877F2]/90',
  },
  {
    key_name: 'social_page_instagram',
    key_desc: 'social_page_instagram_desc',
    key_field: 'instagram' as const,
    followers: '8.5K',
    Icon: Instagram,
    color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    hoverColor: 'hover:opacity-90',
  },
  {
    key_name: 'social_page_twitter',
    key_desc: 'social_page_twitter_desc',
    key_field: 'twitter' as const,
    followers: '5.2K',
    Icon: Twitter,
    color: 'bg-black dark:bg-white dark:text-black',
    hoverColor: 'hover:bg-gray-800 dark:hover:bg-gray-200',
  },
  {
    key_name: 'social_page_tiktok',
    key_desc: 'social_page_tiktok_desc',
    key_field: 'tiktok' as const,
    followers: '10K',
    Icon: TikTokIcon,
    color: 'bg-black dark:bg-white dark:text-black',
    hoverColor: 'hover:bg-gray-800 dark:hover:bg-gray-200',
  },
  {
    key_name: 'social_page_linkedin',
    key_desc: 'social_page_linkedin_desc',
    key_field: 'linkedin' as const,
    followers: '3.8K',
    Icon: Linkedin,
    color: 'bg-[#0A66C2]',
    hoverColor: 'hover:bg-[#0A66C2]/90',
  },
  {
    key_name: 'social_page_tiktok',
    key_desc: 'social_page_tiktok_desc',
    followers: '10K',
    Icon: TikTokIcon,
    color: 'bg-black dark:bg-white dark:text-black',
    hoverColor: 'hover:bg-gray-800 dark:hover:bg-gray-200',
    url: '#',
  },
  {
    key_name: 'social_page_whatsapp',
    key_desc: 'social_page_whatsapp_desc',
    key_field: 'whatsapp' as const,
    followers: '15K',
    Icon: MessageCircle,
    color: 'bg-[#25D366]',
    hoverColor: 'hover:bg-[#25D366]/90',
  },
];

export default function ReseauxSociauxPage() {
  const { t } = useTranslation();
  const [socials, setSocials] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((config) => {
        setSocials({
          facebook: config.facebook || '',
          instagram: config.instagram || '',
          twitter: config.twitter || '',
          tiktok: config.tiktok || '',
          linkedin: config.linkedin || '',
          whatsapp: config.whatsapp || '',
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('social_page_title')}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('social_page_subtitle')}
          </p>
        </div>
      </section>

      {/* Social Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialNetworks.map((social) => {
              const url = socials[social.key_field];
              return (
                <Card key={social.key_name} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm group">
                  <CardContent className="p-0">
                    {/* Colored header */}
                    <div className={`${social.color} ${social.hoverColor} p-8 text-white text-center transition-colors`}>
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <social.Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold">{t(social.key_name)}</h3>
                      <p className="text-white/70 mt-1">
                        {social.followers} {t('social_page_followers')}
                      </p>
                    </div>
                    {/* Description */}
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {t(social.key_desc)}
                      </p>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <Button className="w-full bg-[#0066CC] hover:bg-[#0055AA] text-white">
                            {t('social_page_follow')}
                          </Button>
                        </a>
                      ) : (
                        <Button className="w-full bg-muted text-muted-foreground cursor-not-allowed" disabled>
                          {t('social_page_coming_soon') || 'Bientôt disponible'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}