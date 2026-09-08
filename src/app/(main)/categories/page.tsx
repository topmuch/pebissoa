'use client';

/**
 * Page /categories — liste de toutes les catégories avec images réelles.
 * Accessible depuis le menu principal (« Catégories »).
 */

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import { LayoutGrid, ChevronRight, Search, Building2, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { businesses: number };
}

/** Image de secours si la photo d'une catégorie est introuvable */
const FALLBACK_IMAGE = '/categories/fallback.jpg';

/**
 * Photo réelle de la catégorie avec double repli :
 * 1. /categories/<slug>.jpg  2. /categories/fallback.jpg  3. pastille dégradée + icône
 */
function CategoryImage({ slug, name }: { slug: string; name: string }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-primary/15">
        <Building2 className="h-12 w-12 text-primary/40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={stage === 0 ? `/categories/${slug}.jpg` : FALLBACK_IMAGE}
      alt={`${name} — Pebiss`}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      onError={() => setStage((s) => (s === 0 ? 1 : 2))}
    />
  );
}

/** Squelette de chargement — même forme que les lignes réelles */
function CategoryRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-4">
      <Skeleton className="h-44 w-full shrink-0 rounded-xl sm:h-48 sm:w-72" />
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState('');

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const categoryName = (cat: Category) =>
    (cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name);

  const sorted = [...(categories || [])].sort((a, b) => a.name.localeCompare(b.name, locale));

  const filtered = sorted.filter((cat) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return categoryName(cat).toLowerCase().includes(q) || cat.name.toLowerCase().includes(q);
  });

  const totalBusinesses = sorted.reduce((sum, c) => sum + c._count.businesses, 0);

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ===== En-tête — dégradé + cercles décoratifs (cohérent avec /annuaire) ===== */}
      <div className="pebiss-gradient relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-8 right-1/3 h-14 w-14 rounded-full bg-white/10 hidden md:block pointer-events-none" />
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-20 text-center relative">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm mb-4 shadow-inner">
            <LayoutGrid className="h-7 w-7 text-white" />
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">
            {t('categories_page_title')}
          </h1>
          <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto mb-4">
            {t('categories_page_desc')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 font-semibold text-white">
              <LayoutGrid className="h-3.5 w-3.5" />
              {t('categories_page_count', { count: sorted.length })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 font-semibold text-white">
              <Building2 className="h-3.5 w-3.5" />
              {t('categories_page_businesses', { count: totalBusinesses })}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* ===== Recherche flottante qui chevauche l'en-tête ===== */}
        <div className="relative z-10 -mt-8 md:-mt-10 mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={locale === 'pt' ? 'Procurar uma categoria…' : 'Rechercher une catégorie…'}
              aria-label={locale === 'pt' ? 'Procurar uma categoria' : 'Rechercher une catégorie'}
              className="h-11 pl-11 pr-4 rounded-xl border-border/40 shadow-xl shadow-black/5 bg-card"
            />
          </div>
        </div>

        {/* ===== Liste des catégories ===== */}
        {isLoading ? (
          <div className="mx-auto max-w-5xl space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryRowSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-5xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">
              {locale === 'pt'
                ? 'Nenhuma categoria corresponde à sua pesquisa'
                : 'Aucune catégorie ne correspond à votre recherche'}
            </p>
          </div>
        ) : (
          <ul className="mx-auto max-w-5xl space-y-4" aria-label={t('categories_page_title')}>
            {filtered.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/annuaire?category=${cat.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 sm:flex-row sm:items-center sm:gap-6 sm:p-4"
                >
                  {/* Image réelle de la catégorie — pleine largeur sur mobile */}
                  <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-48 sm:w-72">
                    <CategoryImage slug={cat.slug} name={categoryName(cat)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Textes + flèche */}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-1 sm:gap-6 sm:pr-0">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug truncate">
                        {categoryName(cat)}
                      </h2>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm sm:text-base text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {cat._count.businesses > 0 ? (
                          <span>
                            {t('categories_page_businesses', { count: cat._count.businesses })}
                          </span>
                        ) : (
                          <span className="italic">{t('categories_page_empty')}</span>
                        )}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        {t('categories_page_explore')}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>

                    {/* Flèche */}
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
