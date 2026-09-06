'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessCard } from '@/components/shared/business-card';
import { BusinessCardSkeleton } from '@/components/shared/business-card-skeleton';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import {
  Search,
  MapPin,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
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

function AnnuaireContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const businesses = data?.businesses || [];
  const pagination = data?.pagination;
  const hasActiveFilters = !!(query || city || category || region);

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

  // Generate page numbers
  const pageNumbers: number[] = [];
  if (pagination) {
    const start = Math.max(1, page - 2);
    const end = Math.min(pagination.totalPages, page + 2);
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="min-h-[60vh]">
      {/* Page Header */}
      <div className="pebiss-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('annuaire_title')}
          </h1>
          <p className="text-white/80 text-lg">
            {t('annuaire_subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-6 border-border/40 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('annuaire_search_placeholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('annuaire_city_placeholder')}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={category} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setPage(1); }}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder={t('search_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('annuaire_all_categories')}</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={region} onValueChange={(v) => { setRegion(v === 'all' ? '' : v); setPage(1); }}>
                  <SelectTrigger className="w-full md:w-48">
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
                <Button type="submit" className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">{t('annuaire_search_button')}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Active Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                <X className="h-3.5 w-3.5 mr-1" />
                {t('annuaire_clear')}
              </Button>
            )}
            {query && (
              <Badge variant="secondary" className="gap-1">
                « {query} »
                <button onClick={() => setQuery('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {city && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {city}
                <button onClick={() => setCity('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="gap-1">
                {categories?.find((c) => c.slug === category) && (() => {
                  const cat = categories.find((c) => c.slug === category);
                  return cat?.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat?.name;
                })()}
                <button onClick={() => setCategory('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {region && (
              <Badge variant="secondary" className="gap-1">
                {region}
                <button onClick={() => setRegion('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">
              {t('annuaire_count', { count: pagination?.total || 0 })}
            </span>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }, (_, i) => (
              <BusinessCardSkeleton key={i} variant={viewMode} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && businesses.length === 0 && (
          <Card className="border-border/40">
            <CardContent className="py-16 px-6 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('annuaire_no_results')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('annuaire_no_results_desc')}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t('annuaire_reset')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {!isLoading && businesses.length > 0 && (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} variant={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('annuaire_previous')}
                </Button>

                <div className="flex items-center gap-1">
                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className="w-8 h-8 rounded flex items-center justify-center text-sm hover:bg-muted"
                      >
                        1
                      </button>
                      {pageNumbers[0] > 2 && <span className="px-1 text-muted-foreground">...</span>}
                    </>
                  )}
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < pagination.totalPages - 1 && (
                        <span className="px-1 text-muted-foreground">...</span>
                      )}
                      <button
                        onClick={() => setPage(pagination.totalPages)}
                        className="w-8 h-8 rounded flex items-center justify-center text-sm hover:bg-muted"
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
                >
                  {t('annuaire_next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
