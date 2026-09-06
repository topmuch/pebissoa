'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Globe, Search, Share2, Mail, Bell, ImageIcon, Upload, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.68 4.61V12.7a8.28 8.28 0 005.76 2.29V11.5a4.83 4.83 0 01-3.77-1.58V6.69h3.77z"/>
    </svg>
  );
}

export default function AdminParametresPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const seoImageInputRef = useRef<HTMLInputElement>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  const [form, setForm] = useState({
    siteName: '',
    logo: '',
    favicon: '',
    address: '',
    phone: '',
    email: '',
    seoTitle: '',
    seoDescription: '',
    seoImage: '',
    defaultLang: 'pt',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    whatsapp: '',
    tiktok: '',
    // SMTP
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    smtpFromName: '',
    smtpFromEmail: '',
    smtpEncryption: 'none',
    // Notifications
    notifNewAd: true,
    notifNewReview: true,
    notifWeeklyReport: false,
    notifAdApproved: true,
    notifWelcome: true,
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: '',
    maintenanceEndTime: '',
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize form when data loads (useEffect to avoid setState during render)
  useEffect(() => {
    if (config && !initialized) {
      setForm({
        siteName: config.siteName || '',
        logo: config.logo || '',
        favicon: config.favicon || '',
        address: config.address || '',
        phone: config.phone || '',
        email: config.email || '',
        seoTitle: config.seoTitle || '',
        seoDescription: config.seoDescription || '',
        seoImage: config.seoImage || '',
        defaultLang: config.defaultLang || 'pt',
        facebook: config.facebook || '',
        instagram: config.instagram || '',
        twitter: config.twitter || '',
        linkedin: config.linkedin || '',
        whatsapp: config.whatsapp || '',
        tiktok: config.tiktok || '',
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort || '',
        smtpUser: config.smtpUser || '',
        smtpPassword: config.smtpPassword || '',
        smtpFromName: config.smtpFromName || '',
        smtpFromEmail: config.smtpFromEmail || '',
        smtpEncryption: config.smtpEncryption || 'none',
        notifNewAd: config.notifNewAd ?? true,
        notifNewReview: config.notifNewReview ?? true,
        notifWeeklyReport: config.notifWeeklyReport ?? false,
        notifAdApproved: config.notifAdApproved ?? true,
        notifWelcome: config.notifWelcome ?? true,
        maintenanceMode: config.maintenanceMode ?? false,
        maintenanceMessage: config.maintenanceMessage || '',
        maintenanceEndTime: config.maintenanceEndTime ? new Date(config.maintenanceEndTime).toISOString().slice(0, 16) : '',
      });
      setInitialized(true);
    }
  }, [config, initialized]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('files', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(t('admin_settings_upload_error'));
      return res.json();
    },
  });

  const handleUpload = async (field: 'logo' | 'seoImage', file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      updateField(field, result.url);
      toast.success(t('admin_settings_image_uploaded'));
    } catch {
      toast.error(t('admin_settings_upload_error'));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/settings', {
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
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      toast.success(t('admin_settings_saved'));
    },
    onError: (err) => toast.error(err.message || t('admin_settings_save_error')),
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const [testEmail, setTestEmail] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error(locale === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Por favor, insira um endereço de email válido');
      return;
    }
    setTestEmailSending(true);
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
      toast.success(t('admin_settings_test_email_success'));
    } catch (err: any) {
      toast.error(err.message || t('admin_settings_test_email_error'));
    } finally {
      setTestEmailSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin_settings_title')}</h1>
        <p className="text-muted-foreground">{t('admin_settings_subtitle')}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            {t('admin_settings_tab_general')}
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            {t('admin_settings_tab_seo')}
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            {t('admin_settings_tab_social')}
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            {t('admin_settings_tab_email')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('admin_settings_tab_notifications')}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Wrench className="h-4 w-4" />
            {t('admin_settings_tab_maintenance')}
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_site_info')}</CardTitle>
              <CardDescription>{t('admin_settings_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('admin_settings_site_name')}</Label>
                  <Input
                    value={form.siteName}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    placeholder={t('admin_settings_site_name')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_default_lang')}</Label>
                  <Select value={form.defaultLang} onValueChange={(v) => updateField('defaultLang', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin_settings_select_lang')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">{t('admin_settings_lang_pt')}</SelectItem>
                      <SelectItem value="fr">{t('admin_settings_lang_fr')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Logo */}
              <div className="space-y-3">
                <Label>{t('admin_settings_logo')}</Label>
                {form.logo && (
                  <div className="relative inline-block">
                    <img
                      src={form.logo}
                      alt="Logo"
                      className="h-16 w-auto rounded-lg border object-contain bg-white p-1"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadMutation.isPending ? t('dash_photos_uploading') : t('admin_settings_upload_logo')}
                  </Button>
                  {form.logo && (
                    <Button variant="ghost" onClick={() => updateField('logo', '')}>
                      {t('common_delete')}
                    </Button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload('logo', file);
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold mb-4">{t('admin_settings_contact_info')}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('admin_settings_address')}</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder={t('admin_settings_address')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_settings_phone')}</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+245 XX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t('admin_settings_email')}</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="contact@pebiss.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_seo_title')}</CardTitle>
              <CardDescription>{t('admin_settings_seo_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('admin_settings_seo_title_label')}</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => updateField('seoTitle', e.target.value)}
                  placeholder={t('admin_settings_seo_title_label')}
                />
                <p className="text-xs text-muted-foreground">
                  {locale === 'fr' ? 'Ce titre apparaît dans les résultats de recherche. Recommandé : 50-60 caractères.' : 'Este título aparece nos resultados de pesquisa. Recomendado: 50-60 caracteres.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t('admin_settings_seo_desc_label')}</Label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(e) => updateField('seoDescription', e.target.value)}
                  placeholder={t('admin_settings_seo_desc_label')}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {locale === 'fr' ? 'Cette description apparaît sous le titre dans les résultats. Recommandé : 150-160 caractères.' : 'Esta descrição aparece sob o título nos resultados. Recomendado: 150-160 caracteres.'}
                </p>
              </div>

              <Separator />

              {/* SEO Image */}
              <div className="space-y-3">
                <Label>{t('admin_settings_seo_image')}</Label>
                {form.seoImage && (
                  <div className="relative inline-block">
                    <img
                      src={form.seoImage}
                      alt="SEO"
                      className="h-24 w-40 rounded-lg border object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => seoImageInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {uploadMutation.isPending ? t('dash_photos_uploading') : t('admin_settings_upload_seo_image')}
                  </Button>
                  {form.seoImage && (
                    <Button variant="ghost" onClick={() => updateField('seoImage', '')}>
                      {t('common_delete')}
                    </Button>
                  )}
                  <input
                    ref={seoImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload('seoImage', file);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('admin_settings_seo_image_desc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_tab_social')}</CardTitle>
              <CardDescription>{t('biz_social_info')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={form.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  placeholder="https://facebook.com/pebiss"
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={form.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="https://instagram.com/pebiss"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X</Label>
                <Input
                  value={form.twitter}
                  onChange={(e) => updateField('twitter', e.target.value)}
                  placeholder="https://twitter.com/pebiss"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={form.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/pebiss"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="+245 XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TikTokIcon className="h-4 w-4" />
                  TikTok
                </Label>
                <Input
                  value={form.tiktok}
                  onChange={(e) => updateField('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@pebiss"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_email_config')}</CardTitle>
              <CardDescription>{t('admin_settings_email_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('admin_settings_smtp_host')}</Label>
                  <Input
                    value={form.smtpHost}
                    onChange={(e) => updateField('smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_port')}</Label>
                  <Input
                    value={form.smtpPort}
                    onChange={(e) => updateField('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_encryption')}</Label>
                  <Select value={form.smtpEncryption} onValueChange={(v) => updateField('smtpEncryption', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('admin_settings_smtp_encryption_none')}</SelectItem>
                      <SelectItem value="tls">{t('admin_settings_smtp_encryption_tls')}</SelectItem>
                      <SelectItem value="ssl">{t('admin_settings_smtp_encryption_ssl')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_user')}</Label>
                  <Input
                    value={form.smtpUser}
                    onChange={(e) => updateField('smtpUser', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_password')}</Label>
                  <Input
                    type="password"
                    value={form.smtpPassword}
                    onChange={(e) => updateField('smtpPassword', e.target.value)}
                    placeholder="•••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_from_name')}</Label>
                  <Input
                    value={form.smtpFromName}
                    onChange={(e) => updateField('smtpFromName', e.target.value)}
                    placeholder={t('admin_settings_site_name')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin_settings_smtp_from_email')}</Label>
                  <Input
                    type="email"
                    value={form.smtpFromEmail}
                    onChange={(e) => updateField('smtpFromEmail', e.target.value)}
                    placeholder="noreply@pebiss.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{locale === 'fr' ? 'Email de destination pour le test' : 'Email de destino para o teste'}</Label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'fr'
                      ? 'Entrez l\'adresse email où vous souhaitez recevoir l\'email de test.'
                      : 'Insira o endereço de email onde deseja receber o email de teste.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={!form.smtpHost || !form.smtpUser || !form.smtpPassword || !testEmail || testEmailSending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {testEmailSending
                    ? (locale === 'fr' ? 'Envoi en cours...' : 'Enviando...')
                    : t('admin_settings_test_email')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_notifications_config')}</CardTitle>
              <CardDescription>{t('admin_settings_notifications_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{t('admin_settings_notif_new_ad')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin_settings_notif_new_ad_desc')}</p>
                  </div>
                  <Switch
                    checked={form.notifNewAd}
                    onCheckedChange={(checked) => updateField('notifNewAd', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{t('admin_settings_notif_new_review')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin_settings_notif_new_review_desc')}</p>
                  </div>
                  <Switch
                    checked={form.notifNewReview}
                    onCheckedChange={(checked) => updateField('notifNewReview', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{t('admin_settings_notif_weekly_report')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin_settings_notif_weekly_report_desc')}</p>
                  </div>
                  <Switch
                    checked={form.notifWeeklyReport}
                    onCheckedChange={(checked) => updateField('notifWeeklyReport', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{t('admin_settings_notif_ad_approved')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin_settings_notif_ad_approved_desc')}</p>
                  </div>
                  <Switch
                    checked={form.notifAdApproved}
                    onCheckedChange={(checked) => updateField('notifAdApproved', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{t('admin_settings_notif_welcome')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin_settings_notif_welcome_desc')}</p>
                  </div>
                  <Switch
                    checked={form.notifWelcome}
                    onCheckedChange={(checked) => updateField('notifWelcome', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin_settings_maintenance_title')}</CardTitle>
              <CardDescription>{t('admin_settings_maintenance_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">
                    {form.maintenanceMode
                      ? t('admin_settings_maintenance_active')
                      : t('admin_settings_maintenance_disable')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('admin_settings_maintenance_enable')}
                  </p>
                </div>
                <Switch
                  checked={form.maintenanceMode}
                  onCheckedChange={(checked) => updateField('maintenanceMode', checked)}
                />
              </div>

              {/* Warning */}
              {form.maintenanceMode && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('admin_settings_maintenance_warning')}
                  </p>
                </div>
              )}

              <Separator />

              {/* Message */}
              <div className="space-y-2">
                <Label>{t('admin_settings_maintenance_message')}</Label>
                <Textarea
                  value={form.maintenanceMessage}
                  onChange={(e) => updateField('maintenanceMessage', e.target.value)}
                  placeholder={t('admin_settings_maintenance_message_placeholder')}
                  rows={3}
                />
              </div>

              {/* End time */}
              <div className="space-y-2">
                <Label>{t('admin_settings_maintenance_end_time')}</Label>
                <Input
                  type="datetime-local"
                  value={form.maintenanceEndTime}
                  onChange={(e) => updateField('maintenanceEndTime', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin_settings_maintenance_end_time_hint')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-6">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white"
          size="lg"
        >
          <Settings className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? t('admin_settings_saving') : t('admin_settings_save')}
        </Button>
      </div>
    </div>
  );
}
