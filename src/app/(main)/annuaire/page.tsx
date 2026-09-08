'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RUBRIQUES, findRubriqueByCategory } from '@/lib/rubriques';
import { categoryEmoji } from '@/lib/category-emojis';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import { RatingStars } from '@/components/shared/rating-stars';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  PencilLine,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { businesses: number };
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  city?: string | null;
  views: number;
  avgRating?: number;
  _count?: { reviews: number; products: number; services: number };
  category?: { id: string; name: string; slug: string } | null;
}

const GUINEA_BISSAU_REGIONS = [
  'Bissau',
  'Biombo',
  'Cacheu',
  'Oio',
  'Bafatá',
  'Gabú',
  'Tombali',
  'Quinara',
  'Bolama-Bijagós',
];

/* ============ Carte entreprise — style PagesJaunes ============ */
function PjBusinessCard({ business }: { business: Business }) {
  const { locale } = useTranslation();
  const catName = business.category?.slug && categoryTranslations[business.category.slug]
    ? categoryTranslations[business.category.slug][locale]
    : business.category?.name;

  return (
    <Link
      href={`/entreprise/${business.slug}`}
      className="group block h-full focus-visible:outline-none"
      aria-label={business.name}
    >
      <div className="h-full flex flex-col bg-white dark:bg-card rounded-lg border border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-accent/30">
              <Building2 className="h-10 w-10 text-muted-foreground/25" />
            </div>
          )}
        </div>

        {/* Corps */}
        <div className="flex-1 flex flex-col gap-1.5 p-3.5">
          <h3 className="font-bold text-sm text-foreground truncate">{business.name}</h3>

          {business.city && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {business.city}
            </p>
          )}

          {typeof business.avgRating === 'number' && business.avgRating > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <RatingStars rating={business.avgRating} size="sm" showValue={false} />
              <span className="text-xs text-muted-foreground">
                {business.avgRating.toFixed(1)} ({business._count?.reviews ?? 0}{' '}
                {locale === 'pt' ? 'avaliações' : 'avis'})
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#1B9AA4] dark:text-[#35C1C1]">
              <PencilLine className="h-3 w-3" />
              {locale === 'pt' ? 'Escrever um comentário' : 'Écrire un avis'}
            </span>
          )}

          {catName && (
            <span className="self-start max-w-full truncate text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              {catName}
            </span>
          )}

          <div className="mt-auto pt-2.5">
            <span className="block w-full text-center bg-[#35C1C1] group-hover:bg-[#28A9A9] text-white text-[13px] font-bold py-2 rounded-full transition-colors">
              {locale === 'pt' ? 'Ver a ficha' : 'Voir la fiche'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============ Section catégorie — en-tête + carrousel horizontal ============ */
function CategorySection({
  emoji,
  label,
  count,
  items,
  onSelect,
  loading = false,
}: {
  emoji: string;
  label: string;
  count: number;
  items: Business[];
  onSelect: () => void;
  loading?: boolean;
}) {
  const { locale } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);

  const scrollRow = (dir: -1 | 1) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="mb-10 md:mb-12">
      {/* En-tête de section */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground min-w-0">
          <span className="text-xl md:text-2xl shrink-0" aria-hidden="true">{emoji}</span>
          <span className="truncate">{label}</span>
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSelect}
            className="hidden sm:inline-flex h-9 px-4 items-center rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-semibold text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors whitespace-nowrap"
          >
            {locale === 'pt' ? `Ver os ${count} resultados` : `Voir les ${count} résultats`}
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollRow(-1)}
              aria-label={locale === 'pt' ? 'Anterior' : 'Précédent'}
              className="h-9 w-9 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-foreground hover:border-gray-900 dark:hover:border-foreground flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollRow(1)}
              aria-label={locale === 'pt' ? 'Próximo' : 'Suivant'}
              className="h-9 w-9 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-foreground hover:border-gray-900 dark:hover:border-foreground flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carrousel de cartes */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1"
      >
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="snap-start shrink-0 w-[220px] sm:w-[250px]">
                <div className="bg-white dark:bg-card rounded-lg border border-border/70 overflow-hidden">
                  <Skeleton className="w-full aspect-[4/3] rounded-none" />
                  <div className="p-3.5 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full rounded-full mt-3" />
                  </div>
                </div>
              </div>
            ))
          : items.map((business) => (
              <div key={business.id} className="snap-start shrink-0 w-[220px] sm:w-[250px]">
                <PjBusinessCard business={business} />
              </div>
            ))}
      </div>
    </section>
  );
}

function AnnuaireContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const searchCardRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const { data, isLoading } = useQuery<{
    businesses: Business[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }>({
    queryKey: ['businesses', query, city, category, region, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (city) params.set('city', city);
      if (category) params.set('category', category);
      if (region) params.set('region', region);
      params.set('page', page.toString());
      params.set('limit', '12');
      return fetch(`/api/businesses?${params.toString()}`).then((r) => r.json());
    },
  });

  const hasActiveFilters = !!(query || city || category || region);

  // Toutes les entreprises (vue par défaut « style PagesJaunes » : sections par catégorie)
  const { data: allData, isLoading: allLoading } = useQuery<{
    businesses: Business[];
    pagination: { total: number };
  }>({
    queryKey: ['businesses-all-pj'],
    queryFn: () => fetch('/api/businesses?limit=100&page=1').then((r) => r.json()),
    enabled: !hasActiveFilters,
  });

  const sections = useMemo(() => {
    if (!categories || !allData?.businesses) return [];
    const groups = new Map<string, Business[]>();
    for (const b of allData.businesses) {
      const slug = b.category?.slug;
      if (!slug) continue;
      const arr = groups.get(slug) || [];
      if (arr.length < 8) arr.push(b);
      groups.set(slug, arr);
    }
    return categories
      .map((c) => ({ cat: c, items: groups.get(c.slug) || [] }))
      .filter((s) => s.items.length > 0)
      .sort((a, b) => (b.cat._count?.businesses ?? 0) - (a.cat._count?.businesses ?? 0));
  }, [categories, allData]);

  const businesses = data?.businesses || [];
  const pagination = data?.pagination;
  const total = hasActiveFilters ? pagination?.total ?? 0 : allData?.pagination?.total ?? 0;

  function clearFilters() {
    setQuery('');
    setCity('');
    setCategory('');
    setRegion('');
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function toggleCategory(slug: string) {
    setCategory((prev) => (prev === slug ? '' : slug));
    setPage(1);
  }

  function scrollToSearch() {
    searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchCardRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }

  // Étiquette d'une catégorie (traduite)
  function catLabel(slug: string): string {
    const rubrique = findRubriqueByCategory(slug);
    if (rubrique) return rubrique.labels[locale];
    const cat = categories?.find((c) => c.slug === slug);
    return cat?.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat?.name ?? slug;
  }

  // Pagination — numéros de page
  const pageNumbers: number[] = [];
  if (pagination) {
    const start = Math.max(1, page - 2);
    const end = Math.min(pagination.totalPages, page + 2);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
  }

  // Chips de catégories — une seule ligne scrollable
  const chipsRef = useRef<HTMLDivElement>(null);
  const selectedSlugs = category.split(',').filter(Boolean);

  return (
    <div className="min-h-[60vh]">
      {/* ============ Bandeau bleu — couleur du logo ============ */}
      <div className="bg-[#0066CC]">
        <div className="container mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            {locale === 'pt' ? (
              <>
                Encontre um{' '}
                <span className="inline-block bg-white text-[#0066CC] px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  Bom
                </span>{' '}
                profissional{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-white/80 leading-none">?</span>
              </>
            ) : (
              <>
                Trouvez un{' '}
                <span className="inline-block bg-white text-[#0066CC] px-3 md:px-4 py-0.5 -rotate-2 rounded-sm align-middle">
                  Bon
                </span>{' '}
                pro{' '}
                <span className="inline-block border-b-[5px] md:border-b-[7px] border-white/80 leading-none">?</span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* ============ Sous-barre grise ============ */}
      <div className="bg-gray-100 dark:bg-muted/50 border-b border-border/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">
            {total > 0 ? (
              <>
                {total} {locale === 'pt' ? 'empresas na Guiné-Bissau' : 'entreprises en Guinée-Bissau'}
              </>
            ) : (
              (locale === 'pt' ? 'Empresas na Guiné-Bissau' : 'Entreprises en Guinée-Bissau')
            )}
          </p>
          <button
            onClick={scrollToSearch}
            className="shrink-0 h-8 px-3.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-border text-[13px] font-medium text-gray-900 dark:text-foreground hover:border-gray-900 dark:hover:border-foreground transition-colors"
          >
            {locale === 'pt' ? 'Mudar a região' : 'Changer de région'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* ============ Chips de catégories — style PagesJaunes ============ */}
        <div className="relative mt-5">
          <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pr-9">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              aria-pressed={selectedSlugs.length === 0}
              className={`h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all ${
                selectedSlugs.length === 0
                  ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background border-gray-900 dark:border-transparent'
                  : 'bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground hover:border-gray-900 dark:hover:border-foreground'
              }`}
            >
              {locale === 'pt' ? 'Todas' : 'Toutes'}
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                aria-pressed={selectedSlugs.includes(cat.slug)}
                className={`h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all ${
                  selectedSlugs.includes(cat.slug)
                    ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background border-gray-900 dark:border-transparent'
                    : 'bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-muted-foreground hover:border-gray-900 dark:hover:border-foreground'
                }`}
              >
                <span className="mr-1" aria-hidden="true">{categoryEmoji(cat.slug)}</span>
                {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
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
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('annuaire_search_placeholder')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('annuaire_city_placeholder')}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                  <Select value={category || 'all'} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
                      <SelectValue placeholder={t('search_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('annuaire_all_categories')}</SelectItem>
                      {/* Rubriques d'accueil — uniquement multi-catégories (les mono dupliquent les catégories → clés Radix en conflit) */}
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground">
                          {locale === 'pt' ? 'Rubricas' : 'Rubriques'}
                        </SelectLabel>
                        {RUBRIQUES.filter((r) => r.categories.length > 1).map((r) => (
                          <SelectItem key={r.key} value={r.categories.join(',')}>
                            {r.labels[locale]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={region || 'all'} onValueChange={(v) => { setRegion(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-full md:w-44 h-11 rounded-xl">
                      <SelectValue placeholder={t('annuaire_region')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('annuaire_all_regions')}</SelectItem>
                      {GUINEA_BISSAU_REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white h-11 rounded-full px-6"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">{t('annuaire_search_button')}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ============ VUE PAR DÉFAUT — sections par catégorie (style PagesJaunes) ============ */}
        {!hasActiveFilters && (
          <>
            {allLoading && (
              <div>
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="mb-10">
                    <Skeleton className="h-7 w-56 mb-4" />
                    <div className="flex gap-4 overflow-hidden">
                      {Array.from({ length: 4 }, (_, j) => (
                        <div key={j} className="shrink-0 w-[220px] sm:w-[250px]">
                          <div className="bg-white dark:bg-card rounded-lg border border-border/70 overflow-hidden">
                            <Skeleton className="w-full aspect-[4/3] rounded-none" />
                            <div className="p-3.5 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-8 w-full rounded-full mt-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!allLoading && sections.length === 0 && (
              <Card className="border-border/40 rounded-2xl mt-2">
                <CardContent className="py-16 px-6 text-center">
                  <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
                    <Building2 className="h-9 w-9 text-muted-foreground/40" />
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('annuaire_no_results')}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t('annuaire_no_results_desc')}
                  </p>
                </CardContent>
              </Card>
            )}

            {sections.map(({ cat, items }) => (
              <CategorySection
                key={cat.id}
                emoji={categoryEmoji(cat.slug)}
                label={cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                count={cat._count?.businesses ?? items.length}
                items={items}
                onSelect={() => { setCategory(cat.slug); setPage(1); }}
              />
            ))}
          </>
        )}

        {/* ============ VUE FILTRÉE — résultats de recherche ============ */}
        {hasActiveFilters && (
          <>
            {/* Filtres actifs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive rounded-full">
                  <X className="h-3.5 w-3.5 mr-1" />
                  {t('annuaire_clear')}
                </Button>
                {query && (
                  <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                    « {query} »
                    <button onClick={() => { setQuery(''); setPage(1); }} aria-label="X" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                    <MapPin className="h-3 w-3" />
                    {city}
                    <button onClick={() => { setCity(''); setPage(1); }} aria-label="X" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                    {catLabel(category)}
                    <button onClick={() => { setCategory(''); setPage(1); }} aria-label="X" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {region && (
                  <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-gray-300 dark:border-border bg-white dark:bg-card text-[13px] font-medium text-foreground">
                    {region}
                    <button onClick={() => { setRegion(''); setPage(1); }} aria-label="X" className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              <span className="text-sm text-muted-foreground font-medium">
                {t('annuaire_count', { count: pagination?.total || 0 })}
              </span>
            </div>

            {/* Chargement */}
            {isLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-white dark:bg-card rounded-lg border border-border/70 overflow-hidden">
                    <Skeleton className="w-full aspect-[4/3] rounded-none" />
                    <div className="p-3.5 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-8 w-full rounded-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vide */}
            {!isLoading && businesses.length === 0 && (
              <Card className="border-border/40 rounded-2xl">
                <CardContent className="py-16 px-6 text-center">
                  <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
                    <Building2 className="h-9 w-9 text-muted-foreground/40" />
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('annuaire_no_results')}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t('annuaire_no_results_desc')}
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

            {/* Grille de résultats */}
            {!isLoading && businesses.length > 0 && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {businesses.map((business) => (
                    <PjBusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {/* Pagination — pastilles arrondies */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-full h-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('annuaire_previous')}</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {pageNumbers[0] > 1 && (
                        <>
                          <button
                            onClick={() => setPage(1)}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                          >
                            1
                          </button>
                          {pageNumbers[0] > 2 && <span className="px-0.5 text-muted-foreground">…</span>}
                        </>
                      )}
                      {pageNumbers.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          aria-current={p === page ? 'page' : undefined}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                            p === page
                              ? 'bg-gray-900 dark:bg-foreground text-white dark:text-background shadow-md scale-105'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
                        <>
                          {pageNumbers[pageNumbers.length - 1] < pagination.totalPages - 1 && (
                            <span className="px-0.5 text-muted-foreground">…</span>
                          )}
                          <button
                            onClick={() => setPage(pagination.totalPages)}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-full h-9"
                    >
                      <span className="hidden sm:inline">{t('annuaire_next')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnnuairePage() {
  return (
    <Suspense>
      <AnnuaireContent />
    </Suspense>
  );
}
