'use client';

import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface AdBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'dark' | 'light' | 'gradient';
  className?: string;
  image?: string;
  overlayGradient?: string;
}

const variants = {
  dark: {
    bg: 'bg-[#2D2D2D]',
    accent: 'bg-[#0099FF]',
    text: 'text-white',
    subtext: 'text-white/60',
    cta: 'bg-[#0099FF] hover:bg-[#0066CC] text-white',
    close: 'text-white/30 hover:text-white/70',
    badge: 'bg-white/10',
  },
  light: {
    bg: 'bg-white border border-[#E0E0E0]',
    accent: 'bg-primary',
    text: 'text-[#242424]',
    subtext: 'text-[#777]',
    cta: 'bg-primary hover:bg-primary/90 text-white',
    close: 'text-[#999] hover:text-[#555]',
    badge: 'bg-[#F6F6F6]',
  },
  gradient: {
    bg: 'bg-gradient-to-b from-[#1a1a2e] to-[#16213e]',
    accent: 'bg-[#0F3460]',
    text: 'text-white',
    subtext: 'text-white/60',
    cta: 'bg-[#0099FF] hover:bg-[#0066CC] text-white',
    close: 'text-white/30 hover:text-white/70',
    badge: 'bg-white/10',
  },
};

export function AdBanner({
  title,
  subtitle,
  ctaText,
  ctaLink = '#',
  variant = 'dark',
  className,
  image,
  overlayGradient,
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();
  const v = variants[variant];

  if (dismissed) return null;

  /* ── Image-based banner ── */
  if (image) {
    return (
      <div
        className={cn(
          'relative rounded-lg overflow-hidden group shrink-0 cursor-pointer',
          className
        )}
        style={{ width: '251px', height: '517px' }}
      >
        {/* Background image */}
        <img
          src={image}
          alt={title || t('ad_badge')}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay gradient */}
        <div
          className={cn(
            'absolute inset-0',
            overlayGradient || 'bg-gradient-to-t from-black/80 via-black/30 to-black/10'
          )}
        />

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute top-2 right-2 z-20 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
          aria-label={t('ad_close_label')}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Top badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {t('ad_badge')}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
          {title && (
            <h3 className="text-white text-lg font-bold leading-snug mb-1.5 drop-shadow-lg">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-white/80 text-xs leading-relaxed mb-4 line-clamp-2 drop-shadow">
              {subtitle}
            </p>
          )}
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 bg-white text-[#242424] px-5 py-2.5 rounded text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  /* ── Text-based banner (legacy) ── */
  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden group flex flex-col',
        v.bg,
        className
      )}
      style={{ width: '251px', height: '517px' }}
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className={cn(
          'absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center transition-colors',
          v.close
        )}
        aria-label={t('ad_close_label')}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Top: Accent badge */}
      <div className={cn('mx-4 mt-4 px-3 py-1 rounded-full w-fit', v.badge)}>
        <span className={cn('text-[10px] font-bold uppercase tracking-wider', v.text)}>
          {t('ad_badge')}
        </span>
      </div>

      {/* Middle: Title + Subtitle */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-5', v.accent)}>
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/90" fillRule="evenodd" clipRule="evenodd">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        <h3 className={cn('text-lg font-bold leading-snug', v.text)}>
          {title}
        </h3>
        <p className={cn('text-xs leading-relaxed mt-2.5', v.subtext)}>
          {subtitle}
        </p>
      </div>

      {/* Bottom: CTA Button */}
      <div className="px-5 pb-5">
        <a
          href={ctaLink}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded text-sm font-semibold transition-colors',
            v.cta
          )}
        >
          {ctaText}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

/* Pre-configured text-based banner sets */
export function AdBanner1() {
  return (
    <AdBanner
      title="Boostez votre visibilité"
      subtitle="Diffusez vos produits et services auprès de milliers de clients en Guinée-Bissau"
      ctaText="Promouvoir"
      ctaLink="/register"
      variant="dark"
    />
  );
}

export function AdBanner2() {
  return (
    <AdBanner
      title="Inscrivez votre entreprise"
      subtitle="Rejoignez le plus grand annuaire d'entreprises en Guinée-Bissau gratuitement"
      ctaText="S'inscrire"
      ctaLink="/register"
      variant="gradient"
    />
  );
}

export function AdBanner3() {
  return (
    <AdBanner
      title="Services Premium"
      subtitle="Obtenez plus de visibilité et de clients avec notre offre premium"
      ctaText="En savoir plus"
      ctaLink="/register"
      variant="dark"
    />
  );
}

export function AdBanner4() {
  return (
    <AdBanner
      title="Développez votre réseau"
      subtitle="Connectez-vous avec des professionnels et partenaires partout en Guinée-Bissau"
      ctaText="Rejoindre"
      ctaLink="/register"
      variant="light"
    />
  );
}

export function AdBanner5() {
  return (
    <AdBanner
      title="Annonces mises en avant"
      subtitle="Augmentez vos chances d'être vu avec une annonce en tête de liste"
      ctaText="Voir offres"
      ctaLink="/register"
      variant="gradient"
    />
  );
}

/* Image-based ad banners (high quality) */
export function AdBannerImmobilier() {
  return (
    <AdBanner
      image="/ad-banners/ad-immobilier.png"
      title="Immobilier Premium"
      subtitle="Trouvez les meilleures offres immobilières en Guinée-Bissau"
      ctaText="Voir annonces"
      ctaLink="/annuaire?category=immobilier"
    />
  );
}

export function AdBannerTechnologie() {
  return (
    <AdBanner
      image="/ad-banners/ad-technologie.png"
      title="Solutions Digitales"
      subtitle="Transformez votre entreprise avec la technologie"
      ctaText="Découvrir"
      ctaLink="/annuaire?category=technologie"
    />
  );
}

export function AdBannerRestaurant() {
  return (
    <AdBanner
      image="/ad-banners/ad-restaurant.png"
      title="Restaurants & Cuisine"
      subtitle="Découvrez les meilleures adresses culinaires de Bissau"
      ctaText="Réserver"
      ctaLink="/annuaire?category=restaurants"
    />
  );
}

export function AdBannerMode() {
  return (
    <AdBanner
      image="/ad-banners/ad-mode.png"
      title="Mode & Boutique"
      subtitle="Explorez les tendances fashion et les boutiques exclusives"
      ctaText="Explorer"
      ctaLink="/annuaire?category=mode"
    />
  );
}
