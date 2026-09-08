'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Building2, MapPin, Eye, Heart, ArrowRight, ChevronRight } from 'lucide-react';
import { RatingStars } from './rating-stars';
import { useTranslation, categoryTranslations } from '@/lib/i18n';

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  views: number;
  _count?: {
    reviews: number;
    products: number;
    services: number;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  } | null;
  avgRating?: number;
}

interface BusinessCardProps {
  business: Business;
  variant?: 'grid' | 'list';
}

// Cover image with error fallback + loading state + retry with reliable endpoint
function CoverImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Convert /api/uploads/filename to /api/serve-image/filename (more reliable in standalone)
  const getReliableSrc = (url: string) => {
    const match = url.match(/\/api\/uploads\/(.+)$/);
    return match ? `/api/serve-image/${match[1]}` : url;
  };

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className ?? ''}`}>
        <Building2 className="h-10 w-10 text-muted-foreground/20" />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // First error: retry with the reliable single-segment endpoint
          if (imgSrc.startsWith('/api/uploads/')) {
            setImgSrc(getReliableSrc(imgSrc));
          } else {
            setError(true);
          }
        }}
      />
    </div>
  );
}

export function BusinessCard({ business, variant = 'grid' }: BusinessCardProps) {
  const { locale, tl } = useTranslation();
  const categoryLabel = business.category
    ? (business.category.slug && categoryTranslations[business.category.slug]
        ? categoryTranslations[business.category.slug][locale]
        : business.category.name)
    : null;

  /* ============ VARIANTE LISTE ============ */
  if (variant === 'list') {
    return (
      <Link href={`/entreprise/${business.slug}`} className="group block">
        <article className="flex bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          {/* Image */}
          <div className="relative w-40 sm:w-52 shrink-0 bg-muted overflow-hidden">
            {business.coverImage ? (
              <CoverImage src={business.coverImage} alt={business.name} className="absolute inset-0 w-full h-full" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-accent/40">
                <Building2 className="h-10 w-10 text-muted-foreground/25" />
              </div>
            )}
            {/* Petit logo arrondi en bas de l'image */}
            {business.logo && (
              <img
                src={business.logo}
                alt=""
                className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-lg object-cover ring-2 ring-white/90 shadow-md"
              />
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {categoryLabel && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pebiss-orange bg-pebiss-orange/10 px-2.5 py-0.5 rounded-full mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-pebiss-orange" />
                    {categoryLabel}
                  </span>
                )}
                <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-pebiss-orange transition-colors truncate">
                  {business.name}
                </h3>
              </div>
              {/* Flèche révélée au survol (desktop) */}
              <span className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-pebiss-orange group-hover:text-white group-hover:border-pebiss-orange transition-all duration-300">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>

            {business.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {business.description}
              </p>
            )}

            <div className="mt-auto pt-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {business.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {business.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {business.views}
                </span>
              </div>
              <RatingStars
                rating={business.avgRating || 0}
                reviewCount={business._count?.reviews}
                size="sm"
              />
            </div>
          </div>
        </article>
      </Link>
    );
  }

  /* ============ VARIANTE GRILLE ============ */
  return (
    <Link href={`/entreprise/${business.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image 4:3 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {business.coverImage ? (
            <CoverImage src={business.coverImage} alt={business.name} className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-accent/40">
              <Building2 className="h-14 w-14 text-muted-foreground/20" />
            </div>
          )}
          {/* Voile bas pour la lisibilité */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

          {/* Catégorie — pastille en haut à gauche */}
          {categoryLabel && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 dark:bg-card/95 backdrop-blur-sm text-[11px] font-semibold text-foreground px-2.5 py-1 rounded-full shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-pebiss-orange" />
              {categoryLabel}
            </span>
          )}

          {/* Vues + favori — en haut à droite */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-black/45 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              <Eye className="h-3 w-3" />
              {business.views}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-card/95 text-muted-foreground shadow-sm hover:text-destructive transition-colors cursor-pointer">
              <Heart className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Contenu avec logo chevauchant */}
        <div className="relative flex-1 flex flex-col p-4">
          {business.logo ? (
            <img
              src={business.logo}
              alt=""
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-white dark:ring-card shadow-md -mt-9 mb-2.5 bg-white relative z-10"
            />
          ) : (
            <span className="h-12 w-12 rounded-xl bg-pebiss-blue/10 text-pebiss-blue flex items-center justify-center ring-2 ring-white dark:ring-card shadow-md -mt-9 mb-2.5 relative z-10">
              <Building2 className="h-5 w-5" />
            </span>
          )}

          <h3 className="font-bold text-[15px] text-foreground leading-snug group-hover:text-pebiss-orange transition-colors line-clamp-1">
            {business.name}
          </h3>

          {business.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
              {business.description}
            </p>
          )}

          {/* Pied : ville + note */}
          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
            {business.city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground truncate min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{business.city}</span>
              </span>
            )}
            <RatingStars
              rating={business.avgRating || 0}
              reviewCount={business._count?.reviews}
              size="sm"
            />
          </div>

          {/* CTA révélé au survol (desktop) — espace réservé pour aligner les cartes */}
          <div className="hidden sm:flex items-center justify-center gap-1.5 mt-3 h-8 rounded-xl bg-pebiss-orange/10 text-pebiss-orange text-xs font-semibold opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {tl({ fr: 'Voir la fiche', pt: 'Ver a ficha', en: 'View profile' })}
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
