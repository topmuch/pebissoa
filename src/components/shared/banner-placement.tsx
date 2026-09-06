'use client';

import { useQuery } from '@tanstack/react-query';

// Banner format definitions — 4 placements only
export const BANNER_FORMATS: Record<string, { label: string; w: number; h: number; usage: string; isWide: boolean }> = {
  '336x280':  { label: '336 × 280',  w: 336,  h: 280,  usage: 'Accueil (milieu)',          isWide: false },
  '728x90':   { label: '728 × 90',   w: 728,  h: 90,   usage: 'Accueil (avant footer)',    isWide: true  },
  '300x600':  { label: '300 × 600',  w: 300,  h: 600,  usage: 'Détail (sidebar)',          isWide: false },
  'detail_728x90': { label: '728 × 90', w: 728, h: 90, usage: 'Détail (avant footer)',    isWide: true  },
};

// Map old format "728x90" used for enterprise footer to the new key
// Both share the same dimensions but have different position context
export const FORMAT_OPTIONS = [
  { key: '336x280',       label: 'Page d\'accueil — Milieu',             dimensions: '336 × 280' },
  { key: '728x90',        label: 'Page d\'accueil — Avant footer',       dimensions: '728 × 90'  },
  { key: '300x600',       label: 'Page détail — Sidebar',                dimensions: '300 × 600' },
  { key: 'detail_728x90', label: 'Page détail — Avant footer',           dimensions: '728 × 90'  },
];

interface BannerData {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  link?: string | null;
  type: string;
  position: string;
  format: string;
}

// BannerCard — fully responsive banner that scales to container width
function BannerCard({ banner, className = '' }: { banner: BannerData; className?: string }) {
  const fmt = BANNER_FORMATS[banner.format] || { label: banner.format, w: 336, h: 280, usage: '', isWide: false };

  const content = (
    <div
      className={`relative overflow-hidden rounded-lg group cursor-pointer hover:shadow-lg transition-all duration-300 w-full ${className}`}
      style={{ aspectRatio: `${fmt.w} / ${fmt.h}` }}
    >
      {banner.image ? (
        <>
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-sm leading-tight drop-shadow-md">{banner.title}</h3>
            {banner.description && (
              <p className="text-white/70 text-xs mt-1 line-clamp-1">{banner.description}</p>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <span className="text-[10px] text-white/40 uppercase font-medium">{fmt.label}</span>
            <h3 className="text-white font-semibold text-sm mt-1">{banner.title}</h3>
          </div>
        </div>
      )}
    </div>
  );

  if (banner.link) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full">
        {content}
      </a>
    );
  }
  return content;
}

// Hook to fetch banners by position and optional format
export function useBanners(position: string, format?: string) {
  return useQuery<BannerData[]>({
    queryKey: ['banners', position, format],
    queryFn: () => {
      const params = new URLSearchParams({ position });
      if (format) params.set('format', format);
      return fetch(`/api/banners?${params}`).then(r => r.json()).then(d => Array.isArray(d) ? d : []);
    },
  });
}

// HomepageMidBanner — all 336x280 banners below categories on homepage
// Displays a responsive grid with "Offres Sponsorisées" title
export function HomepageMidBanner() {
  const { data: banners, isLoading } = useBanners('home', '336x280');

  if (isLoading) return null;
  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-orange-300 to-transparent" />
          <h2 className="text-lg md:text-xl font-bold text-orange-600 whitespace-nowrap">
            ⭐ Offres Sponsorisées
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-orange-300 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {banners.map((banner) => (
            <BannerCard key={banner.id} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  );
}

// HomepageFooterBanner — 728x90 leaderboard before footer on homepage
// Desktop: full width | Mobile: full width, scales down maintaining aspect ratio
export function HomepageFooterBanner() {
  const { data: banners } = useBanners('home', '728x90');

  if (!banners || banners.length === 0) return null;

  return (
    <div className="container mx-auto px-4 pb-8">
      <BannerCard banner={banners[0]} />
    </div>
  );
}

// EnterpriseSidebarBanner — 300x600 sidebar banner on enterprise detail page
// Desktop: fills sidebar width | Mobile: horizontal banner (limit height, maintain visual)
export function EnterpriseSidebarBanner() {
  const { data: banners } = useBanners('enterprise', '300x600');

  if (!banners || banners.length === 0) return null;

  return (
    <div className="space-y-4">
      {banners.slice(0, 2).map((banner) => (
        <div key={banner.id} className="lg:w-full">
          {/* Mobile: horizontal banner with max-height | Desktop: full sidebar 300x600 */}
          <a
            href={banner.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <div className="relative overflow-hidden rounded-lg group cursor-pointer hover:shadow-lg transition-all duration-300 w-full">
              {banner.image ? (
                <>
                  {/* Mobile: square-ish aspect, max-h-[280px] | Desktop: 300x600 */}
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-auto max-h-[280px] lg:max-h-none lg:aspect-[300/600] object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm leading-tight drop-shadow-md">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-white/70 text-xs mt-1 line-clamp-1">{banner.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full aspect-[300/250] lg:aspect-[300/600] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                  <div className="text-center">
                    <span className="text-[10px] text-white/40 uppercase font-medium">300 × 600</span>
                    <h3 className="text-white font-semibold text-sm mt-1">{banner.title}</h3>
                  </div>
                </div>
              )}
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

// EnterpriseFooterBanner — 728x90 banner before footer on enterprise detail page
// Desktop: spans full grid width | Mobile: full width, scales down
export function EnterpriseFooterBanner() {
  const { data: banners } = useBanners('enterprise', 'detail_728x90');

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full py-4">
      <BannerCard banner={banners[0]} />
    </div>
  );
}

export { BannerCard };
