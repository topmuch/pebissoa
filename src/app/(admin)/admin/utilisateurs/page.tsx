'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Ban, CheckCircle2, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUtilisateursPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionTarget, setActionTarget] = useState<{ id: string; action: string; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ENTERPRISE',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      params.set('limit', '100');
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, ...data }: any) => {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      const messages: Record<string, string> = {
        block: t('admin_users_blocked_msg'),
        unblock: t('admin_users_unblocked_msg'),
      };
      toast.success(messages[variables.action] || 'OK');
      setActionTarget(null);
    },
    onError: () => toast.error(t('admin_users_error')),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/users', {
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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('admin_users_created_msg'));
      closeDialog();
    },
    onError: (err) => toast.error(err.message || t('admin_users_error')),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'ENTERPRISE',
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const users = data?.users || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'ENTERPRISE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return t('admin_users_admin_role');
      case 'ENTERPRISE': return t('admin_users_enterprise_role');
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin_users_title')}</h1>
          <p className="text-muted-foreground">{t('admin_users_subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          {t('admin_users_add')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin_users_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('admin_users_role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin_users_all_roles')}</SelectItem>
                <SelectItem value="ADMIN">{t('admin_users_admin_role')}</SelectItem>
                <SelectItem value="ENTERPRISE">{t('admin_users_enterprise_role')}</SelectItem>
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
                  <TableHead>{t('admin_users_title').slice(0, -1)}</TableHead>
                  <TableHead>{t('admin_users_col_email')}</TableHead>
                  <TableHead>{t('admin_users_role')}</TableHead>
                  <TableHead>{t('admin_ent_col_status')}</TableHead>
                  <TableHead>{t('admin_users_col_signup')}</TableHead>
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin_users_no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="text-xs">{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.isBlocked ? (
                          <Badge variant="destructive" className="text-[10px]">{t('admin_users_blocked_badge')}</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-[10px]">{t('admin_users_active_badge')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          {u.isBlocked ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => setActionTarget({ id: u.id, action: 'unblock', name: u.name })}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-yellow-600"
                              onClick={() => setActionTarget({ id: u.id, action: 'block', name: u.name })}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t text-sm text-muted-foreground">
            {users.length} {t('admin_users_title').toLowerCase()}{users.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Block/Unblock Dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === 'block'
                ? t('admin_users_block_confirm', { name: actionTarget?.name })
                : t('admin_users_unblock_confirm', { name: actionTarget?.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === 'block'
                ? t('admin_users_block_desc')
                : t('admin_users_unblock_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common_cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (actionTarget) {
                actionMutation.mutate({
                  id: actionTarget.id,
                  action: actionTarget.action,
                  isBlocked: actionTarget.action === 'block',
                });
              }
            }}>
              {t('common_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin_users_dialog_add_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('biz_name')} *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={t('dash_settings_fullname')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin_users_col_email')} *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dash_settings_new_password')} *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder={t('dash_settings_password_short')}
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
              <Label>{t('admin_users_role')}</Label>
              <Select value={form.role} onValueChange={(v) => updateField('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('dash_ads_select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t('admin_users_admin_role')}</SelectItem>
                  <SelectItem value="ENTERPRISE">{t('admin_users_enterprise_role')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={closeDialog}>{t('common_cancel')}</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.name.trim() ||
                  !form.email.trim() ||
                  !form.password.trim() ||
                  form.password.length < 6 ||
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
