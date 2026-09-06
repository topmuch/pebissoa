'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessCard } from '@/components/shared/business-card';
import { BusinessCardSkeleton } from '@/components/shared/business-card-skeleton';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import { HomepageMidBanner, HomepageFooterBanner } from '@/components/shared/banner-placement';
import {
  Search,
  MapPin,
  Building2,
  Star,
  Utensils,
  Wrench,
  Plane,
  Landmark,
  Sprout,
  ShoppingBag,
  Palette,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Heart,
  Eye,
  Calendar,
  Megaphone,
  Stethoscope,
  GraduationCap,
  Home,
  Briefcase,
  Car,
  Layers,
  Monitor,
  Music,
  Camera,
  Flame,
  Zap,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// Using native <img> instead of next/image for standalone mode compatibility

// Dynamic icon mapping for categories
const categoryIconMap: Record<string, LucideIcon> = {
  'mode-textile': Palette,
  'restaurants-alimentation': Utensils,
  'tourisme-hotellerie': Plane,
  'services-financiers': Landmark,
  'agriculture-agroalimentaire': Sprout,
  'commerce-distribution': ShoppingBag,
  'btp-construction': Wrench,
  'sante-bien-etre': Stethoscope,
  'education-formation': GraduationCap,
  'immobilier': Home,
};

// Fallback icons to cycle through for categories not in the map
const fallbackIcons: LucideIcon[] = [
  Briefcase, Car, Layers, Monitor, Music, Camera, Flame, Zap, Truck, Megaphone, Calendar, Heart, Eye, Star,
];

// Dynamic gradient assignment based on category index
const gradientPalette = [
  'from-pink-500 to-rose-600',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-green-600',
  'from-lime-400 to-green-500',
  'from-violet-500 to-purple-700',
  'from-amber-400 to-orange-600',
  'from-teal-400 to-emerald-600',
  'from-sky-400 to-indigo-500',
  'from-fuchsia-400 to-pink-600',
  'from-red-400 to-rose-700',
  'from-green-400 to-teal-600',
  'from-yellow-400 to-amber-600',
  'from-indigo-400 to-blue-600',
  'from-rose-400 to-red-600',
  'from-emerald-500 to-cyan-600',
];

function getCategoryIcon(slug: string | undefined, index: number): LucideIcon {
  if (!slug) return Building2;
  return categoryIconMap[slug] || fallbackIcons[index % fallbackIcons.length];
}

function getCategoryGradient(slug: string | undefined, index: number): string {
  if (slug && categoryIconMap[slug]) {
    // For known categories, use a fixed gradient based on their position in the icon map
    const keys = Object.keys(categoryIconMap);
    const idx = keys.indexOf(slug);
    if (idx >= 0) return gradientPalette[idx % gradientPalette.length];
  }
  // For new/unknown categories, use index-based gradient
  return gradientPalette[index % gradientPalette.length];
}

// Image with loading skeleton to prevent blue/empty flash
function ImgWithLoad({ src, alt, className, fallbackText }: { src: string; alt: string; className?: string; fallbackText?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="relative overflow-hidden">
      {!loaded && !error && <div className="absolute inset-0 bg-muted animate-pulse" />}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground/20" />
        </div>
      )}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  _count: { businesses: number };
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  views: number;
  avgRating?: number;
  _count?: { reviews: number; products: number; services: number };
  category?: { id: string; name: string; slug: string } | null;
}

export default function HomePage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const catScrollRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories-home'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const { data: businessesData } = useQuery<{ businesses: Business[] }>({
    queryKey: ['businesses-featured'],
    queryFn: () => fetch('/api/businesses?limit=8&sortBy=createdAt&sortOrder=desc').then((r) => r.json()),
  });

  const businesses = businessesData?.businesses || [];

  // Stats from real data
  const totalCategories = categories?.length || 0;
  const totalBusinessesCount = categories?.reduce((sum, c) => sum + c._count.businesses, 0) || 0;
  const totalReviews = businesses.reduce((sum, b) => sum + (b._count?.reviews || 0), 0);
  const uniqueCities = new Set(businesses.map((b) => b.city).filter(Boolean)).size;

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (searchCity) params.set('city', searchCity);
    if (searchCategory) params.set('category', searchCategory);
    router.push(`/annuaire?${params.toString()}`);
  }

  const [animStats, setAnimStats] = useState({ businesses: 0, categories: 0, cities: 0, reviews: 0 });
  const statsTarget = {
    businesses: Math.max(totalBusinessesCount, 150),
    categories: Math.max(totalCategories, 7),
    cities: Math.max(uniqueCities, 12),
    reviews: Math.max(totalReviews + 120, 340),
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimStats({
        businesses: Math.round(statsTarget.businesses * ease),
        categories: Math.round(statsTarget.categories * ease),
        cities: Math.round(statsTarget.cities * ease),
        reviews: Math.round(statsTarget.reviews * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [totalBusinessesCount, totalCategories, uniqueCities, totalReviews]);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const amount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Build a slug->index map for consistent gradient/icon assignment
  const categoryIndexMap = useRef<Record<string, number>>({});
  const getCategoryIndex = (slug: string) => {
    if (!(slug in categoryIndexMap.current)) {
      categoryIndexMap.current[slug] = Object.keys(categoryIndexMap.current).length;
    }
    return categoryIndexMap.current[slug];
  };

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO SECTION — Full-Width Banner ============ */}
      <section className="relative w-full min-h-[520px] md:min-h-0 md:aspect-[1842/652] lg:aspect-[1842/652]">
        {/* Background Image */}
        <img
          src="/hero-banner.png"
          alt="Pebiss - Annuaire d'entreprises en Guiné-Bissau"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center py-12 md:py-0">
          <div className="container mx-auto px-4 text-center">
            {/* Badge */}
            <p className="text-xs sm:text-sm md:text-base font-semibold text-white/90 mb-2 sm:mb-3">
              {t('hero_badge', { count: animStats.businesses })}
            </p>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 sm:mb-4 px-2">
              {t('hero_title_1')}{' '}
              <span className="text-primary">{t('hero_title_highlight')}</span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-white/80 mb-4 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
              {t('hero_desc')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleHeroSearch} className="bg-white p-3 md:p-4 shadow-lg max-w-4xl mx-4 md:mx-auto mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <div className="flex-1">
                  <label className="block text-[11px] text-muted-foreground mb-1 font-medium">{t('search_what')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-[#F6F6F6] border border-border/60 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-muted-foreground mb-1 font-medium">{t('search_category')}</label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#F6F6F6] border border-border/60 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none pr-8"
                  >
                    <option value="">{t('search_select_category')}</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-muted-foreground mb-1 font-medium">{t('search_location')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('search_location_placeholder')}
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-[#F6F6F6] border border-border/60 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 text-sm font-medium w-full sm:w-auto"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('search_button')}
                  </Button>
                </div>
              </div>
            </form>

            {/* Popular Categories — dynamic from DB */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-sm px-4">
              <span className="text-white/60 font-medium text-xs uppercase tracking-wide">{t('popular')}</span>
              {categories?.slice(0, 5).map((cat) => {
                const Icon = getCategoryIcon(cat.slug, getCategoryIndex(cat.slug));
                return (
                  <Link key={cat.id} href={`/annuaire?category=${cat.slug}`} className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs sm:text-sm">
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES SECTION — Auto-Slide Multicolor Gradient Squares ============ */}
      <section className="pb-12 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              {t('browse_categories')}
            </h2>
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scrollContainer(catScrollRef, 'left')} className="p-2 bg-white border border-border hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scrollContainer(catScrollRef, 'right')} className="p-2 bg-white border border-border hover:bg-muted transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Infinite sliding track */}
        {!categories ? (
          <div className="flex gap-4 overflow-hidden px-4">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="shrink-0 w-[130px] md:w-[150px]">
                <Skeleton className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="group relative">
            <div className="flex gap-4 animate-slide-categories">
              {[...categories, ...categories, ...categories]
                .map((cat, idx) => {
                  const catIdx = getCategoryIndex(cat.slug);
                  const Icon = getCategoryIcon(cat.slug, catIdx);
                  const gradient = getCategoryGradient(cat.slug, catIdx);
                  return (
                    <Link key={`${cat.id}-${idx}`} href={`/annuaire?category=${cat.slug}`} className="shrink-0 group/card">
                      <div className={`w-[130px] md:w-[150px] h-[130px] md:h-[150px] rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-xl`}>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <h3 className="text-white text-xs md:text-sm font-semibold text-center leading-tight px-2">
                          {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                        </h3>
                        <span className="text-white/70 text-[10px]">
                          {cat._count.businesses} {t(cat._count.businesses > 1 ? 'cat_annonces' : 'cat_annonce')}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F6F6F6] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F6F6F6] to-transparent pointer-events-none z-10" />
          </div>
        )}
      </section>

      {/* ============ BANNER — 336x280 Après Catégories ============ */}
      <HomepageMidBanner />

      {/* ============ CURRENT LISTINGS ============ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                {t('recent_ads')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('recent_ads_desc')}
              </p>
            </div>
            <Link href="/annuaire" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-pebiss-blue transition-colors">
              {t('see_all')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Listing promo cards data */}
          {(() => {
            if (!businessesData) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <BusinessCardSkeleton key={i} />
                  ))}
                </div>
              );
            }

            if (businesses.length === 0) {
              return (
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t('no_ads')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('no_ads_desc')}
                    </p>
                    <Link href="/register">
                      <Button className="bg-primary hover:bg-primary/90 text-white text-sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('register_business')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            }

            const biz = businesses.slice(0, 8);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {biz.map((business) => (
                  <BusinessCard key={business.id} business={business} variant="grid" />
                ))}
              </div>
            );
          })()}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/annuaire">
              <Button variant="outline" className="text-sm text-primary">
                {t('see_all_ads')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* ============ ABOUT / EXPERIENCE SECTION ============ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Image with badge */}
            <div className="relative">
              <div className="overflow-hidden">
                <img
                  src="/hero.png"
                  alt={t('about_image_alt')}
                  className="w-full h-[300px] md:h-[400px] object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-3">
                <span className="block text-2xl font-bold">25+</span>
                <span className="block text-xs text-white/70">{t('years_exp')}</span>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight">
                {t('about_title')}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t('about_desc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { title: t('about_complete'), desc: t('about_complete_desc') },
                  { title: t('about_reliable'), desc: t('about_reliable_desc') },
                  { title: t('about_intuitive'), desc: t('about_intuitive_desc') },
                  { title: t('about_cities'), desc: t('about_cities_desc') },
                  { title: t('about_approved'), desc: t('about_approved_desc') },
                  { title: t('about_fluent'), desc: t('about_fluent_desc') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 bg-pebiss-blue/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-pebiss-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white text-sm px-6 py-2.5">
                  {t('learn_more')} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR — Multicolor KPI ============ */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="kpi-gradient-blue rounded-2xl p-6 md:p-8 text-center shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {animStats.businesses}+
              </div>
              <p className="text-sm text-white/80 font-medium">{t('stats_businesses')}</p>
            </div>
            <div className="kpi-gradient-purple rounded-2xl p-6 md:p-8 text-center shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {animStats.categories}+
              </div>
              <p className="text-sm text-white/80 font-medium">{t('stats_categories')}</p>
            </div>
            <div className="kpi-gradient-cyan rounded-2xl p-6 md:p-8 text-center shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {animStats.cities}+
              </div>
              <p className="text-sm text-white/80 font-medium">{t('stats_cities')}</p>
            </div>
            <div className="kpi-gradient-pink rounded-2xl p-6 md:p-8 text-center shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {animStats.reviews}+
              </div>
              <p className="text-sm text-white/80 font-medium">{t('stats_reviews')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            {t('cta_title')}
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-2xl mx-auto">
            {t('cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12 text-sm">
                <UserPlus className="h-5 w-5 mr-2" />
                {t('cta_button')}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <CheckIcon /> {t('cta_free')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon /> {t('cta_visible')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon /> {t('cta_no_card')}
            </span>
          </div>
        </div>
      </section>

      {/* ============ BANNER 728x90 Avant Footer ============ */}
      <HomepageFooterBanner />
      {/* ============ FLOATING WHATSAPP BUTTON ============ */}
      <a
        href="https://wa.me/245956007371"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title={t('whatsapp_contact')}
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.052 31.29l6.128-1.962c2.504 1.624 5.474 2.572 8.652 2.672h.044C24.826 32 32 24.824 32 16.004S24.826 0 16.004 0zm9.348 22.614c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.668-1.218-4.76-2.466-7.824-7.284-8.064-7.604-.228-.32-1.892-2.52-1.892-4.804s1.196-3.404 1.618-3.868c.422-.462.92-.58 1.228-.58.306 0 .612.002.88.014.284.014.664-.108 1.04.796.39.94 1.326 3.234 1.444 3.472.118.236.196.514.04.828-.158.314-.236.508-.472.784-.236.274-.496.614-.708.826-.236.236-.482.49-.206.962.276.472 1.224 2.016 2.628 3.266 1.806 1.6 3.322 2.096 3.796 2.332.474.236.748.196 1.022-.118.276-.314 1.186-1.382 1.502-1.856.316-.472.632-.392 1.064-.236.434.158 2.742 1.292 3.212 1.528.47.236.784.354.902.548.118.196.118 1.116-.272 2.214z"/>
        </svg>
        <span className="absolute right-full mr-3 bg-white text-[#242424] text-sm font-medium px-3 py-2 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('whatsapp_contact')}
          <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-white" />
        </span>
      </a>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}


