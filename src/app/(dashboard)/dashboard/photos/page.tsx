'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessSlug } from '@/hooks/use-business-slug';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  Upload,
  Trash2,
  Camera,
  ImagePlus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PhotosPage() {
  const { t } = useTranslation();
  const { slug, business, isLoading } = useBusinessSlug();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    mutationFn: async (files: File[]) => {
      const fd = new FormData();
      files.forEach((file) => fd.append('files', file));
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: async (data) => {
      const urls = data.files?.map((f: any) => f.url) || (data.url ? [data.url] : []);
      for (const url of urls) {
        await fetch(`/api/businesses/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addPhoto: url }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      toast.success(`${urls.length} ${t('dash_photos_added')}`);
    },
    onError: () => {
      toast.error(t('dash_photos_upload_error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ photoId, photoUrl }: { photoId: string; photoUrl: string }) => {
      const res = await fetch(`/api/businesses/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removePhoto: photoId }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-detail', slug] });
      toast.success(t('dash_photos_deleted'));
      setDeleting(null);
    },
    onError: () => {
      toast.error(t('dash_photos_delete_error'));
    },
  });

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error(t('dash_photos_select_files'));
      return;
    }
    uploadMutation.mutate(validFiles);
  }, [uploadMutation, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const photos = businessData?.photos || [];

  if (isLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dash_photos_title')}</h1>
          <p className="text-muted-foreground">{t('dash_photos_subtitle')} ({photos.length})</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <ImagePlus className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? t('dash_photos_uploading') : t('dash_photos_add')}
        </Button>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="font-medium">
          {isDragging ? t('dash_photos_dropzone_hint') : t('dash_photos_dropzone')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{t('dash_photos_or_click')}</p>
        <p className="text-xs text-muted-foreground mt-2">{t('dash_photos_format')}</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo: any) => (
            <Card key={photo.id} className="overflow-hidden group relative">
              <div className="aspect-square relative">
                <img src={photo.url} alt="Photo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <AlertDialog open={deleting === photo.id} onOpenChange={(open) => setDeleting(open ? photo.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
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
                        <AlertDialogAction onClick={() => deleteMutation.mutate({ photoId: photo.id, photoUrl: photo.url })}>
                          {t('common_delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{t('dash_photos_empty')}</h3>
          <p className="text-muted-foreground mt-1">{t('dash_photos_empty_desc')}</p>
        </div>
      )}
    </div>
  );
}
