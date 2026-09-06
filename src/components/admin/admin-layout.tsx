'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Users,
  Megaphone,
  Star,
  LogOut,
  Menu,
  ChevronLeft,
  ArrowLeft,
  Shield,
  Settings,
  Sun,
  Moon,
  Database,
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const navItemsTranslated = [
    { href: '/admin', label: t('nav_dashboard'), icon: LayoutDashboard },
    { href: '/admin/demo-data', label: t('nav_demo_data'), icon: Database },
    { href: '/admin/entreprises', label: t('nav_enterprises'), icon: Building2 },
    { href: '/admin/categories', label: t('nav_categories'), icon: Tag },
    { href: '/admin/utilisateurs', label: t('nav_users'), icon: Users },
    { href: '/admin/annonces', label: t('nav_ads'), icon: Megaphone },
    { href: '/admin/avis', label: t('nav_reviews'), icon: Star },
    { href: '/admin/parametres', label: t('nav_settings'), icon: Settings },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#004A99] dark:bg-[#1e3a5f]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#004A99] dark:bg-white dark:text-[#1e3a5f] font-bold text-lg shrink-0">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white whitespace-nowrap">Pebiss</span>
            <span className="text-[10px] text-blue-200 leading-none">{t('nav_admin_section')}</span>
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItemsTranslated.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-white text-[#004A99] dark:bg-white dark:text-[#1e3a5f] shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/15'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* Theme toggle */}
      <div className="px-3 py-3">
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full',
            'text-blue-100 hover:text-white hover:bg-white/15'
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && (
            <span>{theme === 'dark' ? t('theme_light') : t('theme_dark')}</span>
          )}
        </button>
      </div>

      <Separator className="bg-white/10" />

      {/* User section */}
      <div className="p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={session.user.image} />
            <AvatarFallback className="bg-white text-[#004A99] dark:bg-white dark:text-[#1e3a5f] text-xs">
              {session.user.name?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{session.user.name}</p>
              <p className="text-xs text-blue-200 truncate">{t('nav_admin_label')}</p>
            </div>
          )}
        </div>
        <Link
          href="/"
          className={cn('flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors mt-3', collapsed ? 'justify-center' : '')}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('nav_back_to_site')}</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn('flex items-center gap-2 text-sm text-red-300 hover:text-red-200 transition-colors mt-2', collapsed ? 'justify-center' : '')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('disconnect')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#004A99] dark:bg-[#1e3a5f] shadow-sm hover:bg-[#005AB3] dark:hover:bg-[#2a5080] transition-colors"
        >
          <ChevronLeft className={cn('h-3 w-3 text-white transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#004A99] dark:bg-[#1e3a5f]">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('nav_admin_sheet_title')}</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-card/95 backdrop-blur px-4 h-14">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[#004A99] dark:bg-[#1e3a5f]">
                <SheetHeader className="sr-only">
                  <SheetTitle>{t('nav_admin_sheet_title')}</SheetTitle>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004A99] dark:bg-[#1e3a5f] text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-[#004A99] dark:text-blue-400">Pebiss Admin</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-auto">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Desktop header bar */}
        <header className="hidden lg:flex sticky top-0 z-40 items-center justify-between border-b bg-card/95 backdrop-blur px-6 h-14">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {navItemsTranslated.find(item => isActive(item.href))?.label || t('nav_dashboard')}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>{t('theme_light')}</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>{t('theme_dark')}</span>
              </>
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
