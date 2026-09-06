'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Using native <img> for images (standalone mode compatible)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { RatingStars } from '@/components/shared/rating-stars';
import { BusinessCard } from '@/components/shared/business-card';
import { AdminEditBusinessDialog } from '@/components/admin/admin-edit-business-dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import { EnterpriseSidebarBanner, EnterpriseFooterBanner } from '@/components/shared/banner-placement';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Clock,
  Star,
  Package,
  Wrench,
  ImageIcon,
  Eye,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Share2,
  User,
  Copy,
  Tag,
  Pencil,
} from 'lucide-react';

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  keywords?: string | null;
  isActive: boolean;
  views: number;
  avgRating: number;
  createdAt: string;
  category?: { id: string; name: string; slug: string } | null;
  owner?: { id: string; name: string; avatar?: string | null } | null;
  photos: { id: string; url: string; createdAt: string }[];
  products: { id: string; name: string; description?: string | null; price?: string | null; imageUrl?: string | null }[];
  services: { id: string; name: string; description?: string | null; price?: string | null }[];
  hours: { id: string; dayOfWeek: number; openTime?: string | null; closeTime?: string | null; isClosed: boolean }[];
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    response?: string | null;
    createdAt: string;
    user: { id: string; name: string; avatar?: string | null };
  }[];
  _count: { reviews: number; products: number; services: number };
}

interface SimilarBusiness {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  views: number;
  avgRating?: number;
  _count?: { reviews: number };
  category?: { id: string; name: string; slug: string } | null;
}

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.68 4.61V12.7a8.28 8.28 0 005.76 2.29V11.5a4.83 4.83 0 01-3.77-1.58V6.69h3.77z"/>
    </svg>
  );
}

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const DAY_KEYS = ['day_sunday', 'day_monday', 'day_tuesday', 'day_wednesday', 'day_thursday', 'day_friday', 'day_saturday'];



export default function EntrepriseDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, locale } = useTranslation();
  const dayNames = DAY_KEYS.map((k) => t(k));

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSliding, setIsSliding] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: business, isLoading } = useQuery<BusinessData>({
    queryKey: ['business', slug],
    queryFn: () => fetch(`/api/businesses/${slug}`).then((r) => {
      if (!r.ok) throw new Error('Entreprise non trouvée');
      return r.json();
    }),
    enabled: !!slug,
  });

  // All images: cover first, then photos
  const allImages = business
    ? [
        ...(business.coverImage ? [{ id: 'cover', url: business.coverImage }] : []),
        ...business.photos.filter((p) => p.url !== business.coverImage),
      ]
    : [];

  // Auto-slide
  const nextSlide = useCallback(() => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  }, [allImages.length]);

  useEffect(() => {
    if (!isSliding || allImages.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isSliding, nextSlide, allImages.length]);

  const { data: similarBusinesses } = useQuery<{ businesses: SimilarBusiness[] }>({
    queryKey: ['similar-businesses', business?.category?.slug],
    queryFn: () =>
      fetch(`/api/businesses?category=${business?.category?.slug}&limit=4`).then((r) => r.json()),
    enabled: !!business?.category?.slug,
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/businesses/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t('entreprise_review_posted'), description: t('entreprise_review_thanks') });
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['business', slug] });
    },
    onError: (error: Error) => {
      toast({ title: t('common_error'), description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="container mx-auto px-3 py-6 max-w-[1420px] space-y-6">
          <Skeleton className="h-5 w-80" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="w-full aspect-[16/9] rounded" />
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded" />
              <Skeleton className="h-48 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F6F6F6]">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('entreprise_not_found')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('entreprise_not_found_desc')}
          </p>
          <Link href="/annuaire">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('entreprise_back')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasAlreadyReviewed = session && business.reviews.some((r) => r.user.id === session.user.id);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="container mx-auto px-3 py-6 max-w-[1420px]">
        {/* Breadcrumb */}
        <div className="mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-[#242424] hover:text-primary text-sm">{t('entreprise_breadcrumb_home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/annuaire" className="text-[#242424] hover:text-primary text-sm">{t('entreprise_breadcrumb_directory')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {business.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/annuaire?category=${business.category.slug}`} className="text-[#242424] hover:text-primary text-sm">
                        {business.category.slug && categoryTranslations[business.category.slug] ? categoryTranslations[business.category.slug][locale] : business.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-sm text-[#242424]">{business.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ===== LEFT COLUMN (2/3) ===== */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image Gallery */}
            <div className="bg-white border border-[#F0F0F0] rounded overflow-hidden">
              {/* Main Image Slider */}
              <div
                className="relative aspect-[16/9] bg-[#F6F6F6] overflow-hidden"
                onMouseEnter={() => setIsSliding(false)}
                onMouseLeave={() => setIsSliding(true)}
              >
                {allImages.length > 0 ? (
                  <>
                    <img
                      key={currentImageIndex}
                      src={allImages[currentImageIndex].url}
                      alt={`${business.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                    {/* Image counter badge */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-20 w-20 text-gray-300" />
                  </div>
                )}
                {/* Nav arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#F0F0F0] rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#242424]" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#F0F0F0] rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5 text-[#242424]" />
                    </button>
                  </>
                )}
                {/* Dots indicator */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`rounded-full transition-all ${
                          idx === currentImageIndex
                            ? 'w-6 h-2 bg-white'
                            : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-1.5 p-2 overflow-x-auto bg-white">
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`shrink-0 w-[100px] h-[70px] rounded overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category + Meta Row */}
            <div className="bg-white border border-[#F0F0F0] rounded px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#777]">
                {business.category && (
                  <Link href={`/annuaire?category=${business.category.slug}`} className="hover:text-primary">
                    {business.category.slug && categoryTranslations[business.category.slug] ? categoryTranslations[business.category.slug][locale] : business.category.name}
                  </Link>
                )}
                {business.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {business.city}{business.region ? ` > ${business.region}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {t('entreprise_views', { count: business.views })}
                </span>
              </div>
            </div>


            {/* Description Section */}
            <div className="bg-white border border-[#F0F0F0] rounded">
              <div className="px-5 py-4">
                <h4 className="text-lg font-medium text-[#242424] mb-3">{t('entreprise_description_label')}</h4>
                {business.description ? (
                  <p className="text-[#242424] text-[15px] leading-relaxed whitespace-pre-wrap">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-[#777] italic">{t('entreprise_no_description')}</p>
                )}
                {business.keywords && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {business.keywords.split(',').map((kw) => (
                      <span key={kw.trim()} className="text-[#6D6D6D] text-sm">#{kw.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products & Services */}
            {(business.products.length > 0 || business.services.length > 0) && (
              <div className="bg-white border border-[#F0F0F0] rounded">
                <div className="px-5 py-4">
                  {business.products.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-[#242424] mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" /> {t('entreprise_products')} ({business.products.length})
                      </h4>
                      <div className="divide-y divide-[#DDDDDD]">
                        {business.products.map((product) => (
                          <div key={product.id} className="flex items-start gap-4 py-3 first:pt-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded object-cover shrink-0" />
                            ) : (
                              <div className="h-14 w-14 rounded bg-[#F6F6F6] flex items-center justify-center shrink-0">
                                <Package className="h-6 w-6 text-[#777]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-[15px] font-medium text-[#242424]">{product.name}</h5>
                                {product.price && (
                                  <span className="text-sm font-medium text-primary whitespace-nowrap">{product.price}</span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-sm text-[#777] mt-0.5 line-clamp-2">{product.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {business.services.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-[#242424] mb-3 flex items-center gap-2">
                        <Wrench className="h-5 w-5" /> {t('entreprise_services')} ({business.services.length})
                      </h4>
                      <div className="divide-y divide-[#DDDDDD]">
                        {business.services.map((service) => (
                          <div key={service.id} className="flex items-start justify-between py-3 first:pt-0">
                            <div>
                              <h5 className="text-[15px] font-medium text-[#242424]">{service.name}</h5>
                              {service.description && (
                                <p className="text-sm text-[#777] mt-0.5 line-clamp-2">{service.description}</p>
                              )}
                            </div>
                            {service.price && (
                              <span className="text-sm font-medium text-primary whitespace-nowrap">{service.price}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photos Gallery */}
            {business.photos.length > 0 && (
              <div className="bg-white border border-[#F0F0F0] rounded">
                <div className="px-5 py-4">
                  <h4 className="text-lg font-medium text-[#242424] mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" /> {t('entreprise_photos_section')} ({business.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {business.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded overflow-hidden bg-[#F6F6F6]">
                        <img
                          src={photo.url}
                          alt={`${business.name} - photo`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* Opening Hours */}
            {business.hours.length > 0 && (
              <div className="bg-white border border-[#F0F0F0] rounded">
                <div className="px-5 py-4">
                  <h4 className="text-lg font-medium text-[#242424] mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" /> {t('entreprise_opening_hours')}
                  </h4>
                  <div className="divide-y divide-[#DDDDDD]">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const hour = business.hours.find((h) => h.dayOfWeek === day);
                      const isClosed = !hour || hour.isClosed;
                      return (
                        <div key={day} className="flex items-center justify-between py-2.5">
                          <span className={`text-sm font-medium ${isClosed ? 'text-[#777]' : 'text-[#242424]'}`}>
                            {dayNames[day]}
                          </span>
                          <span className={`text-sm ${isClosed ? 'text-[#777] italic' : 'text-[#242424]'}`}>
                            {isClosed ? t('entreprise_closed') : `${hour!.openTime} - ${hour!.closeTime}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
            {(business.address || business.city) && (
              <div className="bg-white border border-[#F0F0F0] rounded">
                <div className="px-5 py-4">
                  <h4 className="text-lg font-medium text-[#242424] mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> {t('entreprise_address_label')}
                  </h4>
                  <p className="text-[#242424] text-[15px] mb-4">
                    {business.address && `${business.address}, `}
                    {business.city}
                    {business.region && `, ${business.region}`}
                    {business.country && ` - ${business.country}`}
                  </p>
                  {(() => {
                    const mapQuery = [business.address, business.city, business.region, business.country].filter(Boolean).join(', ');
                    const encodedQuery = encodeURIComponent(mapQuery || 'Guinée-Bissau');
                    return (
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodedQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="280"
                        style={{ border: 0, borderRadius: '4px' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={t('entreprise_location_title')}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white border border-[#F0F0F0] rounded">
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5" />
                  <h4 className="text-lg font-medium text-[#242424]">
                    {t('entreprise_reviews_title', { count: business._count.reviews })}
                  </h4>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center gap-6 mb-6 pb-5 border-b border-[#F0F0F0]">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-semibold text-primary">{business.avgRating.toFixed(1)}</p>
                    <RatingStars rating={business.avgRating} showValue={false} size="md" />
                    <p className="text-xs text-[#777] mt-1">{t('entreprise_reviews_count', { count: business._count.reviews })}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = business.reviews.filter((r) => r.rating === stars).length;
                      const percentage = business.reviews.length > 0 ? (count / business.reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs w-4 text-[#777] text-right">{stars}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-1.5 bg-[#F6F6F6] rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs text-[#777] w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leave Review */}
                {session && !hasAlreadyReviewed && (
                  <div className="mb-6 p-4 bg-[#F6F6F6] rounded">
                    <h5 className="text-sm font-medium text-[#242424] mb-3">{t('entreprise_leave_review')}</h5>
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder={t('entreprise_review_placeholder')}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="mb-3 text-sm border-[#F0F0F0] focus:border-primary"
                    />
                    <Button
                      onClick={() => { setIsSubmitting(true); reviewMutation.mutate(); }}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white text-sm"
                    >
                      {isSubmitting ? t('entreprise_review_loading') : t('entreprise_review_submit')}
                    </Button>
                  </div>
                )}

                {session && hasAlreadyReviewed && (
                  <p className="text-sm text-[#777] mb-6 p-3 bg-[#F6F6F6] rounded text-center">
                    {t('entreprise_already_reviewed')}
                  </p>
                )}

                {!session && (
                  <div className="mb-6 p-3 bg-[#F6F6F6] rounded text-center">
                    <p className="text-sm text-[#777] mb-2">{t('entreprise_login_to_review')}</p>
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="text-sm">{t('entreprise_login_button')}</Button>
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                {business.reviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[#777] text-sm">{t('entreprise_no_reviews')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0F0F0]">
                    {business.reviews.map((review) => (
                      <div key={review.id} className="py-4 first:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="font-medium text-primary text-xs">
                              {review.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#242424]">{review.user.name}</p>
                            <div className="flex items-center gap-2">
                              <RatingStars rating={review.rating} showValue={false} size="sm" />
                              <span className="text-xs text-[#6D6D6D]">
                                {new Date(review.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[#242424] leading-relaxed ml-12">{review.comment}</p>
                        )}
                        {review.response && (
                          <div className="ml-12 mt-2 pl-3 border-l-2 border-primary/20 bg-primary/5 rounded-r p-2.5">
                            <p className="text-xs font-medium text-primary mb-1">{t('entreprise_owner_response')}</p>
                            <p className="text-xs text-[#777]">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== RIGHT SIDEBAR (1/3) ===== */}
          <div className="space-y-6">
            {/* Card 1: Business Info & Actions */}
            <div className="bg-white border border-[#F0F0F0] rounded">
              {/* Views row */}
              <div className="bg-[#F6F6F6] px-5 py-2.5 flex items-center justify-between text-sm">
                <span className="text-[#777]">{t('entreprise_views_label')}</span>
                <span className="font-medium text-primary">{business.views}</span>
              </div>

              <div className="px-5 py-4">
                {/* Logo + Title */}
                <div className="flex items-start gap-3.5 mb-4">
                  {business.logo ? (
                    <img src={business.logo} alt={business.name} className="h-14 w-14 rounded object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-[#242424] leading-tight mb-1">{business.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {business.category && (
                        <Badge variant="secondary" className="bg-[#F6F6F6] text-[#555] border-none text-xs font-normal px-2 py-0.5">
                          {business.category.slug && categoryTranslations[business.category.slug] ? categoryTranslations[business.category.slug][locale] : business.category.name}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 bg-[#00BA00] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={business.avgRating} reviewCount={business._count.reviews} size="sm" />
                </div>

                {/* Posted date */}
                <div className="flex items-center gap-1.5 text-sm text-[#6D6D6D] mb-5">
                  <Calendar className="h-3.5 w-3.5" />
                  {t('entreprise_published')} {new Date(business.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* Action Buttons */}
                <div className="bg-[#F6F6F6] p-4 flex items-center gap-2 flex-wrap">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} className="flex-1">
                      <Button className="w-full bg-[#242424] hover:bg-[#242424]/90 text-white text-sm py-2.5 rounded justify-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {t('entreprise_call')}
                      </Button>
                    </a>
                  )}
                  {isAdmin && (
                    <Button
                      onClick={() => setEditDialogOpen(true)}
                      variant="outline"
                      className="text-sm py-2.5 border-primary text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      {t('admin_ent_edit_button')}
                    </Button>
                  )}
                  <button
                    onClick={handleCopyLink}
                    className="w-9 h-9 bg-white border border-[#F0F0F0] rounded flex items-center justify-center hover:bg-[#F6F6F6] transition-colors"
                    title={t('entreprise_copy_link')}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4 text-[#242424]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Owner / Author */}
            <div className="bg-white border border-[#F0F0F0] rounded">
              <div className="px-5 py-5">
                <div className="flex items-center gap-4 mb-3">
                  {business.owner?.avatar ? (
                    <img src={business.owner.avatar} alt={business.owner.name} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium text-[#242424]">{business.owner?.name || t('entreprise_owner_label')}</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F6F6F6] text-[#555] text-xs px-2 py-0.5 rounded-sm">{t('entreprise_owner_label')}</span>
                      <span className="flex items-center gap-1 bg-[#00BA00] text-white text-[10px] w-4 h-4 rounded-full items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#6D6D6D]">
                  {t('entreprise_member_since')} {new Date(business.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Sidebar Banner */}
            <EnterpriseSidebarBanner />

            {/* Card 3: Contact & Hours */}
            <div className="bg-white border border-[#F0F0F0] rounded">
              <div className="px-5 py-4">
                {/* Opening Hours Toggle */}
                {business.hours.length > 0 && (
                  <div className="mb-4">
                    <div className="bg-[#F6F6F6] px-4 py-3 flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[#242424]">{t('entreprise_opening_hours')}</span>
                      {(() => {
                        const today = new Date().getDay();
                        const todayHour = business.hours.find((h) => h.dayOfWeek === today);
                        const isOpen = todayHour && !todayHour.isClosed;
                        return (
                          <span className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {isOpen ? t('entreprise_open') : t('entreprise_closed')}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="space-y-0">
                      {business.hours.slice(0, 3).map((hour) => (
                        <div key={hour.id} className="flex items-center justify-between py-1 text-xs text-[#7F7F7F]">
                          <span className="font-medium">{dayNames[hour.dayOfWeek]}</span>
                          <span>{hour.isClosed ? t('entreprise_closed') : `${hour.openTime} - ${hour.closeTime}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {business.phone && (
                  <div className="mb-3">
                    <div className="bg-[#F6FBF6] p-4 flex items-center gap-3 rounded">
                      <Phone className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs text-[#777] mb-0.5">{t('entreprise_phone_label')}</p>
                        <a href={`tel:${business.phone}`} className="text-sm font-medium text-[#242424] hover:text-primary">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="mb-3">
                    <div className="p-4 flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-[#777] mb-0.5">{t('entreprise_email_label')}</p>
                        <a href={`mailto:${business.email}`} className="text-sm font-medium text-[#242424] hover:text-primary">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {business.website && (
                  <div className="mb-3">
                    <div className="p-4 flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#777] mb-0.5">{t('entreprise_website_label')}</p>
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#242424] hover:text-primary flex items-center gap-1 truncate">
                          {business.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block mb-3">
                    <div className="bg-[#25D366] text-white p-4 flex items-center justify-center gap-2 rounded font-medium text-sm">
                      <MessageCircle className="h-5 w-5" />
                      {t('entreprise_whatsapp_message')}
                    </div>
                  </a>
                )}

                {/* Social Links */}
                {(business.facebook || business.instagram || business.twitter || business.linkedin || business.tiktok) && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F0F0F0]">
                    {business.facebook && (
                      <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#F6F6F6] flex items-center justify-center hover:bg-[#eee] transition-colors">
                        <Facebook className="h-4 w-4 text-[#242424]" />
                      </a>
                    )}
                    {business.instagram && (
                      <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#F6F6F6] flex items-center justify-center hover:bg-[#eee] transition-colors">
                        <Instagram className="h-4 w-4 text-[#242424]" />
                      </a>
                    )}
                    {business.twitter && (
                      <a href={business.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#F6F6F6] flex items-center justify-center hover:bg-[#eee] transition-colors">
                        <Twitter className="h-4 w-4 text-[#242424]" />
                      </a>
                    )}
                    {business.linkedin && (
                      <a href={business.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#F6F6F6] flex items-center justify-center hover:bg-[#eee] transition-colors">
                        <Linkedin className="h-4 w-4 text-[#242424]" />
                      </a>
                    )}
                    {business.tiktok && (
                      <a href={business.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#F6F6F6] flex items-center justify-center hover:bg-[#eee] transition-colors">
                        <TikTokIcon className="h-4 w-4 text-[#242424]" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Detail Banner — 728x90 before footer (full width) */}
        <EnterpriseFooterBanner />

        {/* Similar Ads */}
        {similarBusinesses && similarBusinesses.businesses.filter((b) => b.slug !== slug).length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-medium text-[#20292F] mb-5">{t('entreprise_similar')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarBusinesses.businesses
                .filter((b) => b.slug !== slug)
                .slice(0, 4)
                .map((b) => (
                  <BusinessCard key={b.id} business={b} variant="grid" />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Edit Dialog */}
      {isAdmin && business && (
        <AdminEditBusinessDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          business={business}
        />
      )}

      {/* Floating WhatsApp Button */}
      {business.whatsapp && (
        <a
          href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          title={t('whatsapp_contact')}
        >
          <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
            <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.052 31.29l6.128-1.962c2.504 1.624 5.474 2.572 8.652 2.672h.044C24.826 32 32 24.824 32 16.004S24.826 0 16.004 0zm9.348 22.614c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.668-1.218-4.76-2.466-7.824-7.284-8.064-7.604-.228-.32-1.892-2.52-1.892-4.804s1.196-3.404 1.618-3.868c.422-.462.92-.58 1.228-.58.306 0 .612.002.88.014.284.014.664-.108 1.04.796.39.94 1.326 3.234 1.444 3.472.118.236.196.514.04.828-.158.314-.236.508-.472.784-.236.274-.496.614-.708.826-.236.236-.482.49-.206.962.276.472 1.224 2.016 2.628 3.266 1.806 1.6 3.322 2.096 3.796 2.332.474.236.748.196 1.022-.118.276-.314 1.186-1.382 1.502-1.856.316-.472.632-.392 1.064-.236.434.158 2.742 1.292 3.212 1.528.47.236.784.354.902.548.118.196.118 1.116-.272 2.214z"/>
          </svg>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 bg-white text-[#242424] text-sm font-medium px-3 py-2 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('whatsapp_contact')}
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-white" />
          </span>
        </a>
      )}
    </div>
  );
}
