'use client';

import Link from 'next/link';
// Using native <img> instead of next/image for standalone mode compatibility
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  LayoutDashboard,
  LogOut,
  Shield,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation, type Locale } from '@/lib/i18n';

export function Header() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, t } = useTranslation();

  const isAdmin = session?.user?.role === 'ADMIN';
  const isEnterprise = session?.user?.role === 'ENTERPRISE';
  const isAuth = status === 'authenticated';
  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/annuaire', label: t('directory') },
    { href: '/annonces', label: t('ads') },
    { href: '/contact', label: t('contact_page_title') },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="z-50 w-full sticky top-0 bg-white dark:bg-card border-b border-border shadow-sm transition-colors">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/pebiss-logo-rgba.png"
            alt="Pebiss"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" title={t('select_language')}>
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLocale('pt')}
                className={locale === 'pt' ? 'bg-muted font-medium' : ''}
              >
                🇵🇹 Português
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale('fr')}
                className={locale === 'fr' ? 'bg-muted font-medium' : ''}
              >
                🇫🇷 Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('toggle_theme')}</span>
          </Button>

          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isEnterprise && (
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('my_dashboard')}
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('admin_panel')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('disconnect')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src="/pebiss-logo-rgba.png"
                    alt="Pebiss"
                    className="h-10 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Language + Theme in mobile */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setLocale(locale === 'pt' ? 'fr' : 'pt')}
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    {locale === 'pt' ? '🇵🇹 PT' : '🇫🇷 FR'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                    {theme === 'dark' ? t('theme_light') : t('theme_dark')}
                  </Button>
                </div>

                {isAuth ? (
                  <>
                    {isEnterprise && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4 inline" />
                        {t('my_dashboard')}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Shield className="mr-2 h-4 w-4 inline" />
                        {t('admin_panel')}
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4 inline" />
                      {t('disconnect')}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-4 px-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        {t('register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
