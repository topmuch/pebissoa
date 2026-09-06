'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Target, TrendingUp, Headphones, Check, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';

const benefits = [
  { key: 'ads_page_benefit_1', key_desc: 'ads_page_benefit_1_desc', Icon: Eye, color: 'bg-blue-100 text-blue-600' },
  { key: 'ads_page_benefit_2', key_desc: 'ads_page_benefit_2_desc', Icon: Target, color: 'bg-green-100 text-green-600' },
  { key: 'ads_page_benefit_3', key_desc: 'ads_page_benefit_3_desc', Icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  { key: 'ads_page_benefit_4', key_desc: 'ads_page_benefit_4_desc', Icon: Headphones, color: 'bg-orange-100 text-orange-600' },
] as const;

const plans = [
  {
    key_name: 'ads_page_free',
    key_price: 'ads_page_free_price',
    key_cta: 'ads_page_free_cta',
    features: [
      'ads_page_free_feature_1',
      'ads_page_free_feature_2',
      'ads_page_free_feature_3',
      'ads_page_free_feature_4',
    ],
    highlighted: false,
    Icon: Zap,
    ctaVariant: 'outline' as const,
  },
  {
    key_name: 'ads_page_standard',
    key_price: 'ads_page_standard_price',
    key_cta: 'ads_page_standard_cta',
    features: [
      'ads_page_standard_feature_1',
      'ads_page_standard_feature_2',
      'ads_page_standard_feature_3',
      'ads_page_standard_feature_4',
      'ads_page_standard_feature_5',
    ],
    highlighted: true,
    Icon: Sparkles,
    ctaVariant: 'default' as const,
  },
  {
    key_name: 'ads_page_premium',
    key_price: 'ads_page_premium_price',
    key_cta: 'ads_page_premium_cta',
    features: [
      'ads_page_premium_feature_1',
      'ads_page_premium_feature_2',
      'ads_page_premium_feature_3',
      'ads_page_premium_feature_4',
      'ads_page_premium_feature_5',
    ],
    highlighted: false,
    Icon: Crown,
    ctaVariant: 'outline' as const,
  },
] as const;

export default function PublicitePage() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('ads_page_title')}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('ads_page_subtitle')}
          </p>
        </div>
      </section>

      {/* Why Advertise */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
            {t('ads_page_why')}
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('ads_page_why_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <Card key={b.key} className="text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-xl ${b.color}`}>
                    <b.Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(b.key)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(b.key_desc)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
            {t('ads_page_plans')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.key_name}
                className={`relative overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-sm ${
                  plan.highlighted
                    ? 'ring-2 ring-[#0066CC] scale-[1.02] md:scale-105'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-[#0066CC] text-white text-center text-xs font-semibold py-1.5">
                    ⭐ Populaire
                  </div>
                )}
                <CardContent className={`p-6 flex flex-col ${plan.highlighted ? 'pt-10' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.highlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      <plan.Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t(plan.key_name)}</h3>
                  </div>
                  <p className="text-3xl font-bold text-[#0066CC] mb-6">
                    {t(plan.key_price)}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{t(feat)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.ctaVariant}
                    className={`w-full h-11 ${
                      plan.highlighted
                        ? 'bg-[#0066CC] hover:bg-[#0055AA] text-white'
                        : 'border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white'
                    }`}
                  >
                    {t(plan.key_cta)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {t('ads_page_cta_title')}
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  {t('ads_page_cta_desc')}
                </p>
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-semibold h-12 px-8">
                    {t('ads_page_cta_button')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
