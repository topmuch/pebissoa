'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Shield, Globe2, HeartHandshake, Building2, Users, MapPin, Star } from 'lucide-react';

const values = [
  { key_icon: 'about_page_innovation', key_desc: 'about_page_innovation_desc', Icon: Lightbulb, color: 'bg-blue-100 text-blue-600' },
  { key_icon: 'about_page_confiance', key_desc: 'about_page_confiance_desc', Icon: Shield, color: 'bg-green-100 text-green-600' },
  { key_icon: 'about_page_accessibilite', key_desc: 'about_page_accessibilite_desc', Icon: Globe2, color: 'bg-purple-100 text-purple-600' },
  { key_icon: 'about_page_engagement', key_desc: 'about_page_engagement_desc', Icon: HeartHandshake, color: 'bg-orange-100 text-orange-600' },
] as const;

const team = [
  { key_name: 'about_page_ceo_name', key_role: 'about_page_ceo_role', key_desc: 'about_page_ceo_desc', initials: 'AD', bg: 'bg-blue-500' },
  { key_name: 'about_page_cto_name', key_role: 'about_page_cto_role', key_desc: 'about_page_cto_desc', initials: 'BS', bg: 'bg-green-500' },
  { key_name: 'about_page_marketing_name', key_role: 'about_page_marketing_role', key_desc: 'about_page_marketing_desc', initials: 'FE', bg: 'bg-purple-500' },
] as const;

const stats = [
  { value: 150, suffix: '+', key: 'stats_businesses', Icon: Building2 },
  { value: 7, suffix: '+', key: 'stats_categories', Icon: Users },
  { value: 12, suffix: '+', key: 'stats_cities', Icon: MapPin },
  { value: 340, suffix: '+', key: 'stats_reviews', Icon: Star },
] as const;

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl font-bold text-white">
      {count}
      {suffix}
    </div>
  );
}

export default function AproposPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('about_page_title')}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {t('about_page_mission_desc').substring(0, 120)}...
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            {t('about_page_mission')}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-center">
            {t('about_page_mission_desc')}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
            {t('about_page_values')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.key_icon} className="text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-xl ${v.color}`}>
                    <v.Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(v.key_icon)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(v.key_desc)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">
            {t('about_page_team')}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            {t('about_page_team_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.key_name} className="text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-full ${member.bg} flex items-center justify-center text-white text-2xl font-bold`}>
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(member.key_name)}
                  </h3>
                  <p className="text-sm font-medium text-[#0066CC]">
                    {t(member.key_role)}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(member.key_desc)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">
            {t('about_page_chiffres')}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            {t('about_page_chiffres_desc')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.key} className="bg-[#0066CC] rounded-xl p-6 text-center">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
                <p className="text-white/60 text-sm mt-2">{t(s.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
