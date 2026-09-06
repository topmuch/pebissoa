'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Wrench, Clock, RefreshCw } from 'lucide-react';

interface MaintenanceData {
  active: boolean;
  message?: string;
  endTime?: string;
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
  const { t } = useTranslation();
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

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pebiss-orange/10 animate-pulse" />
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-pebiss-orange/10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        <div className="mx-auto w-24 h-24 rounded-full bg-pebiss-orange/10 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
          <Wrench className="w-12 h-12 text-pebiss-orange" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('maintenance_title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>

        {timeLeft && (
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <TimeUnit value={timeLeft.days} label={t('maintenance_days')} />
            <span className="text-2xl md:text-3xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.hours} label={t('maintenance_hours')} />
            <span className="text-2xl md:text-3xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.minutes} label={t('maintenance_minutes')} />
            <span className="text-2xl md:text-3xl font-bold text-pebiss-orange mb-5 animate-pulse">:</span>
            <TimeUnit value={timeLeft.seconds} label={t('maintenance_seconds')} />
          </div>
        )}

        <div className="space-y-3">
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
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
