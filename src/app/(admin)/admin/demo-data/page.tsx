'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation, categoryTranslations } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Eye,
  Trash2,
  Building2,
  Plus,
  Pencil,
  Database,
  Upload,
  ChevronRight,
  Utensils,
  Wrench,
  Plane,
  Landmark,
  Sprout,
  ShoppingBag,
  Palette,
  Stethoscope,
  GraduationCap,
  Home,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Icon mapping for categories
const categoryIconMap: Record<string, LucideIcon> = {
  'mode-textile': Palette,
  'restaurants-alimentation': Utensils,
  'tourisme-hotellerie': Plane,
  'services-financiers': Landmark,
  'agriculture-agroalimentaire': Sprout,
  'commerce-distribution': ShoppingBag,
  'btp-construction': Wrench,
  'sante-bien-etre': Stethoscope,
  'education-formation': GraduationCap,
  'immobilier': Home,
};

const categoryGradients: Record<string, string> = {
  'mode-textile': 'from-pink-500 to-rose-600',
  'restaurants-alimentation': 'from-orange-400 to-red-500',
  'tourisme-hotellerie': 'from-cyan-400 to-blue-500',
  'services-financiers': 'from-emerald-400 to-green-600',
  'agriculture-agroalimentaire': 'from-lime-400 to-green-500',
  'commerce-distribution': 'from-violet-500 to-purple-700',
  'btp-construction': 'from-amber-400 to-orange-600',
  'sante-bien-etre': 'from-teal-400 to-emerald-600',
  'education-formation': 'from-sky-400 to-indigo-500',
  'immobilier': 'from-fuchsia-400 to-pink-600',
};

const fallbackGradients = [
  'from-red-400 to-rose-700',
  'from-green-400 to-teal-600',
  'from-yellow-400 to-amber-600',
  'from-indigo-400 to-blue-600',
  'from-rose-400 to-red-600',
  'from-emerald-500 to-cyan-600',
];

function getCategoryGradient(slug: string, index: number): string {
  return categoryGradients[slug] || fallbackGradients[index % fallbackGradients.length];
}

interface BusinessForm {
  businessName: string;
  categoryId: string;
  description: string;
  address: string;
  city: string;
  region: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  logo: string;
  coverImage: string;
}

const emptyForm: BusinessForm = {
  businessName: '',
  categoryId: '',
  description: '',
  address: '',
  city: '',
  region: '',
  businessPhone: '',
  businessEmail: '',
  website: '',
  logo: '',
  coverImage: '',
};

export default function DemoDataPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [form, setForm] = useState<BusinessForm>(emptyForm);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Fetch all businesses (owned by admin)
  const { data, isLoading } = useQuery({
    queryKey: ['demo-businesses', search, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '200');
      const res = await fetch(`/api/admin/businesses?${params}`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  // Filter businesses (client-side: show all businesses, admin-owned first)
  const allBusinesses = data?.businesses || [];
  const categories = categoriesData || [];

  const filteredBusinesses = allBusinesses.filter((b: any) => {
    const matchesSearch = !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.category?.id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category for stats
  const categoryStats = categories.map((cat: any) => ({
    ...cat,
    businessCount: allBusinesses.filter((b: any) => b.category?.id === cat.id).length,
  }));

  const totalBusinesses = allBusinesses.length;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: BusinessForm) => {
      const payload = {
        businessName: data.businessName,
        categoryId: data.categoryId || null,
        description: data.description || null,
        address: data.address || null,
        city: data.city || null,
        region: data.region || null,
        businessPhone: data.businessPhone || null,
        businessEmail: data.businessEmail || null,
        website: data.website || null,
        logo: data.logo || null,
        coverImage: data.coverImage || null,
      };

      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Erreur serveur (${res.status})` }));
        console.error('[DemoData] Create failed:', res.status, err);
        throw new Error(err.error || `Erreur serveur (${res.status})`);
      }
      const result = await res.json();

      return result;
    },
    onSuccess: (data) => {

      queryClient.invalidateQueries({ queryKey: ['demo-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('demo_created_msg'));
      closeCreateDialog();
    },
    onError: (err) => {
      console.error('[DemoData] Mutation error:', err);
      toast.error(err.message || t('demo_error'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<BusinessForm> }) => {
      const res = await fetch(`/api/businesses/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.businessName,
          categoryId: data.categoryId || null,
          description: data.description,
          address: data.address,
          city: data.city,
          region: data.region,
          phone: data.businessPhone,
          email: data.businessEmail,
          website: data.website,
          logo: data.logo,
          coverImage: data.coverImage,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-businesses'] });
      toast.success(t('demo_updated_msg'));
      closeEditDialog();
    },
    onError: (err) => toast.error(err.message || t('demo_error')),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/businesses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('demo_deleted_msg'));
      setDeleteTarget(null);
    },
    onError: () => toast.error(t('demo_error')),
  });

  // Upload handler
  const handleUpload = async (file: File, field: 'logo' | 'coverImage') => {
    const formData = new FormData();
    formData.append('files', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, [field]: data.url }));
        toast.success(t('demo_image_uploaded'));
      } else {
        toast.error(t('demo_upload_error'));
      }
    } catch {
      toast.error(t('demo_upload_error'));
    }
  };

  const [createDialogKey, setCreateDialogKey] = useState(0);
  const [editDialogKey, setEditDialogKey] = useState(0);

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setForm(emptyForm);
    setTimeout(() => setCreateDialogKey(k => k + 1), 100);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingBusiness(null);
    setForm(emptyForm);
    setTimeout(() => setEditDialogKey(k => k + 1), 100);
  };

  const openCreateDialog = () => {
    setForm(emptyForm);
    setCreateDialogKey(k => k + 1);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (business: any) => {
    setEditingBusiness(business);
    setForm({
      businessName: business.name || '',
      categoryId: business.category?.id || '',
      description: business.description || '',
      address: business.address || '',
      city: business.city || '',
      region: business.region || '',
      businessPhone: business.phone || '',
      businessEmail: business.email || '',
      website: business.website || '',
      logo: business.logo || '',
      coverImage: business.coverImage || '',
    });
    setEditDialogOpen(true);
  };

  const updateField = (field: keyof BusinessForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            {t('demo_title')}
          </h1>
          <p className="text-muted-foreground">{t('demo_subtitle')}</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('demo_add_business')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBusinesses}</p>
              <p className="text-xs text-muted-foreground">{t('demo_total_businesses')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">{t('demo_total_categories')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allBusinesses.filter((b: any) => !b.isSuspended && b.isActive).length}</p>
              <p className="text-xs text-muted-foreground">{t('demo_active_businesses')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(allBusinesses.map((b: any) => b.category?.id).filter(Boolean)).size}</p>
              <p className="text-xs text-muted-foreground">{t('demo_categories_used')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('demo_by_category')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : (
            categoryStats.map((cat: any, idx: number) => {
              const Icon = categoryIconMap[cat.slug] || Building2;
              const gradient = getCategoryGradient(cat.slug, idx);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id);
                  }}
                  className={`group relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
                    categoryFilter === cat.id ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <h3 className="text-white text-xs font-semibold leading-tight px-1 line-clamp-2">
                      {cat.slug && categoryTranslations[cat.slug] ? categoryTranslations[cat.slug][locale] : cat.name}
                    </h3>
                    <span className="text-white/70 text-[10px] font-medium">
                      {cat.businessCount} {cat.businessCount > 1 ? t('cat_annonces') : t('cat_annonce')}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('demo_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder={t('demo_all_categories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('demo_all_categories')}</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('demo_col_business')}</TableHead>
                  <TableHead>{t('demo_col_category')}</TableHead>
                  <TableHead>{t('demo_col_city')}</TableHead>
                  <TableHead>{t('demo_col_status')}</TableHead>
                  <TableHead className="text-right">{t('admin_dash_col_views')}</TableHead>
                  <TableHead className="text-right">{t('admin_ent_col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Building2 className="h-10 w-10 opacity-30" />
                        <p className="font-medium">{t('demo_no_results')}</p>
                        <p className="text-sm">{t('demo_no_results_desc')}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={openCreateDialog}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          {t('demo_add_first')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {b.logo ? (
                            <img src={b.logo} alt="" className="h-9 w-9 rounded-lg object-cover border" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center border">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[200px]">{b.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{b.email || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {b.category ? (
                          <Badge variant="secondary" className="text-xs">
                            {b.category.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{b.city || '-'}</TableCell>
                      <TableCell>
                        {b.isSuspended ? (
                          <Badge variant="destructive" className="text-[10px]">{t('admin_ent_suspended')}</Badge>
                        ) : !b.isActive ? (
                          <Badge variant="secondary" className="text-[10px]">{t('demo_inactive')}</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 text-[10px]">{t('admin_ent_active')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">{b.views || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/entreprise/${b.slug}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title={t('demo_view')}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(b)}
                            title={t('demo_edit')}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog open={deleteTarget === b.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteTarget(b.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('demo_delete_confirm', { name: b.name })}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('demo_delete_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)}>
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
          {filteredBusinesses.length > 0 && (
            <div className="p-4 border-t text-sm text-muted-foreground">
              {filteredBusinesses.length} {t('demo_businesses_shown')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ CREATE DIALOG ============ */}
      <Dialog key={`create-${createDialogKey}`} open={createDialogOpen} onOpenChange={(open) => { if (!open) closeCreateDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {t('demo_create_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Category selection - PROMINENT */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                {t('demo_select_category')} *
              </Label>
              <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('demo_choose_category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.categoryId && (
                <div className="flex items-center gap-1.5 mt-2">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {t('demo_category_selected', {
                      name: categories.find((c: any) => c.id === form.categoryId)?.name || '',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('biz_name')} *</Label>
                <Input
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder={t('demo_business_name_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('dash_ads_field_desc')}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t('biz_desc_placeholder')}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-2">
                  <Label>{t('biz_website')}</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('demo_logo_label')}</Label>
                  <div className="flex items-center gap-3">
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="h-12 w-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted border flex items-center justify-center">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file, 'logo');
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        {form.logo ? t('demo_change_image') : t('demo_upload_image')}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('demo_cover_label')}</Label>
                  <div className="flex items-center gap-3">
                    {form.coverImage ? (
                      <img src={form.coverImage} alt="Cover" className="h-12 w-20 rounded-lg object-cover border" />
                    ) : (
                      <div className="h-12 w-20 rounded-lg bg-muted border flex items-center justify-center">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file, 'coverImage');
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        {form.coverImage ? t('demo_change_image') : t('demo_upload_image')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
              💡 {t('demo_admin_hint')}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={closeCreateDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.businessName.trim() || createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {createMutation.isPending ? t('admin_ent_creating') : t('demo_create_button')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT DIALOG ============ */}
      <Dialog key={`edit-${editDialogKey}`} open={editDialogOpen} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              {t('demo_edit_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                {t('demo_select_category')}
              </Label>
              <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('demo_choose_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('demo_no_category')}</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('biz_name')} *</Label>
                <Input
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('dash_ads_field_desc')}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('biz_address')}</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_city')}</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('annuaire_region')}</Label>
                  <Input
                    value={form.region}
                    onChange={(e) => updateField('region', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_phone')}</Label>
                  <Input
                    value={form.businessPhone}
                    onChange={(e) => updateField('businessPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_email')}</Label>
                  <Input
                    type="email"
                    value={form.businessEmail}
                    onChange={(e) => updateField('businessEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_website')}</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </div>
              </div>
              {/* Images */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('demo_logo_label')}</Label>
                  <div className="flex items-center gap-3">
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="h-12 w-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted border flex items-center justify-center">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, 'logo');
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} className="w-full">
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {t('demo_upload_image')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('demo_cover_label')}</Label>
                  <div className="flex items-center gap-3">
                    {form.coverImage ? (
                      <img src={form.coverImage} alt="Cover" className="h-12 w-20 rounded-lg object-cover border" />
                    ) : (
                      <div className="h-12 w-20 rounded-lg bg-muted border flex items-center justify-center">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, 'coverImage');
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} className="w-full">
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {t('demo_upload_image')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={closeEditDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={() => updateMutation.mutate({ slug: editingBusiness?.slug, data: form })}
                disabled={!form.businessName.trim() || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {updateMutation.isPending ? t('common_saving') : t('common_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
