'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ hasBusinesses: boolean }>({ hasBusinesses: false });
  const [form, setForm] = useState({ name: '', icon: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/categories', {
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin_cats_created_msg'));
      closeDialog();
    },
    onError: (err) => toast.error(err.message || t('admin_ent_error')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin_cats_updated_msg'));
      closeDialog();
    },
    onError: (err) => toast.error(err.message || t('admin_ent_error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin_cats_deleted_msg'));
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || t('admin_ent_error')),
  });

  const openDialog = (cat?: any) => {
    setEditingCategory(cat || null);
    setForm({ name: cat?.name || '', icon: cat?.icon || '', description: cat?.description || '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setForm({ name: '', icon: '', description: '' });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingCategory?.id) {
      updateMutation.mutate({ id: editingCategory.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDeleteClick = (cat: any) => {
    setDeleteId(cat.id);
    setDeleteInfo({ hasBusinesses: (cat._count?.businesses || 0) > 0 });
  };

  const categories = Array.isArray(data) ? data : data?.categories || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin_cats_title')}</h1>
          <p className="text-muted-foreground">{t('admin_cats_subtitle')}</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          {t('admin_cats_add')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin_cats_col_icon')}</TableHead>
                  <TableHead>{t('admin_cats_name_label')}</TableHead>
                  <TableHead>{t('admin_cats_col_slug')}</TableHead>
                  <TableHead className="text-center">{t('admin_cats_col_businesses')}</TableHead>
                  <TableHead className="text-right">{t('admin_ent_col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('admin_cats_no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat: any) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        {cat.icon ? (
                          <span className="text-2xl">{cat.icon}</span>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">{cat._count?.businesses || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(cat)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <AlertDialog open={deleteId === cat.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteClick(cat)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin_cats_delete_confirm', { name: cat.name })}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {deleteInfo.hasBusinesses
                                    ? t('admin_cats_delete_desc')
                                    : t('dash_ads_delete_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
                                {deleteInfo.hasBusinesses ? (
                                  <AlertDialogAction disabled>{t('common_delete')}</AlertDialogAction>
                                ) : (
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(cat.id)}>
                                    {t('common_delete')}
                                  </AlertDialogAction>
                                )}
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id ? t('admin_cats_edit_title') : t('admin_cats_add')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('admin_cats_name_label')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('admin_cats_name_label')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin_cats_icon_label')}</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Ex: 🍽️"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dash_products_description')}</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('dash_products_description')}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}
                className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) ? t('common_saving') : t('common_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
