'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  ExternalLink,
  ImageOff,
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

// Professional banner formats per IAB standards
const BANNER_FORMATS: Record<string, { label: string; w: number; h: number; usage: string; isWide: boolean }> = {
  '728x90': { label: '728 × 90', w: 728, h: 90, usage: 'Leaderboard (avant footer)', isWide: true },
  '336x280': { label: '336 × 280', w: 336, h: 280, usage: 'Rectangle (accueil milieu)', isWide: false },
  '300x600': { label: '300 × 600', w: 300, h: 600, usage: 'Sidebar (détail annonce)', isWide: false },
};

export default function AnnoncesPage() {
  const { t } = useTranslation();
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
      {/* Page Header */}
      <div className="pebiss-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LayoutGrid className="h-8 w-8 text-white/80" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t('banners_page_title')}
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('banners_page_subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {formatTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeFilter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(tab.value)}
              className={
                activeFilter === tab.value
                  ? 'bg-pebiss-orange hover:bg-pebiss-orange/90 text-white'
                  : ''
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {t('banners_count', { count: filteredBanners.length })}
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="w-full h-[90px] md:h-[100px] rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="border-border/40">
                  <CardContent className="p-0">
                    <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-9 w-28 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBanners.length === 0 && (
          <Card className="border-border/40">
            <CardContent className="py-20 px-6 text-center">
              <Megaphone className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('banners_no_results')}
              </h3>
              <p className="text-muted-foreground">
                {t('banners_no_results_desc')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Banners Display */}
        {!isLoading && filteredBanners.length > 0 && (
          <div className="space-y-8">
            {/* Wide banners (header/banner formats) */}
            {wideBanners.length > 0 && (
              <div className="space-y-4">
                {wideBanners.map((banner) => (
                  <BannerCard key={banner.id} banner={banner} isWide />
                ))}
              </div>
            )}

            {/* Grid banners (square/rectangle formats) */}
            {gridBanners.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridBanners.map((banner) => (
                  <BannerCard key={banner.id} banner={banner} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BannerCard({ banner, isWide = false }: { banner: Banner; isWide?: boolean }) {
  const { t } = useTranslation();
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 300, h: 250, usage: '', isWide: false };
  const aspectRatio = `${fmt.w}/${fmt.h}`;

  const content = (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/40 overflow-hidden h-full">
      <CardContent className="p-0">
        {/* Image */}
        {banner.image ? (
          <div className="relative overflow-hidden" style={{
            aspectRatio: isWide ? undefined : aspectRatio,
            maxHeight: isWide ? '200px' : undefined,
          }}>
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={isWide ? { aspectRatio, width: '100%', height: '100%' } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-medium">
                {fmt.label}
              </Badge>
              <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                {fmt.usage}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-semibold text-sm md:text-base drop-shadow-md">{banner.title}</h3>
            </div>
          </div>
        ) : (
          <div className="bg-muted flex items-center justify-center" style={{ aspectRatio, minHeight: '120px' }}>
            <div className="text-center">
              <ImageOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">{fmt.label}</span>
            </div>
          </div>
        )}

        {/* Description + CTA */}
        <div className="p-4">
          {banner.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {banner.description}
            </p>
          )}
          {banner.link && (
            <Button
              variant="outline"
              size="sm"
              className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white border-pebiss-orange text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(banner.link!, '_blank');
              }}
            >
              {t('banners_view_details')}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (banner.link && !banner.link.startsWith('#')) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
