'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Key, Mail, Phone, User, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data: session, update: updateSession } = useSession();

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    email: session?.user?.email || '',
    phone: '',
    name: session?.user?.name || '',
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/auth/change-password', {
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
      toast.success(t('dash_settings_password_updated'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.message || t('dash_settings_password_error'));
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
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
      toast.success(t('dash_settings_profile_updated'));
    },
    onError: (err) => {
      toast.error(err.message || t('dash_settings_update_error'));
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (data) => {
      const url = data.urls?.[0] || data.url;
      profileMutation.mutate({ avatar: url });
    },
    onError: () => {
      toast.error(t('biz_upload_error'));
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('dash_settings_password_mismatch'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t('dash_settings_password_short'));
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dash_settings_title')}</h1>
        <p className="text-muted-foreground">{t('dash_settings_subtitle')}</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('dash_settings_avatar')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-input')?.click()}
                disabled={avatarMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {avatarMutation.isPending ? t('biz_upload_hint').replace('...', '') : t('dash_settings_change_avatar')}
              </Button>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                  e.target.value = '';
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('dash_settings_avatar_format')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('dash_settings_profile_info')}
          </CardTitle>
          <CardDescription>{t('dash_settings_profile_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('dash_settings_fullname')}</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder={t('dash_settings_fullname')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">{t('biz_phone')}</Label>
              <Input
                id="settings-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+245 XX XXX XXXX"
              />
            </div>
            <Button type="submit" disabled={profileMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {profileMutation.isPending ? t('common_saving') : t('common_save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('dash_settings_password_section')}
          </CardTitle>
          <CardDescription>{t('dash_settings_password_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('dash_settings_current_password')}</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('dash_settings_new_password')}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('dash_settings_confirm_password')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={passwordMutation.isPending}>
              <Key className="mr-2 h-4 w-4" />
              {passwordMutation.isPending ? t('dash_settings_updating_password') : t('dash_settings_change_password')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
