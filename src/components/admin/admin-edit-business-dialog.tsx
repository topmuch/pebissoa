'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { X, Upload, ImageIcon, Loader2, Pencil } from 'lucide-react';
import type { BusinessData } from '@/app/(main)/entreprise/[slug]/EntrepriseDetailClient';

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.68 4.61V12.7a8.28 8.28 0 005.76 2.29V11.5a4.83 4.83 0 01-3.77-1.58V6.69h3.77z"/>
    </svg>
  );
}

interface AdminEditBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessData;
}

export function AdminEditBusinessDialog({ open, onOpenChange, business }: AdminEditBusinessDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: business.name,
    description: business.description || '',
    address: business.address || '',
    city: business.city || '',
    region: business.region || '',
    country: business.country || 'Guinée-Bissau',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    categoryId: business.category?.id || '',
    keywords: business.keywords || '',
    facebook: business.facebook || '',
    instagram: business.instagram || '',
    twitter: business.twitter || '',
    linkedin: business.linkedin || '',
    whatsapp: business.whatsapp || '',
    tiktok: business.tiktok || '',
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name,
        description: business.description || '',
        address: business.address || '',
        city: business.city || '',
        region: business.region || '',
        country: business.country || 'Guinée-Bissau',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        categoryId: business.category?.id || '',
        keywords: business.keywords || '',
        facebook: business.facebook || '',
        instagram: business.instagram || '',
        twitter: business.twitter || '',
        linkedin: business.linkedin || '',
        whatsapp: business.whatsapp || '',
        tiktok: business.tiktok || '',
      });
    }
  }, [business]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });
  const categories = categoriesData || [];

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${business.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          address: form.address,
          city: form.city,
          region: form.region,
          country: form.country,
          phone: form.phone,
          email: form.email,
          website: form.website,
          categoryId: form.categoryId || null,
          keywords: form.keywords,
          facebook: form.facebook,
          instagram: form.instagram,
          twitter: form.twitter,
          linkedin: form.linkedin,
          whatsapp: form.whatsapp,
          tiktok: form.tiktok,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur');
      }
      queryClient.invalidateQueries({ queryKey: ['business', business.slug] });
      toast.success(t('admin_ent_saved'));
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t('admin_ent_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const urls = uploadData.files?.map((f: any) => f.url) || [];

      for (const url of urls) {
        await fetch(`/api/businesses/${business.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addPhoto: url }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['business', business.slug] });
      toast.success(t('admin_ent_photo_added'));
    } catch {
      toast.error(t('admin_ent_photo_error'));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;
    try {
      const res = await fetch(`/api/businesses/${business.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removePhoto: photoToDelete }),
      });
      if (!res.ok) throw new Error('Erreur');
      queryClient.invalidateQueries({ queryKey: ['business', business.slug] });
      toast.success(t('admin_ent_photo_removed'));
    } catch {
      toast.error(t('admin_ent_photo_error'));
    } finally {
      setPhotoToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              {t('admin_ent_edit_title')} — {business.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">{t('admin_ent_tab_info')}</TabsTrigger>
              <TabsTrigger value="social">{t('admin_ent_tab_social')}</TabsTrigger>
              <TabsTrigger value="photos">{t('admin_ent_tab_photos')}</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('biz_name')} *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
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
                    rows={4}
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
                  <Label>{t('register_country')}</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="Guinée-Bissau"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_phone')}</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+245 XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('biz_email')}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
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
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('biz_keywords')}</Label>
                  <Input
                    value={form.keywords}
                    onChange={(e) => updateField('keywords', e.target.value)}
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    value={form.facebook}
                    onChange={(e) => updateField('facebook', e.target.value)}
                    placeholder="https://facebook.com/entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={form.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="https://instagram.com/entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input
                    value={form.twitter}
                    onChange={(e) => updateField('twitter', e.target.value)}
                    placeholder="https://twitter.com/entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={form.linkedin}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="+245 9XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input
                    value={form.tiktok}
                    onChange={(e) => updateField('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@entreprise"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('admin_ent_photos_count', { count: business.photos.length })}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingPhoto ? t('dash_photos_uploading') : t('admin_ent_add_photos')}
                  </Button>
                </div>
              </div>
              {business.photos.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {business.photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setPhotoToDelete(photo.id)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm">{t('admin_ent_no_photos')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common_cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin_ent_saving')}
                </>
              ) : (
                t('admin_ent_save_button')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Confirmation */}
      <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin_ent_delete_photo_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin_ent_delete_photo_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive hover:bg-destructive/90">
              {t('common_delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
