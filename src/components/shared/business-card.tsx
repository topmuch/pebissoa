'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Eye, Plus, Heart } from 'lucide-react';
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
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Building2 className="h-10 w-10 text-muted-foreground/20" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
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
  const { locale } = useTranslation();

  if (variant === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/60 overflow-hidden">
        <Link href={`/entreprise/${business.slug}`} className="block">
          <div className="flex">
            {/* Cover Image */}
            <div className="relative w-40 sm:w-52 flex-shrink-0 bg-muted">
              {business.coverImage ? (
                <CoverImage src={business.coverImage} alt={business.name} className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {business.name}
                  </h3>
                  {business.category && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {business.category.slug && categoryTranslations[business.category.slug] ? categoryTranslations[business.category.slug][locale] : business.category.name}
                    </Badge>
                  )}
                </div>
                {business.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {business.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
          </div>
        </Link>
      </Card>
    );
  }

  // Grid variant — square card with image top, content bottom
  return (
    <Link href={`/entreprise/${business.slug}`} className="group block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-border bg-white">
        {/* Image area — square */}
        <div className="relative overflow-hidden">
          {business.coverImage ? (
            <CoverImage src={business.coverImage} alt={business.name} className="aspect-square" />
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/15" />
            </div>
          )}
          {/* Category badge — top left */}
          {business.category && (
            <div className="absolute top-2.5 left-2.5">
              <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0 text-[11px] font-medium shadow-sm">
                {business.category.slug && categoryTranslations[business.category.slug] ? categoryTranslations[business.category.slug][locale] : business.category.name}
              </Badge>
            </div>
          )}
          {/* Views + favorite — top right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
              <Eye className="h-2.5 w-2.5" />
              {business.views}
            </span>
            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors">
              <Heart className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-3 flex flex-col gap-1.5">
          {/* Business name */}
          <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {business.name}
          </h3>
          {/* Description */}
          {business.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
              {business.description}
            </p>
          )}
          {/* City + Rating row */}
          <div className="flex items-center justify-between mt-auto">
            {business.city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {business.city}
              </span>
            )}
            <RatingStars
              rating={business.avgRating || 0}
              reviewCount={business._count?.reviews}
              size="sm"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
