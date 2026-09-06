'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

// HomepageMidBanner — horizontal sliding banner (carousel) below the hero on homepage
// Auto-slides every 4s, pause on hover, arrows + dots + touch swipe support
export function HomepageMidBanner() {
  const { data: banners, isLoading } = useBanners('home', '336x280');
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const movedRef = useRef(false);
  const count = banners?.length ?? 0;

  const next = useCallback(() => setIndex((i) => (count > 0 ? (i + 1) % count : 0)), [count]);
  const prev = useCallback(() => setIndex((i) => (count > 0 ? (i - 1 + count) % count : 0)), [count]);

  // Auto-slide every 4 seconds (paused on hover / touch)
  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [count, isPaused, next]);

  // Reset index when the banner list shrinks
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

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

        <div
          className="group relative overflow-hidden rounded-lg shadow-sm select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            movedRef.current = false;
            setIsPaused(true);
          }}
          onTouchMove={(e) => {
            if (touchStartX.current !== null && Math.abs(e.touches[0].clientX - touchStartX.current) > 10) {
              movedRef.current = true;
            }
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current !== null && count > 1) {
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40) {
                if (dx < 0) next(); else prev();
                // Suppress the accidental tap on the slide link right after a swipe
                setTimeout(() => { movedRef.current = false; }, 100);
              }
            }
            touchStartX.current = null;
            setIsPaused(false);
          }}
          onClickCapture={(e) => {
            if (movedRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {/* Sliding track */}
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {banners.map((banner) => {
              const slide = (
                <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden">
                  {banner.image ? (
                    <>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-2 left-0 right-0 p-3 pr-24">
                        <span className="inline-block bg-orange-500 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded mb-1.5">
                          Sponsorisé
                        </span>
                        <h3 className="text-white font-semibold text-base md:text-lg leading-tight drop-shadow-md">
                          {banner.title}
                        </h3>
                        {banner.description && (
                          <p className="text-white/80 text-xs md:text-sm mt-1 line-clamp-1">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                      <div className="text-center">
                        <span className="text-[10px] text-white/40 uppercase font-medium">Publicité</span>
                        <h3 className="text-white font-semibold text-lg mt-1">{banner.title}</h3>
                      </div>
                    </div>
                  )}
                </div>
              );

              return banner.link ? (
                <a
                  key={banner.id}
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full shrink-0"
                >
                  {slide}
                </a>
              ) : (
                <div key={banner.id} className="w-full shrink-0">
                  {slide}
                </div>
              );
            })}
          </div>

          {/* Arrows (desktop, visible on hover) */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Bannière précédente"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity min-w-[36px] min-h-[36px] items-center justify-center hidden sm:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Bannière suivante"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity min-w-[36px] min-h-[36px] items-center justify-center hidden sm:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Dots */}
          {count > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Aller à la bannière ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
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
