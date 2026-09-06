'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Users,
  Star,
  Megaphone,
  TrendingUp,
  Eye,
  QrCode,
  ShoppingCart,
  Landmark,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function AdminDashboardPage() {
  const { t, locale } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('admin_dash_total_businesses'),
      value: stats?.totals?.businesses || 0,
      icon: Building2,
      gradient: 'kpi-gradient-green',
    },
    {
      label: t('admin_dash_total_users'),
      value: stats?.totals?.users || 0,
      icon: Users,
      gradient: 'kpi-gradient-orange',
    },
    {
      label: t('admin_dash_total_reviews'),
      value: stats?.totals?.reviews || 0,
      icon: Star,
      gradient: 'kpi-gradient-purple',
    },
    {
      label: t('admin_dash_total_ads'),
      value: stats?.totals?.ads || 0,
      icon: Megaphone,
      gradient: 'kpi-gradient-cyan',
    },
  ];

  const categoryData = (stats?.topCategories || []).slice(0, 8).map((c: any) => ({
    name: c.name?.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
    fullName: c.name,
    count: c._count?.businesses || 0,
  }));

  // Generate monthly data from recent businesses
  const recentBusinesses = stats?.recentBusinesses || [];
  const monthlyMap: Record<string, number> = {};
  recentBusinesses.forEach((b: any) => {
    const month = new Date(b.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', { year: '2-digit', month: 'short' });
    monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });
  // Generate some baseline data
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT', { year: '2-digit', month: 'short' });
    months.push({ month: key, inscriptions: monthlyMap[key] || 0 });
  }

  const topBusinesses = stats?.topBusinesses || [];
  const recentSignups = stats?.recentBusinesses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin_dash_title')}</h1>
        <p className="text-muted-foreground">{t('admin_dash_subtitle')}</p>
      </div>

      {/* Stats Cards - Multicolor Gradient */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`rounded-xl ${stat.gradient} p-6 flex items-center justify-between`}>
                  <div className="text-white">
                    <p className="text-sm font-medium text-white/80">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin_dash_avg_rating')}</p>
              <p className="text-lg font-bold">{(stats?.totals?.avgRating || 0).toFixed(1)} / 5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Building2 className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin_dash_total_categories')}</p>
              <p className="text-lg font-bold">{stats?.totals?.categories || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin_dash_active_businesses')}</p>
              <p className="text-lg font-bold">{stats?.totals?.businesses || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin_dash_chart_categories')}</CardTitle>
            <CardDescription>{t('admin_dash_chart_categories_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#004A99" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('admin_dash_no_data')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin_dash_chart_inscriptions')}</CardTitle>
            <CardDescription>{t('admin_dash_chart_inscriptions_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {months.some((m) => m.inscriptions > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="inscriptions" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('admin_dash_no_data')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Businesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('admin_dash_top_viewed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBusinesses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin_dash_col_business')}</TableHead>
                    <TableHead className="text-right">{t('admin_dash_col_views')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBusinesses.slice(0, 5).map((b: any, i: number) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          <span className="font-medium text-sm truncate max-w-[150px]">{b.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{b.views}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('admin_dash_no_data')}</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('admin_dash_recent_signups')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSignups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin_dash_col_business')}</TableHead>
                    <TableHead>{t('admin_dash_col_date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSignups.slice(0, 5).map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-sm truncate max-w-[180px]">{b.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(b.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'pt-PT')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('admin_dash_no_data')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
