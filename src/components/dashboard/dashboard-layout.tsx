'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Camera,
  Package,

  Megaphone,
  Star,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ArrowLeft,
} from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/mon-entreprise', label: t('nav_my_business'), icon: Building2 },
    { href: '/dashboard/photos', label: t('nav_photos'), icon: Camera },
    { href: '/dashboard/products', label: t('nav_products_services'), icon: Package },
    { href: '/dashboard/ads', label: t('nav_ads'), icon: Megaphone },
    { href: '/dashboard/reviews', label: t('nav_reviews'), icon: Star },
    { href: '/dashboard/settings', label: t('nav_settings'), icon: Settings },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ENTERPRISE' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return null;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
          P
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-primary whitespace-nowrap">Pebiss</span>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={session.user.image} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          )}
        </div>
        <div className={cn('mt-3 flex flex-col gap-2', collapsed && 'items-center')}>
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors',
              collapsed ? '' : 'w-full'
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('nav_back_to_site')}</span>}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              'flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors',
              collapsed ? '' : 'w-full'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('disconnect')}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className={cn('h-3 w-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('nav_sheet_title')}</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-card/95 backdrop-blur px-4 h-14">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{t('nav_sheet_title')}</SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              P
            </div>
            <span className="font-bold text-primary">Pebiss</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
