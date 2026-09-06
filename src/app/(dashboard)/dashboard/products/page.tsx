'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessSlug } from '@/hooks/use-business-slug';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Package, Briefcase, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { slug, business, isLoading } = useBusinessSlug();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Product/Service form state
  const [form, setForm] = useState({
    name: '', description: '', price: '', imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useState<HTMLInputElement | null>(null);

  const { data: businessData, isLoading: dataLoading } = useQuery({
    queryKey: ['business-detail', slug],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${slug}`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    enabled: !!slug,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingItem?.id
        ? `/api/products?id=${editingItem.id}`
        : '/api/products';
      const method = editingItem?.id ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      toast.success(editingItem?.id ? t('dash_products_saved') : t('dash_products_added'));
      closeDialog();
    },
    onError: () => {
      toast.error(t('dash_products_error'));
    },
  });

  const serviceMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = editingItem?.id
        ? `/api/services?id=${editingItem.id}`
        : '/api/services';
      const method = editingItem?.id ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      toast.success(editingItem?.id ? t('dash_products_service_saved') : t('dash_products_service_added'));
      closeDialog();
    },
    onError: () => {
      toast.error(t('dash_products_error'));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      toast.success(t('dash_products_deleted'));
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(t('dash_products_error'));
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      toast.success(t('dash_products_service_deleted'));
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(t('dash_products_error'));
    },
  });

  const openDialog = (type: string, item?: any) => {
    setEditingItem(item || null);
    setForm({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      imageUrl: item?.imageUrl || '',
    });
    setImagePreview(item?.imageUrl || null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm({ name: '', description: '', price: '', imageUrl: '' });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    let imageUrl = form.imageUrl;

    if (imageFile) {
      try {
        const result = await uploadMutation.mutateAsync(imageFile);
        imageUrl = result.urls?.[0] || result.url;
      } catch {
        toast.error(t('dash_products_upload_error'));
        return;
      }
    }

    const data = {
      ...form,
      imageUrl,
      businessId: business!.id,
    };

    if (activeTab === 'products') {
      productMutation.mutate(data);
    } else {
      serviceMutation.mutate(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const products = businessData?.products || [];
  const services = businessData?.services || [];

  if (isLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dash_products_title')}</h1>
          <p className="text-muted-foreground">{t('dash_products_subtitle')}</p>
        </div>
        <Button onClick={() => openDialog(activeTab)} className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'products' ? t('dash_products_add_product') : t('dash_products_add_service')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            {t('dash_products_tab_products')} ({products.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Briefcase className="h-4 w-4" />
            {t('dash_products_tab_services')} ({services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t('dash_products_empty_products')}</h3>
              <p className="text-muted-foreground mt-1">{t('dash_products_empty_products_desc')}</p>
              <Button onClick={() => openDialog('products')} className="mt-4 bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t('dash_products_add_product')}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden group">
                  {product.imageUrl ? (
                    <div className="aspect-video relative">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        {product.price && (
                          <Badge variant="secondary" className="mt-1">{product.price}</Badge>
                        )}
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('products', product)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog open={deleteTarget?.id === product.id && deleteTarget?.type === 'product'} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: 'product', id: product.id })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('dash_products_delete_product_confirm')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('dash_ads_delete_desc')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProductMutation.mutate(product.id)}>{t('common_delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          {services.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t('dash_products_empty_services')}</h3>
              <p className="text-muted-foreground mt-1">{t('dash_products_empty_services_desc')}</p>
              <Button onClick={() => openDialog('services')} className="mt-4 bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t('dash_products_add_service')}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{service.name}</h3>
                        {service.price && (
                          <Badge variant="secondary" className="mt-1">{service.price}</Badge>
                        )}
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('services', service)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog open={deleteTarget?.id === service.id && deleteTarget?.type === 'service'} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: 'service', id: service.id })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('dash_products_delete_service_confirm')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('dash_ads_delete_desc')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteServiceMutation.mutate(service.id)}>{t('common_delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id
                ? (activeTab === 'products' ? t('dash_products_edit_product') : t('dash_products_edit_service'))
                : (activeTab === 'products' ? t('dash_products_add_product') : t('dash_products_add_service'))
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('dash_products_name')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('dash_products_name')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dash_products_description')}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('dash_products_description')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dash_products_price')}</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ex: 5 000 FCFA"
              />
            </div>
            {activeTab === 'products' && (
              <div className="space-y-2">
                <Label>{t('dash_products_image')}</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() => document.getElementById('product-image-input')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">{t('biz_upload_hint')}</p>
                    </div>
                  )}
                </div>
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.name.trim() || productMutation.isPending || serviceMutation.isPending || uploadMutation.isPending}
                className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white"
              >
                {(productMutation.isPending || serviceMutation.isPending || uploadMutation.isPending) ? t('common_saving') : t('common_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
