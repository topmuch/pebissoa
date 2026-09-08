'use client';

/**
 * Formulaire de connexion partagé — deux espaces distincts :
 *  - variant « annonceur » : /login (propriétaires d'entreprise)
 *  - variant « admin » : /login/admin (administrateurs de la plateforme)
 *
 * Design split-screen : panneau visuel à gauche (photo + bénéfices),
 * formulaire à droite avec touche jaune de la marque.
 */

import { useState } from 'react';
import { signIn, signOut, getSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface LoginFormProps {
  variant: 'annonceur' | 'admin';
}

export function LoginForm({ variant }: LoginFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const isAdmin = variant === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: t('login_error_title'),
          description: t('login_error_msg'),
          variant: 'destructive',
        });
        return;
      }

      const session = await getSession();

      // Espace admin : refus si le compte n'est pas administrateur
      if (isAdmin && session?.user?.role !== 'ADMIN') {
        await signOut({ redirect: false });
        toast({
          title: t('login_error_title'),
          description: t('login_page_not_admin'),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('login_success_title'),
        description: t('login_success_msg'),
      });

      // Redirection dure (window.location) : évite le cache client useSession
      if (session?.user?.role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (session?.user?.role === 'ENTERPRISE') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch {
      toast({
        title: t('login_error_title'),
        description: t('login_error_unexpected'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // --- Contenu selon la variante ---
  const sideBadge = isAdmin ? t('login_page_space_admin') : t('login_page_space_annonceur');
  const sideTitle = isAdmin ? t('login_page_space_admin') : t('login_page_side_title');
  const sideDesc = isAdmin ? t('login_page_admin_desc') : t('login_page_side_desc');
  const benefits = isAdmin
    ? [t('login_page_admin_benefit1'), t('login_page_admin_benefit2'), t('login_page_admin_benefit3')]
    : [t('login_page_benefit1'), t('login_page_benefit2'), t('login_page_benefit3')];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F7FAFD] dark:bg-background">
      {/* ===== Panneau visuel gauche (desktop uniquement) ===== */}
      <div className="relative hidden w-[46%] lg:block" aria-hidden="true">
        <Image
          src="/auth/login-side.jpg"
          alt=""
          fill
          priority
          sizes="46vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('home')}
          </Link>

          <div>
            <span
              className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                isAdmin ? 'bg-white text-[#1F1F1F]' : 'bg-[#0066CC] text-white'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              {sideBadge}
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white mb-3 drop-shadow-sm">
              {sideTitle}
            </h2>
            <p className="text-white/85 text-base leading-relaxed max-w-md mb-8">
              {sideDesc}
            </p>
            <ul className="space-y-3.5">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-white/95 text-sm xl:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4D9FFF]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Panneau formulaire ===== */}
      <div className="flex w-full flex-col justify-center px-4 py-10 sm:px-10 lg:w-[54%] lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* En-tête mobile (remplace le panneau visuel) */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="mb-6 flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('home')}
            </Link>
            <span
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                isAdmin
                  ? 'bg-[#1F1F1F] text-white dark:bg-white dark:text-[#1F1F1F]'
                  : 'bg-[#0066CC] text-white'
              }`}
            >
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              {sideBadge}
            </span>
            <h1 className="text-2xl font-extrabold text-foreground">{t('login_title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin ? t('login_page_admin_note') : t('login_subtitle')}
            </p>
          </div>

          {/* En-tête desktop */}
          <div className="mb-8 hidden lg:block">
            <span
              className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                isAdmin
                  ? 'bg-[#1F1F1F] text-white dark:bg-white dark:text-[#1F1F1F]'
                  : 'bg-[#0066CC] text-white'
              }`}
            >
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              {sideBadge}
            </span>
            <h1 className="text-3xl font-extrabold text-foreground">{t('login_page_welcome_back')}</h1>
            <p className="mt-1.5 text-muted-foreground">{t('login_page_welcome_back_desc')}</p>
          </div>

          {/* Carte formulaire */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login_email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-xl"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login_password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 pr-11 rounded-xl"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={`h-12 w-full rounded-xl text-base font-bold shadow-lg transition-all hover:shadow-xl ${
                  isAdmin
                    ? 'bg-[#1F1F1F] text-white hover:bg-[#333333] shadow-black/10'
                    : 'bg-[#0066CC] text-white hover:bg-[#0052A3] shadow-[#0066CC]/30'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('login_loading')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('login_button')}
                  </div>
                )}
              </Button>
            </form>

            {/* Note espace admin */}
            {isAdmin && (
              <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {t('login_page_admin_note')}
              </p>
            )}
          </div>

          {/* Liens bas de page */}
          <div className="mt-6 space-y-3 text-center">
            {isAdmin ? (
              <p className="text-sm text-muted-foreground">
                {t('login_page_switch_pro')}{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  {t('login_page_switch_pro_link')}
                </Link>
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t('login_no_account')}{' '}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    {t('login_create_account')}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('login_page_switch_admin')}{' '}
                  <Link
                    href="/login/admin"
                    className="inline-flex items-center gap-1 font-semibold text-foreground/70 hover:text-foreground hover:underline"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('login_page_switch_admin_link')}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
