'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessSlug } from '@/hooks/use-business-slug';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, MessageSquare, Reply, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const { t, locale } = useTranslation();
  const { slug, isLoading } = useBusinessSlug();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState('');
  const [editingResponse, setEditingResponse] = useState<{ reviewId: string; text: string } | null>(null);
  const [respondingReview, setRespondingReview] = useState<string | null>(null);
  const [editResponseText, setEditResponseText] = useState('');

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['business-reviews', slug],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${slug}/reviews?limit=100`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    enabled: !!slug,
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
      toast.success(t('dash_reviews_response_sent'));
      setResponseText('');
      setRespondingReview(null);
      setEditingResponse(null);
    },
    onError: () => toast.error(t('dash_reviews_response_error')),
  });

  const handleRespond = (reviewId: string) => {
    if (!responseText.trim()) return;
    respondMutation.mutate({ reviewId, response: responseText });
  };

  const handleEditResponse = () => {
    if (!editingResponse || !editResponseText.trim()) return;
    respondMutation.mutate({ reviewId: editingResponse.reviewId, response: editResponseText });
  };

  if (isLoading || reviewsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const avgRating = reviewsData?.avgRating || 0;
  const totalReviews = reviewsData?.totalReviews || reviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dash_reviews_title')}</h1>
        <p className="text-muted-foreground">{t('dash_reviews_subtitle')}</p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{totalReviews} avis</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r: any) => r.rating === rating).length;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-4">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{t('dash_no_reviews')}</h3>
          <p className="text-muted-foreground mt-1">{t('dash_recent_reviews_desc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {(review.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.user?.name || t('dash_user_fallback')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm pl-[52px]">{review.comment}</p>
                )}

                {/* Response */}
                {review.response ? (
                  <div className="ml-[52px] pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-primary">{t('dash_reviews_your_response')}</p>
                    <p className="text-sm">{review.response}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingResponse({ reviewId: review.id, text: review.response });
                        setEditResponseText(review.response);
                      }}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {t('dash_reviews_edit')}
                    </Button>
                  </div>
                ) : (
                  <div className="pl-[52px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRespondingReview(review.id)}
                    >
                      <Reply className="mr-1 h-3 w-3" />
                      {t('dash_reviews_reply')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Respond Dialog */}
      <Dialog open={!!respondingReview} onOpenChange={(open) => { if (!open) { setRespondingReview(null); setResponseText(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dash_reviews_reply_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('dash_response_placeholder')}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setRespondingReview(null); setResponseText(''); }}>
                {t('common_cancel')}
              </Button>
              <Button
                onClick={() => respondingReview && handleRespond(respondingReview)}
                disabled={!responseText.trim() || respondMutation.isPending}
              >
                {respondMutation.isPending ? t('dash_sending') : t('common_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Response Dialog */}
      <Dialog open={!!editingResponse} onOpenChange={(open) => { if (!open) { setEditingResponse(null); setEditResponseText(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dash_reviews_edit_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('dash_response_placeholder')}
              value={editResponseText}
              onChange={(e) => setEditResponseText(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setEditingResponse(null); setEditResponseText(''); }}>
                {t('common_cancel')}
              </Button>
              <Button
                onClick={handleEditResponse}
                disabled={!editResponseText.trim() || respondMutation.isPending}
              >
                {respondMutation.isPending ? t('common_saving') : t('common_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
