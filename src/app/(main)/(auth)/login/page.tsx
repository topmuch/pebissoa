'use client';

import { useState } from 'react';
import { signIn, getCsrfToken, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, Lock, Building2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      } else {
        // Fetch session to get user role for redirect
        const session = await getSession();
        toast({
          title: t('login_success_title'),
          description: t('login_success_msg'),
        });
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else if (session?.user?.role === 'ENTERPRISE') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              P
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('login_title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('login_subtitle')}
          </p>
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login_email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login_password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t('login_loading')}
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {t('login_button')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('login_no_account')}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t('login_create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
