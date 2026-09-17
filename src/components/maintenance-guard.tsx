'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Wrench, Clock, CalendarDays, RefreshCw, LogIn } from 'lucide-react';
import Link from 'next/link';

interface MaintenanceData {
  active: boolean;
  message?: string;
  startTime?: string | null;
  endTime?: string | null;
  logo?: string | null;
}

function calculateTimeLeft(endTime: number) {
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function MaintenanceScreen({ data }: { data: MaintenanceData }) {
  const { t, locale } = useTranslation();
  const endTimeMs = data.endTime ? new Date(data.endTime).getTime() : null;
  const [timeLeft, setTimeLeft] = useState(() =>
    endTimeMs ? calculateTimeLeft(endTimeMs) : null
  );

  useEffect(() => {
    if (!endTimeMs) return;
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(endTimeMs);
      setTimeLeft(remaining);
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        setTimeout(() => window.location.reload(), 3000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimeMs]);

  const message = data.message || t('maintenance_default_message');

  // Formatage jour + heure selon la langue courante (ex : "dimanche 21 septembre 2026 à 14:30")
  const dateLocale = locale === 'pt' ? 'pt-PT' : locale === 'en' ? 'en-US' : 'fr-FR';
  const formatDay = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const day = new Intl.DateTimeFormat(dateLocale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    const hour = new Intl.DateTimeFormat(dateLocale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return { day, hour };
  };
  const start = formatDay(data.startTime);
  const end = formatDay(data.endTime);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pebiss-orange/10 animate-pulse" />
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-pebiss-orange/10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 min-h-full w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-6 px-6 py-8">
        {/* Logo du site au milieu */}
        {data.logo ? (
          <img
            src={data.logo}
            alt="Logo"
            className="h-20 w-auto max-w-[200px] object-contain rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 p-2"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-pebiss-orange/10 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
            <Wrench className="w-10 h-10 text-pebiss-orange" />
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('maintenance_title')}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>

        {/* Jour et heure de la maintenance */}
        {(start || end) && (
          <div className="w-full max-w-md space-y-1.5 rounded-2xl border border-orange-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-3.5 shadow-sm">
            {start && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <CalendarDays className="w-4 h-4 text-pebiss-orange shrink-0" />
                <span>
                  <span className="font-semibold">{t('maintenance_starts_on')}</span>{' '}
                  {start.day} {t('maintenance_at_time')} {start.hour}
                </span>
              </div>
            )}
            {end && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Clock className="w-4 h-4 text-pebiss-orange shrink-0" />
                <span>
                  <span className="font-semibold">{t('maintenance_back_on')}</span>{' '}
                  {end.day} {t('maintenance_at_time')} {end.hour}
                </span>
              </div>
            )}
          </div>
        )}

        {timeLeft && (
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <TimeUnit value={timeLeft.days} label={t('maintenance_days')} />
            <span className="text-2xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.hours} label={t('maintenance_hours')} />
            <span className="text-2xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.minutes} label={t('maintenance_minutes')} />
            <span className="text-2xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.seconds} label={t('maintenance_seconds')} />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{t('maintenance_progress')}</span>
          </div>
          <div className="mx-auto max-w-xs h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-pebiss-orange rounded-full animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pebiss-orange hover:bg-pebiss-orange/90 text-white font-medium transition-colors shadow-lg shadow-pebiss-orange/25 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          {t('maintenance_refresh')}
        </button>

        <p className="text-xs text-muted-foreground">
          Pebiss &copy; {new Date().getFullYear()}
        </p>

        {/* Accès administrateur pendant la maintenance */}
        <Link
          href="/login/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-pebiss-orange transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          {t('maintenance_admin_login')}
        </Link>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const exemptPaths = ['/admin', '/dashboard', '/login', '/register', '/maintenance'];
  const isExempt = exemptPaths.some((p) => pathname.startsWith(p));
  const [status, setStatus] = useState<'loading' | 'active' | 'inactive'>(isExempt ? 'inactive' : 'loading');
  const [data, setData] = useState<MaintenanceData | null>(null);

  useEffect(() => {
    if (isExempt) return;

    let cancelled = false;
    fetch('/api/maintenance')
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setStatus(d.active ? 'active' : 'inactive');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('inactive');
      });

    return () => { cancelled = true; };
  }, [pathname, isExempt]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pebiss-orange" />
      </div>
    );
  }

  if (status === 'active' && data) {
    return <MaintenanceScreen data={data} />;
  }

  return <>{children}</>;
}
