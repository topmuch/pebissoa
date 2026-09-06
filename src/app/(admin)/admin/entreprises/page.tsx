'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, Ban, CheckCircle2, Trash2, Building2, Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminEntreprisesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionTarget, setActionTarget] = useState<{ id: string; action: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createWithOwner, setCreateWithOwner] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    categoryId: '',
    description: '',
    address: '',
    city: '',
    region: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');
      const res = await fetch(`/api/admin/businesses?${params}`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, ...data }: { id: string; action: string; [key: string]: any }) => {
      if (action === 'delete') {
        const res = await fetch(`/api/admin/businesses`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Erreur');
        return res.json();
      }
      const res = await fetch(`/api/admin/businesses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      const messages: Record<string, string> = {
        suspend: t('admin_ent_suspended_msg'),
        activate: t('admin_ent_activated_msg'),
        delete: t('admin_ent_deleted_msg'),
      };
      toast.success(messages[variables.action] || 'OK');
      setActionTarget(null);
    },
    onError: () => {
      toast.error(t('admin_ent_error'));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      toast.success(t('admin_ent_created_msg'));
      closeDialog();
    },
    onError: (err) => toast.error(err.message || t('admin_ent_error')),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setCreateWithOwner(false);
    setForm({
      businessName: '',
      categoryId: '',
      description: '',
      address: '',
      city: '',
      region: '',
      businessPhone: '',
      businessEmail: '',
      website: '',
      ownerName: '',
      ownerEmail: '',
      ownerPassword: '',
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const businesses = data?.businesses || [];
  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin_ent_title')}</h1>
          <p className="text-muted-foreground">{t('admin_ent_subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          {t('admin_ent_add')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin_ent_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin_ent_all_status')}</SelectItem>
                <SelectItem value="active">{t('admin_ent_active')}</SelectItem>
                <SelectItem value="suspended">{t('admin_ent_suspended')}</SelectItem>
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
                  <TableHead>{t('admin_ent_col_category')}</TableHead>
                  <TableHead>{t('admin_ent_col_city')}</TableHead>
                  <TableHead>{t('admin_ent_col_status')}</TableHead>
                  <TableHead className="text-right">{t('admin_dash_col_views')}</TableHead>
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
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin_ent_no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {b.logo ? (
                            <img src={b.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[180px]">{b.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{b.owner?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{b.category?.name || '-'}</TableCell>
                      <TableCell className="text-sm">{b.city || '-'}</TableCell>
                      <TableCell>
                        {b.isSuspended ? (
                          <Badge variant="destructive" className="text-[10px]">{t('admin_ent_suspended')}</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-[10px]">{t('admin_ent_active')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">{b.views || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/entreprise/${b.slug}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          {b.isSuspended ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => actionMutation.mutate({ id: b.id, action: 'activate', isSuspended: false, isActive: true })}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-yellow-600"
                              onClick={() => actionMutation.mutate({ id: b.id, action: 'suspend', isSuspended: true })}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}
                          <AlertDialog open={actionTarget?.id === b.id && actionTarget?.action === 'delete'} onOpenChange={(open) => !open && setActionTarget(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setActionTarget({ id: b.id, action: 'delete' })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin_ent_delete_confirm', { name: b.name })}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('admin_ent_delete_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => actionMutation.mutate({ id: b.id, action: 'delete' })}>
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
            {businesses.length} {t('admin_ent_title').toLowerCase()}{businesses.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Add Business Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin_ent_dialog_add_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Business Info */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('admin_ent_dialog_info')}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('biz_name')} *</Label>
                  <Input
                    value={form.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder={t('biz_name')}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('biz_category')}</Label>
                  <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('search_select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('dash_ads_field_desc')}</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder={t('biz_desc_placeholder')}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_address')}</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder={t('biz_address')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_city')}</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder={t('biz_city')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('annuaire_region')}</Label>
                  <Input
                    value={form.region}
                    onChange={(e) => updateField('region', e.target.value)}
                    placeholder={t('annuaire_region')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_phone')}</Label>
                  <Input
                    value={form.businessPhone}
                    onChange={(e) => updateField('businessPhone', e.target.value)}
                    placeholder="+245 XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_email')}</Label>
                  <Input
                    type="email"
                    value={form.businessEmail}
                    onChange={(e) => updateField('businessEmail', e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('biz_website')}</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{t('admin_ent_owner_info')}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="create-with-owner" className="text-xs text-muted-foreground cursor-pointer">
                    {t('admin_ent_create_with_owner')}
                  </Label>
                  <Switch id="create-with-owner" checked={createWithOwner} onCheckedChange={setCreateWithOwner} />
                </div>
              </div>
              {createWithOwner && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('admin_ent_owner_name')} *</Label>
                    <Input
                      value={form.ownerName}
                      onChange={(e) => updateField('ownerName', e.target.value)}
                      placeholder={t('dash_settings_fullname')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_ent_owner_email')} *</Label>
                    <Input
                      type="email"
                      value={form.ownerEmail}
                      onChange={(e) => updateField('ownerEmail', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t('dash_settings_new_password')} *</Label>
                    <Input
                      type="password"
                      value={form.ownerPassword}
                      onChange={(e) => updateField('ownerPassword', e.target.value)}
                      placeholder={t('dash_settings_password_short')}
                    />
                  </div>
                </div>
              )}
              {!createWithOwner && (
                <p className="text-xs text-muted-foreground">
                  {t('admin_ent_owner_admin_hint')}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={closeDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.businessName.trim() ||
                  (createWithOwner && (!form.ownerName.trim() || !form.ownerEmail.trim() || !form.ownerPassword.trim() || form.ownerPassword.length < 6)) ||
                  createMutation.isPending
                }
                className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white"
              >
                {createMutation.isPending ? t('admin_ent_creating') : t('admin_ent_create_button')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
