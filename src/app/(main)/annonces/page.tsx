'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BANNER_FORMATS } from '@/components/shared/banner-placement';
import {
  Megaphone,
  ImageOff,
  ChevronRight,
  RectangleHorizontal,
  LayoutGrid,
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

const CTA_TEAL = 'bg-[#35C1C1] group-hover:bg-[#28A9A9]';

/* ============ En-tête de section (style PagesJaunes) ============ */
function SectionHeader({
  icon: Icon,
  label,
  count,
  ctaLabel,
  onCta,
}: {
  icon: typeof Megaphone;
  label: string;
  count: number;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground min-w-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0066CC]/10 text-[#0066CC] shrink-0">
          <Icon className="h-5 w-5" />
        </span>
        <span className="truncate">{label}</span>
      </h2>
      <div className="flex items-center gap-2 shrink-0">
        {ctaLabel && onCta && (
          <button
            onClick={onCta}
            className="hidden sm:inline-flex h-9 px-4 items-center rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-semibold text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors whitespace-nowrap"
          >
            {ctaLabel}
          </button>
        )}
        <span className="inline-flex h-9 px-3.5 items-center rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-semibold text-muted-foreground whitespace-nowrap">
          {count}
        </span>
      </div>
    </div>
  );
}

/* ============ Carte bannière large — style PagesJaunes horizontal ============ */
function PjWideBannerCard({ banner }: { banner: Banner }) {
  const { t, locale } = useTranslation();
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 728, h: 90, usage: '', isWide: true };

  const content = (
    <div className="group flex flex-col sm:flex-row bg-white dark:bg-card rounded-lg border border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Visuel — object-contain pour préserver l'intégrité de la publicité */}
      <div className="sm:w-[52%] shrink-0 bg-muted relative flex items-center justify-center p-3 min-h-[120px]">
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            loading="lazy"
            className="max-h-28 sm:max-h-36 w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-28 sm:h-32">
            <ImageOff className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="flex-1 flex flex-col gap-1.5 p-4">
        <span className="self-start text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          {fmt.label}
        </span>
        <h3 className="font-bold text-sm text-foreground line-clamp-1">{banner.title}</h3>
        {banner.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{banner.description}</p>
        )}
        <div className="mt-auto pt-2">
          <span className={`inline-flex items-center gap-1.5 ${CTA_TEAL} text-white text-[13px] font-bold px-6 py-2 rounded-full transition-colors`}>
            {t('banners_view_details')}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
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

/* ============ Carte bannière carrée / verticale — style PagesJaunes vertical ============ */
function PjGridBannerCard({ banner }: { banner: Banner }) {
  const { t, locale } = useTranslation();
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 336, h: 280, usage: '', isWide: false };
  // Bannières hautes (300x600) : hauteur plafonnée pour ne pas écraser la grille
  const isTall = fmt.h / fmt.w >= 2;

  const content = (
    <div className="group h-full flex flex-col bg-white dark:bg-card rounded-lg border border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Visuel — object-contain pour préserver l'intégrité de la publicité */}
      <div
        className="relative bg-muted flex items-center justify-center p-3 overflow-hidden"
        style={isTall ? { height: '380px' } : { aspectRatio: `${fmt.w} / ${fmt.h}` }}
      >
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <ImageOff className="h-8 w-8 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground font-medium">{fmt.label}</span>
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="flex-1 flex flex-col gap-1.5 p-3.5">
        <span className="self-start text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          {fmt.label}
        </span>
        <h3 className="font-bold text-sm text-foreground line-clamp-1">{banner.title}</h3>
        {banner.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{banner.description}</p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            {locale === 'pt' ? 'Anúncio patrocinado' : 'Annonce sponsorisée'}
          </p>
        )}
        <div className="mt-auto pt-2.5">
          <span className={`block w-full text-center ${CTA_TEAL} text-white text-[13px] font-bold py-2 rounded-full transition-colors`}>
            {locale === 'pt' ? 'Ver o anúncio' : "Voir l'annonce"}
          </span>
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

export default function AnnoncesPage() {
  const { t, locale } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const chipsRef = useRef<HTMLDivElement>(null);

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['banners-all'],
    queryFn: () => fetch('/api/banners?position=all').then((r) => r.json()),
  });

  const filteredBanners = activeFilter === 'all'
    ? (banners || [])
    : (banners || []).filter((b) => b.format === activeFilter);

  const wideBanners = filteredBanners.filter((b) => (BANNER_FORMATS[b.format]?.isWide ?? b.format === '728x90'));
  const gridBanners = filteredBanners.filter((b) => !(BANNER_FORMATS[b.format]?.isWide ?? b.format === '728x90'));

  const allWide = (banners || []).filter((b) => (BANNER_FORMATS[b.format]?.isWide ?? b.format === '728x90'));
  const allGrid = (banners || []).filter((b) => !(BANNER_FORMATS[b.format]?.isWide ?? b.format === '728x90'));

  const formatTabs = [
    { value: 'all', label: t('banners_filter_all') },
    ...Object.entries(BANNER_FORMATS).map(([key, fmt]) => ({
      value: key,
      label: fmt.label,
    })),
  ];

  return (
    <div className="min-h-[60vh]">
      {/* ============ Bandeau bleu — couleur du logo ============ */}
      <div className="bg-[#0066CC]">
        <div className="container mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            {locale === 'pt' ? (
              <>
                Boas{' '}
                <span className="inline-block bg-white text-[#0066CC] px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  Promoções
                </span>{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-white/80 leading-none">?</span>
              </>
            ) : (
              <>
                Des{' '}
                <span className="inline-block bg-white text-[#0066CC] px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  Bons plans
                </span>{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-white/80 leading-none">?</span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* ============ Sous-barre grise ============ */}
      <div className="bg-gray-100 dark:bg-muted/50 border-b border-border/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">
            {isLoading
              ? '…'
              : `${filteredBanners.length} ${locale === 'pt' ? 'anúncios ativos' : 'annonces actives'}`}
          </p>
          <a
            href="/publicite"
            className="shrink-0 h-8 px-3.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-border text-[13px] font-medium text-gray-900 dark:text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors inline-flex items-center"
          >
            {locale === 'pt' ? 'Publicar a minha publicidade' : 'Publier ma publicité'}
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* ============ Chips de formats — style PagesJaunes ============ */}
        <div className="relative mt-5">
          <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pr-9">
            {formatTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                aria-pressed={activeFilter === tab.value}
                className={`h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all ${
                  activeFilter === tab.value
                    ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background border-gray-900 dark:border-transparent'
                    : 'bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground hover:border-gray-900 dark:hover:border-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => chipsRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            aria-label={locale === 'pt' ? 'Mais formatos' : 'Plus de formats'}
            className="hidden sm:inline-flex absolute right-0 top-0 h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Chargement */}
        {isLoading && (
          <div className="mt-6 space-y-8">
            <div>
              <Skeleton className="h-7 w-64 mb-4" />
              <Skeleton className="w-full h-36 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-7 w-64 mb-4" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-white dark:bg-card rounded-lg border border-border/70 overflow-hidden">
                    <Skeleton className="w-full aspect-[6/5] rounded-none" />
                    <div className="p-3.5 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-8 w-full rounded-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vide */}
        {!isLoading && filteredBanners.length === 0 && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-white dark:bg-card py-16 px-6 text-center">
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
              <Button className="bg-gray-900 hover:bg-black text-white rounded-full h-10 px-6">
                {locale === 'pt' ? 'Quero anunciar' : 'Je veux faire ma publicité'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        )}

        {/* ============ Affichage — sections style PagesJaunes ============ */}
        {!isLoading && filteredBanners.length > 0 && (
          <div className="mt-6 space-y-10">
            {/* Filtre « tout » : 2 sections par forme */}
            {activeFilter === 'all' && (
              <>
                {allWide.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={RectangleHorizontal}
                      label={locale === 'pt' ? 'Banners largos' : 'Bannières larges'}
                      count={allWide.length}
                    />
                    <div className="space-y-4">
                      {allWide.map((banner) => (
                        <PjWideBannerCard key={banner.id} banner={banner} />
                      ))}
                    </div>
                  </section>
                )}

                {allGrid.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={LayoutGrid}
                      label={locale === 'pt' ? 'Banners quadrados & verticais' : 'Bannières carrées & verticales'}
                      count={allGrid.length}
                    />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                      {allGrid.map((banner) => (
                        <PjGridBannerCard key={banner.id} banner={banner} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Filtre spécifique : un seul flux */}
            {activeFilter !== 'all' && (
              <>
                {wideBanners.length > 0 && (
                  <div className="space-y-4">
                    {wideBanners.map((banner) => (
                      <PjWideBannerCard key={banner.id} banner={banner} />
                    ))}
                  </div>
                )}
                {gridBanners.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {gridBanners.map((banner) => (
                      <PjGridBannerCard key={banner.id} banner={banner} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
