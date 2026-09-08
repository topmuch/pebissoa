'use client';

/**
 * Page /categories — refonte avec le même design « PagesJaunes » que /annuaire :
 * bandeau jaune #FFC600, sous-barre grise, chips de rubriques, carte de recherche
 * flottante et grille de cartes (image, compteur, bouton teal #35C1C1).
 * Accessible depuis le menu principal (« Catégories »).
 */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation, categoryTranslations, type Locale } from '@/lib/i18n';
import { RUBRIQUES } from '@/lib/rubriques';
import { categoryEmoji } from '@/lib/category-emojis';
import {
  Search,
  Building2,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { businesses: number };
}

/** Étiquette traduite d'une catégorie (fonction module = stable pour le compilateur React) */
function catLabel(cat: Category, locale: Locale): string {
  return cat.slug && categoryTranslations[cat.slug]
    ? categoryTranslations[cat.slug][locale]
    : cat.name;
}

/** Photo réelle de la catégorie avec double repli :
 *  1. /categories/<slug>.jpg  2. /categories/fallback.jpg  3. pastille dégradée + icône */
function CategoryImage({ slug, name }: { slug: string; name: string }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-accent/30">
        <Building2 className="h-10 w-10 text-muted-foreground/25" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={stage === 0 ? `/categories/${slug}.jpg` : '/categories/fallback.jpg'}
      alt={`${name} — Pebiss`}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setStage((s) => (s === 0 ? 1 : 2))}
    />
  );
}

/* ============ Carte catégorie — même style que PjBusinessCard (/annuaire) ============ */
function PjCategoryCard({ cat, label }: { cat: Category; label: string }) {
  const { t, locale } = useTranslation();

  return (
    <Link
      href={`/annuaire?category=${cat.slug}`}
      className="group block h-full focus-visible:outline-none"
      aria-label={label}
    >
      <div className="h-full flex flex-col bg-white dark:bg-card rounded-lg border border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <CategoryImage slug={cat.slug} name={label} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Corps */}
        <div className="flex-1 flex flex-col gap-1.5 p-3.5">
          <h3 className="font-bold text-sm text-foreground truncate">
            <span className="mr-1" aria-hidden="true">{categoryEmoji(cat.slug)}</span>
            {label}
          </h3>

          <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            <Building2 className="h-3 w-3 shrink-0" />
            {cat._count.businesses > 0 ? (
              <span>{t('categories_page_businesses', { count: cat._count.businesses })}</span>
            ) : (
              <span className="italic">{locale === 'pt' ? 'Sem empresas por agora' : 'Aucune entreprise'}</span>
            )}
          </p>

          <div className="mt-auto pt-2.5">
            <span className="block w-full text-center bg-[#35C1C1] group-hover:bg-[#28A9A9] text-white text-[13px] font-bold py-2 rounded-full transition-colors">
              {t('categories_page_explore')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Squelette — même forme que les cartes réelles (comme /annuaire) */
function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-lg border border-border/70 overflow-hidden">
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full rounded-full mt-3" />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState('');
  const [rubrique, setRubrique] = useState('');

  const searchCardRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  // Rubriques multi-catégories uniquement (les mono dupliquent les cartes visibles)
  const chips = useMemo(
    () => RUBRIQUES.filter((r) => r.categories.length > 1),
    []
  );

  const sorted = useMemo(
    () => [...(categories || [])].sort((a, b) => catLabel(a, locale).localeCompare(catLabel(b, locale), locale)),
    [categories, locale]
  );

  const filtered = useMemo(() => {
    const rub = chips.find((r) => r.key === rubrique);
    return sorted.filter((cat) => {
      if (rub && !rub.categories.includes(cat.slug)) return false;
      if (!filter.trim()) return true;
      const q = filter.trim().toLowerCase();
      return catLabel(cat, locale).toLowerCase().includes(q) || cat.name.toLowerCase().includes(q);
    });
  }, [sorted, rubrique, filter, chips, locale]);

  const totalBusinesses = sorted.reduce((sum, c) => sum + c._count.businesses, 0);
  const hasActiveFilters = !!(filter.trim() || rubrique);

  function clearFilters() {
    setFilter('');
    setRubrique('');
  }

  function scrollToSearch() {
    searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchCardRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }

  return (
    <div className="min-h-[60vh]">
      {/* ============ Bandeau jaune — style PagesJaunes ============ */}
      <div className="bg-[#FFC600]">
        <div className="container mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-gray-900 leading-tight">
            {locale === 'pt' ? (
              <>
                Todas as{' '}
                <span className="inline-block bg-gray-900 text-white px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  categorias
                </span>{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-gray-900/80 leading-none">?</span>
              </>
            ) : (
              <>
                Toutes les{' '}
                <span className="inline-block bg-gray-900 text-white px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  catégories
                </span>{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-gray-900/80 leading-none">?</span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* ============ Sous-barre grise ============ */}
      <div className="bg-gray-100 dark:bg-muted/50 border-b border-border/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">
            {sorted.length > 0 ? (
              <>
                {sorted.length}{' '}
                {locale === 'pt'
                  ? `categorias · ${totalBusinesses} empresas na Guiné-Bissau`
                  : `catégories · ${totalBusinesses} entreprises en Guinée-Bissau`}
              </>
            ) : (
              (locale === 'pt' ? 'Categorias na Guiné-Bissau' : 'Catégories en Guinée-Bissau')
            )}
          </p>
          <button
            onClick={scrollToSearch}
            className="shrink-0 h-8 px-3.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-border text-[13px] font-medium text-gray-900 dark:text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors"
          >
            {locale === 'pt' ? 'Procurar uma categoria' : 'Rechercher une catégorie'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* ============ Chips de rubriques — style PagesJaunes ============ */}
        <div className="relative mt-5">
          <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pr-9">
            <button
              onClick={() => setRubrique('')}
              aria-pressed={!rubrique}
              className={`h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all ${
                !rubrique
                  ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background border-gray-900 dark:border-transparent'
                  : 'bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground hover:border-gray-900 dark:hover:border-foreground'
              }`}
            >
              <span className="mr-1" aria-hidden="true">{categoryEmoji()}</span>
              {t('annuaire_all_categories')}
            </button>
            {chips.map((r) => (
              <button
                key={r.key}
                onClick={() => setRubrique((prev) => (prev === r.key ? '' : r.key))}
                aria-pressed={rubrique === r.key}
                className={`h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all ${
                  rubrique === r.key
                    ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background border-gray-900 dark:border-transparent'
                    : 'bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground hover:border-gray-900 dark:hover:border-foreground'
                }`}
              >
                {r.labels[locale]}
              </button>
            ))}
          </div>
          <button
            onClick={() => chipsRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            aria-label={locale === 'pt' ? 'Mais categorias' : 'Plus de catégories'}
            className="hidden sm:inline-flex absolute right-0 top-0 h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ============ Recherche — carte flottante ============ */}
        <div ref={searchCardRef}>
          <Card className="mt-4 mb-6 border border-border/40 shadow-lg shadow-black/5 rounded-2xl">
            <CardContent className="p-4 md:p-5">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col md:flex-row gap-3"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={locale === 'pt' ? 'Procurar uma categoria…' : 'Rechercher une catégorie…'}
                    aria-label={locale === 'pt' ? 'Procurar uma categoria' : 'Rechercher une catégorie'}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-black text-white h-11 rounded-full px-6"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">
                    {locale === 'pt' ? 'Procurar' : 'Rechercher'}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ============ Filtres actifs ============ */}
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive rounded-full">
                <X className="h-3.5 w-3.5 mr-1" />
                {t('annuaire_clear')}
              </Button>
              {rubrique && (
                <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                  <LayoutGrid className="h-3 w-3" />
                  {chips.find((r) => r.key === rubrique)?.labels[locale]}
                  <button
                    onClick={() => setRubrique('')}
                    aria-label="X"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filter.trim() && (
                <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                  « {filter.trim()} »
                  <button
                    onClick={() => setFilter('')}
                    aria-label="X"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <span className="text-sm text-muted-foreground font-medium">
              {filtered.length}{' '}
              {locale === 'pt'
                ? filtered.length === 1
                  ? 'categoria'
                  : 'categorias'
                : filtered.length === 1
                  ? 'catégorie'
                  : 'catégories'}
            </span>
          </div>
        )}

        {/* ============ Chargement ============ */}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ============ Vide ============ */}
        {!isLoading && filtered.length === 0 && (
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="py-16 px-6 text-center">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
                <Search className="h-9 w-9 text-muted-foreground/40" />
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('annuaire_no_results')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {locale === 'pt'
                  ? 'Nenhuma categoria corresponde à sua pesquisa'
                  : 'Aucune catégorie ne correspond à votre recherche'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="rounded-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t('annuaire_reset')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============ Grille des catégories ============ */}
        {!isLoading && filtered.length > 0 && (
          <ul
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
            aria-label={t('categories_page_title')}
          >
            {filtered.map((cat) => (
              <li key={cat.id}>
                <PjCategoryCard cat={cat} label={catLabel(cat, locale)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
