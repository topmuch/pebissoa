'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAvisPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', search, ratingFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);
      params.set('limit', '100');
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('admin_avis_deleted_msg'));
      setDeleteId(null);
    },
    onError: () => toast.error(t('admin_avis_delete_error')),
  });

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin_avis_title')}</h1>
        <p className="text-muted-foreground">{t('admin_avis_subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin_avis_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('admin_dash_avg_rating')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin_avis_all_ratings')}</SelectItem>
                <SelectItem value="5">5 ★</SelectItem>
                <SelectItem value="4">4 ★</SelectItem>
                <SelectItem value="3">3 ★</SelectItem>
                <SelectItem value="2">2 ★</SelectItem>
                <SelectItem value="1">1 ★</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin_ent_col_business')}</TableHead>
                  <TableHead>{t('admin_avis_col_user')}</TableHead>
                  <TableHead>{t('admin_dash_avg_rating')}</TableHead>
                  <TableHead>{t('admin_avis_col_comment')}</TableHead>
                  <TableHead>{t('admin_dash_col_date')}</TableHead>
                  <TableHead className="text-right">{t('admin_ent_col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin_avis_no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.business?.name || '-'}</TableCell>
                      <TableCell className="text-sm">{r.user?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {r.comment || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          {r.response && (
                            <Badge variant="outline" className="mr-2 text-[10px]">{t('admin_avis_replied_badge')}</Badge>
                          )}
                          <AlertDialog open={deleteId === r.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('dash_photos_delete_confirm')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('dash_ads_delete_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(r.id)}>
                                  {t('common_delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t text-sm text-muted-foreground">
            {reviews.length} {t('admin_avis_title').toLowerCase()}{reviews.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
