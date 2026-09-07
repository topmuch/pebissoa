'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  ExternalLink,
  ImageOff,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  link?: string | null;
  type: string;
  position: string;
  format: string;
  createdAt: string;
}

// Professional banner formats per IAB standards
const BANNER_FORMATS: Record<string, { label: string; w: number; h: number; usage: string; isWide: boolean }> = {
  '728x90': { label: '728 × 90', w: 728, h: 90, usage: 'Leaderboard (avant footer)', isWide: true },
  '336x280': { label: '336 × 280', w: 336, h: 280, usage: 'Rectangle (accueil milieu)', isWide: false },
  '300x600': { label: '300 × 600', w: 300, h: 600, usage: 'Sidebar (détail annonce)', isWide: false },
};

export default function AnnoncesPage() {
  const { t, locale } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['banners-all'],
    queryFn: () => fetch('/api/banners?position=all').then((r) => r.json()),
  });

  const filteredBanners = activeFilter === 'all'
    ? (banners || [])
    : (banners || []).filter((b) => b.format === activeFilter || (!b.format && activeFilter === '300x250'));

  const formatTabs = [
    { value: 'all', label: t('banners_filter_all') },
    ...Object.entries(BANNER_FORMATS).map(([key, fmt]) => ({
      value: key,
      label: `${fmt.label}`,
    })),
  ];

  const wideBanners = filteredBanners.filter((b) => b.format === '728x90');
  const gridBanners = filteredBanners.filter((b) => b.format === '336x280' || b.format === '300x600');

  return (
    <div className="min-h-[60vh]">
      {/* Page Header — dégradé + cercles décoratifs */}
      <div className="pebiss-gradient relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-8 right-1/4 h-14 w-14 rounded-full bg-white/10 hidden md:block pointer-events-none" />
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-20 text-center relative">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm mb-4 shadow-inner">
            <Megaphone className="h-7 w-7 text-white" />
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">
            {t('banners_page_title')}
          </h1>
          <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto">
            {t('banners_page_subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* Toolbar — pastilles de filtre + compteur */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {formatTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                aria-pressed={activeFilter === tab.value}
                className={`h-9 px-4 rounded-full text-sm font-medium border transition-all duration-300 ${
                  activeFilter === tab.value
                    ? 'bg-pebiss-orange text-white border-pebiss-orange shadow-md'
                    : 'bg-white dark:bg-card text-muted-foreground border-border hover:border-pebiss-orange/50 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t('banners_count', { count: filteredBanners.length })}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="w-full h-28 sm:h-36 md:h-44 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                  <Skeleton className="w-full aspect-[6/5] rounded-none" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBanners.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-white dark:bg-card py-16 px-6 text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
              <Megaphone className="h-9 w-9 text-muted-foreground/40" />
            </span>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('banners_no_results')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('banners_no_results_desc')}
            </p>
            <a href="/publicite">
              <Button className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white rounded-full h-10 px-6">
                {locale === 'pt' ? 'Quero anunciar' : 'Je veux faire ma publicité'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        )}

        {/* Banners Display */}
        {!isLoading && filteredBanners.length > 0 && (
          <div className="space-y-8">
            {/* Wide banners (header/banner formats) */}
            {wideBanners.length > 0 && (
              <div className="space-y-4">
                {wideBanners.map((banner) => (
                  <WideBannerCard key={banner.id} banner={banner} />
                ))}
              </div>
            )}

            {/* Grid banners (square/rectangle formats) */}
            {gridBanners.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {gridBanners.map((banner) => (
                  <GridBannerCard key={banner.id} banner={banner} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Bannière large (728x90) — pleine largeur, overlay à gauche ============ */
function WideBannerCard({ banner }: { banner: Banner }) {
  const { t } = useTranslation();
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 728, h: 90, usage: '', isWide: true };

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-card cursor-pointer">
      <div className="relative h-28 sm:h-36 md:h-44 overflow-hidden bg-muted">
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-white/30" />
          </div>
        )}
        {/* Voile pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Texte */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col items-start justify-center">
          <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-card/95 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm mb-2">
            <LayoutGrid className="h-3 w-3" />
            {fmt.label}
          </span>
          <h3 className="text-white font-extrabold text-lg sm:text-xl md:text-2xl leading-tight drop-shadow-md max-w-[75%]">
            {banner.title}
          </h3>
          {banner.description && (
            <p className="text-white/80 text-xs md:text-sm line-clamp-1 mt-1 max-w-[65%]">
              {banner.description}
            </p>
          )}
        </div>

        {/* Flèche CTA à droite (desktop) */}
        <span className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white text-pebiss-orange items-center justify-center shadow-lg group-hover:translate-x-1 group-hover:bg-pebiss-orange group-hover:text-white transition-all duration-300">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </div>
  );

  if (banner.link && !banner.link.startsWith('#')) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block" aria-label={banner.title}>
        {content}
      </a>
    );
  }
  return content;
}

/* ============ Bannière grille (336x280 / 300x600) — carte avec image + corps ============ */
function GridBannerCard({ banner }: { banner: Banner }) {
  const { t, locale } = useTranslation();
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 300, h: 250, usage: '', isWide: false };
  // Bannières hautes (300x600) : hauteur plafonnée pour ne pas écraser la grille
  const isTall = fmt.h / fmt.w >= 2;

  const content = (
    <div className="group h-full flex flex-col bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Image au ratio du format */}
      <div
        className="relative overflow-hidden bg-muted"
        style={isTall ? { height: '400px' } : { aspectRatio: `${fmt.w} / ${fmt.h}` }}
      >
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-accent/40">
            <ImageOff className="h-9 w-9 text-muted-foreground/30 mb-2" />
            <span className="text-xs text-muted-foreground font-medium">{fmt.label}</span>
          </div>
        )}
        {/* Voile bas */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {/* Format — pastille en haut à gauche */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 dark:bg-card/95 backdrop-blur-sm text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {fmt.label}
        </span>
        {/* Titre sur l'image */}
        <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm md:text-base leading-tight drop-shadow-md line-clamp-2">
          {banner.title}
        </h3>
      </div>

      {/* Corps */}
      <div className="flex-1 flex flex-col p-4">
        {banner.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {banner.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">
            {locale === 'pt' ? 'Anúncio patrocinado' : 'Annonce sponsorisée'}
          </p>
        )}

        {/* Pied : usage + CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground/70 font-medium truncate">
            {fmt.usage}
          </span>
          {banner.link && (
            <span className="inline-flex shrink-0 items-center gap-1.5 bg-pebiss-orange/10 text-pebiss-orange text-xs font-bold px-3.5 py-2 rounded-full group-hover:bg-pebiss-orange group-hover:text-white transition-all duration-300">
              {t('banners_view_details')}
              <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (banner.link && !banner.link.startsWith('#')) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={banner.title}>
        {content}
      </a>
    );
  }
  return content;
}
