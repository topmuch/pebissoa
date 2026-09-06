'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useBusinessSlug } from '@/hooks/use-business-slug';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Eye,
  Star,
  Megaphone,
  Camera,
  Package,
  Plus,
  MessageSquare,
  Reply,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const { slug, business, isLoading } = useBusinessSlug();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState('');
  const [respondingReview, setRespondingReview] = useState<string | null>(null);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['business-reviews', slug],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${slug}/reviews?limit=5`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: adsData, isLoading: adsLoading } = useQuery({
    queryKey: ['business-ads', slug],
    queryFn: async () => {
      const res = await fetch(`/api/ads?businessId=${business?.id}&limit=3`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    enabled: !!business?.id,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const res = await fetch(`/api/businesses/${slug}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-reviews', slug] });
      toast.success(t('dash_review_response_sent'));
      setResponseText('');
      setRespondingReview(null);
    },
    onError: () => {
      toast.error(t('dash_review_response_error'));
    },
  });

  if (isLoading || reviewsLoading || adsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">{t('dash_no_business')}</h2>
        <p className="text-muted-foreground">{t('dash_no_business_desc')}</p>
        <Link href="/register">
          <Button className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t('dash_create_business')}
          </Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: t('dash_stat_views'), value: business.views || 0, icon: Eye, color: 'text-primary' },
    { label: t('dash_stat_reviews'), value: business._count?.reviews || 0, icon: Star, color: 'text-pebiss-orange' },
    { label: t('dash_stat_rating'), value: business._avgRating || 0, icon: Star, color: 'text-yellow-500' },
    { label: t('dash_stat_ads'), value: business._count?.ads || 0, icon: Megaphone, color: 'text-green-600' },
  ];

  const adTypeColors: Record<string, string> = {
    SERVICE: 'bg-blue-100 text-blue-800',
    PROMOTION: 'bg-orange-100 text-orange-800',
    PRODUCT: 'bg-green-100 text-green-800',
    EVENT: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dash_title')}</h1>
        <p className="text-muted-foreground">
          {t('dash_welcome', { name: session?.user?.name || t('dash_user_fallback') })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reviews */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('dash_recent_reviews')}
            </CardTitle>
            <CardDescription>{t('dash_recent_reviews_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsData?.reviews?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('dash_no_reviews')}
              </p>
            ) : (
              <div className="space-y-4">
                {reviewsData?.reviews?.map((review: any) => (
                  <div key={review.id} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.user?.name || t('dash_user_fallback')}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    {review.response ? (
                      <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-2">
                        <p className="text-xs font-medium text-primary mb-1">{t('dash_your_response')}</p>
                        <p className="text-sm">{review.response}</p>
                      </div>
                    ) : (
                      <Dialog open={respondingReview === review.id} onOpenChange={(open) => {
                        setRespondingReview(open ? review.id : null);
                        if (!open) setResponseText('');
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="self-start mt-1">
                            <Reply className="mr-1 h-3 w-3" />
                            {t('dash_reply_review')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('dash_reply_review')}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              &quot;{review.comment}&quot;
                            </p>
                            <Textarea
                              placeholder={t('dash_response_placeholder')}
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={4}
                            />
                            <Button
                              onClick={() => respondMutation.mutate({ reviewId: review.id, response: responseText })}
                              disabled={!responseText.trim() || respondMutation.isPending}
                              className="w-full"
                            >
                              {respondMutation.isPending ? t('dash_sending') : t('dash_send_response')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ))}
              </div>
            )}
            {reviewsData?.reviews?.length > 0 && (
              <Link href="/dashboard/reviews">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  {t('dash_view_all_reviews')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Recent Ads */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dash_quick_actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/photos" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Camera className="h-4 w-4" />
                  {t('dash_add_photos')}
                </Button>
              </Link>
              <Link href="/dashboard/products" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="h-4 w-4" />
                  {t('dash_add_product')}
                </Button>
              </Link>
              <Link href="/dashboard/ads" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Megaphone className="h-4 w-4" />
                  {t('dash_create_ad')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dash_recent_ads')}</CardTitle>
            </CardHeader>
            <CardContent>
              {adsData?.ads?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {t('dash_no_ads')}
                </p>
              ) : (
                <div className="space-y-3">
                  {adsData?.ads?.map((ad: any) => (
                    <div key={ad.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      {ad.image ? (
                        <img src={ad.image} alt={ad.title} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Megaphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ad.title}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${adTypeColors[ad.type] || ''}`}>
                          {ad.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard/ads">
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  {t('dash_manage_ads')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Building2(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
    </svg>
  );
}
