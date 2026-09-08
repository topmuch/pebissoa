'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

// Banner format definitions — 6 placements
export const BANNER_FORMATS: Record<string, { label: string; w: number; h: number; usage: string; isWide: boolean }> = {
  '336x280':  { label: '336 × 280',  w: 336,  h: 280,  usage: 'Accueil (milieu)',          isWide: false },
  '728x90':   { label: '728 × 90',   w: 728,  h: 90,   usage: 'Accueil (avant footer)',    isWide: true  },
  '300x600':  { label: '300 × 600',  w: 300,  h: 600,  usage: 'Détail (sidebar)',          isWide: false },
  'detail_728x90': { label: '728 × 90', w: 728, h: 90, usage: 'Détail (avant footer)',    isWide: true  },
  'promo_gauche': { label: '1440 × 720', w: 1440, h: 720, usage: 'Accueil — Carrousel promo (gauche)', isWide: true },
  'promo_droite': { label: '1440 × 720', w: 1440, h: 720, usage: 'Accueil — Bannière droite (même taille que la gauche)', isWide: true },
};

// Map old format "728x90" used for enterprise footer to the new key
// Both share the same dimensions but have different position context
export const FORMAT_OPTIONS = [
  { key: '336x280',       label: 'Page d\'accueil — Milieu',             dimensions: '336 × 280' },
  { key: '728x90',        label: 'Page d\'accueil — Avant footer',       dimensions: '728 × 90'  },
  { key: '300x600',       label: 'Page détail — Sidebar',                dimensions: '300 × 600' },
  { key: 'detail_728x90', label: 'Page détail — Avant footer',           dimensions: '728 × 90'  },
  { key: 'promo_gauche',  label: 'Page d\'accueil — Carrousel promo (gauche)', dimensions: '1440 × 720' },
  { key: 'promo_droite',  label: 'Page d\'accueil — Bannière droite',    dimensions: '1440 × 720' },
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

// —— Slides du carrousel promo (bannière gauche sous le hero) ——
const PROMO_SLIDES = [
  {
    href: '/register',
    image: '/banners/promo-business.jpg',
    alt: {
      fr: 'Entrepreneure africaine dans sa boutique — inscrivez votre entreprise sur Pebiss',
      pt: 'Empreendedora africana na sua loja — registe a sua empresa no Pebiss',
      en: 'African entrepreneur in her shop — list your business on Pebiss',
    },
    title: {
      fr: 'Référencez votre entreprise',
      pt: 'Registe a sua empresa',
      en: 'List your business',
    },
    highlight: {
      fr: '100% gratuitement',
      pt: '100% grátis',
      en: '100% free',
    },
    cta: { fr: "J'INSCRIS MON ENTREPRISE", pt: 'REGISTAR A MINHA EMPRESA', en: 'LIST MY BUSINESS' },
  },
  {
    href: '/annuaire',
    image: '/banners/promo-visibilite.jpg',
    alt: {
      fr: 'Commerçant souriant dans sa boutique avec des clients — soyez visible sur Pebiss',
      pt: 'Comerciante sorridente na sua loja com clientes — esteja visível no Pebiss',
      en: 'Smiling shopkeeper in his store with customers — get visible on Pebiss',
    },
    title: {
      fr: 'Des milliers de clients',
      pt: 'Milhares de clientes',
      en: 'Thousands of customers',
    },
    highlight: {
      fr: 'vous trouvent chaque jour',
      pt: 'encontram a sua empresa',
      en: 'find you every day',
    },
    cta: { fr: "DÉCOUVREZ L'ANNUAIRE", pt: 'DESCOBRIR O DIRETÓRIO', en: 'EXPLORE THE DIRECTORY' },
  },
  {
    href: '/annonces',
    image: '/banners/promo-annonces.jpg',
    alt: {
      fr: 'Vendeuse photographiant ses produits au marché avec un smartphone — publiez vos annonces gratuites',
      pt: 'Vendedora a fotografar os seus produtos no mercado com um smartphone — publique os seus anúncios grátis',
      en: 'Vendor photographing her market products with a smartphone — post your free ads',
    },
    title: {
      fr: 'Vendez plus vite avec vos',
      pt: 'Venda mais rápido com os seus',
      en: 'Sell faster with your',
    },
    highlight: {
      fr: 'annonces gratuites',
      pt: 'anúncios grátis',
      en: 'free ads',
    },
    cta: { fr: 'PUBLIER UNE ANNONCE', pt: 'PUBLICAR UM ANÚNCIO', en: 'POST AN AD' },
  },
] as const;

const SLIDE_INTERVAL_MS = 5000;

// —— Slide résolue (textes selon la langue) ——
interface ResolvedSlide {
  key: string;
  href: string;
  image: string;
  alt: string;
  title: string;
  highlight?: string;
  cta?: string;
  description?: string;
  isAd?: boolean;
}

// PromoSlider — carrousel auto : affiche les publicités publiées depuis l'admin
// (format « promo_gauche ») si elles existent, sinon les 3 slides promo par défaut.
// Points de navigation, flèches au survol, pause au survol, balayage tactile,
// respect de prefers-reduced-motion.
function PromoSlider() {
  const { locale, tl } = useTranslation();
  const { data: adBanners } = useBanners('home', 'promo_gauche');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  const adSlides: ResolvedSlide[] = (adBanners || [])
    .filter((b) => !!b.image)
    .map((b) => ({
      key: b.id,
      href: b.link || '#',
      image: b.image as string,
      alt: b.title,
      title: b.title,
      description: b.description || undefined,
      isAd: true,
    }));

  const defaultSlides: ResolvedSlide[] = PROMO_SLIDES.map((slide) => ({
    key: slide.href,
    href: slide.href,
    image: slide.image,
    alt: slide.alt[locale],
    title: tl(slide.title),
    highlight: tl(slide.highlight),
    cta: tl(slide.cta),
  }));

  const slides = adSlides.length > 0 ? adSlides : defaultSlides;
  const total = slides.length;
  // Index actif sûr (évite un setState dans un effet quand la liste change)
  const safeActive = total > 0 ? ((active % total) + total) % total : 0;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current || total <= 1) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const goTo = (i: number) => setActive(((i % total) + total) % total);

  return (
    <div
      className="group relative block overflow-hidden rounded-xl h-72 sm:h-80 md:h-96"
      role="region"
      aria-roledescription="carrousel"
      aria-label={tl({ fr: 'Promotions Pebiss', pt: 'Promoções Pebiss', en: 'Pebiss promotions' })}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current !== null) {
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) goTo(active + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }
        setPaused(false);
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === safeActive;
        return (
          <a
            key={slide.key}
            href={slide.href}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            tabIndex={isActive ? 0 : -1}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover object-right transition-transform ease-out ${
                isActive ? 'scale-105 duration-[7000ms]' : 'scale-100 duration-700'
              }`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />

            {slide.isAd ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 sm:p-6 pt-12">
                <h3 className="text-white font-extrabold text-lg sm:text-2xl leading-tight drop-shadow-md">
                  {slide.title}
                </h3>
                {slide.description && (
                  <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">{slide.description}</p>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col items-start">
                <span className="bg-red-600 text-white font-extrabold text-xs sm:text-sm md:text-base px-3 py-1.5 leading-none inline-flex items-center gap-1 rounded-sm">
                  PEBISS <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>

                <p className="mt-3 sm:mt-4 text-white font-extrabold uppercase leading-tight text-lg sm:text-2xl md:text-3xl drop-shadow-md max-w-[75%]">
                  {slide.title}{' '}
                  <span className="text-[#4D9FFF]">{slide.highlight}</span>
                </p>

                <span className="mt-4 sm:mt-auto inline-flex items-center gap-2 bg-white text-gray-900 text-xs sm:text-sm md:text-base font-bold px-4 sm:px-5 py-2.5 rounded-full group-hover:bg-gray-100 transition-colors">
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            )}
          </a>
        );
      })}

      {/* ============ Flèches précédent / suivant (survol desktop) ============ */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(safeActive - 1)}
            aria-label={tl({ fr: 'Diapositive précédente', pt: 'Diapositiva anterior', en: 'Previous slide' })}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(safeActive + 1)}
            aria-label={tl({ fr: 'Diapositive suivante', pt: 'Próxima diapositiva', en: 'Next slide' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ============ Points de navigation ============ */}
      {total > 1 && (
        <div className="absolute bottom-3.5 right-4 sm:bottom-4 sm:right-5 z-20 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={tl({ fr: `Aller à la diapositive ${i + 1}`, pt: `Ir para a diapositiva ${i + 1}`, en: `Go to slide ${i + 1}` })}
              aria-current={i === safeActive}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === safeActive ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Bannière droite : publicités admin (format « promo_droite ») en rotation auto,
// sinon contenu par défaut (professionnels / visibilité)
function RightPromoBanner() {
  const { tl } = useTranslation();
  const { data: adBanners } = useBanners('home', 'promo_droite');
  const ads = (adBanners || []).filter((b) => !!b.image);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const total = ads.length;
  // Index actif sûr (évite un setState dans un effet quand la liste change)
  const safeActive = total > 0 ? ((active % total) + total) % total : 0;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current || total <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % total), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const goTo = (i: number) => setActive(((i % total) + total) % total);

  if (ads.length === 0) {
    return (
      <a
        href="/publicite"
        className="group relative block overflow-hidden rounded-xl h-72 sm:h-80 md:h-96"
      >
        <img
          src="/banners/pro-dark.jpg"
          alt="Commerce illuminé la nuit — donnez plus de visibilité à votre entreprise"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />

        <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col items-center text-center">
          <p className="text-white font-extrabold text-base sm:text-lg md:text-2xl leading-tight drop-shadow">
            Professionnels,<br />donnez plus de visibilité<br className="hidden sm:block" /> à votre entreprise sur Pebiss
          </p>

          <div className="mt-3 sm:mt-4 bg-white/95 rounded-md px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
            <Store className="h-5 w-5 md:h-6 md:w-6 text-orange-600 shrink-0" />
            <p className="text-xs sm:text-sm text-gray-900 font-semibold leading-tight text-left">
              Votre entreprise<br />s&apos;affiche en grand
            </p>
          </div>

          <span className="mt-auto inline-flex items-center gap-1.5 bg-blue-600 group-hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base font-bold px-4 sm:px-5 py-2.5 rounded-full transition-colors">
            Bénéficier de Pebiss +
          </span>
        </div>
      </a>
    );
  }

  return (
    <div
      className="group relative block overflow-hidden rounded-xl h-72 sm:h-80 md:h-96"
      role="region"
      aria-roledescription="carrousel"
      aria-label={tl({ fr: 'Publicités', pt: 'Publicidade', en: 'Ads' })}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current !== null) {
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) goTo(active + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }
        setPaused(false);
      }}
    >
      {ads.map((banner, i) => {
        const isActive = i === safeActive;
        return (
          <a
            key={banner.id}
            href={banner.link || '#'}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image as string}
              alt={banner.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform ease-out ${
                isActive ? 'scale-105 duration-[7000ms]' : 'scale-100 duration-700'
              }`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 sm:p-5 pt-12">
              <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight drop-shadow">
                {banner.title}
              </h3>
              {banner.description && (
                <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{banner.description}</p>
              )}
            </div>
          </a>
        );
      })}

      {ads.length > 1 && (
        <div className="absolute bottom-3.5 right-4 z-20 flex items-center gap-2">
          {ads.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={tl({ fr: `Aller à la publicité ${i + 1}`, pt: `Ir para a publicidade ${i + 1}`, en: `Go to ad ${i + 1}` })}
              aria-current={i === safeActive}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === safeActive ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// PromoDuoBanners — 2 bannières côte à côte sous le hero (style PagesJaunes)
// Gauche : CARROUSEL promo / publicités admin (promo_gauche) — auto toutes les 5 s
// Droite : publicités admin (promo_droite) en rotation, sinon carte professionnels
export function PromoDuoBanners() {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ============ Bannière gauche — Carrousel promo / publicités ============ */}
          <PromoSlider />

          {/* ============ Bannière droite — Publicités ou professionnels (même taille que la gauche) ============ */}
          <RightPromoBanner />
        </div>
      </div>
    </section>
  );
}

// HomepageSponsoredGrid — bannières publiées depuis l'admin (Annonces)
// Affiche les bannières actives « Accueil — Milieu » (home / 336x280) sous les catégories
export function HomepageSponsoredGrid() {
  const { data: banners } = useBanners('home', '336x280');

  if (!banners || banners.length === 0) return null;

  return (
    <section className="pb-12 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
