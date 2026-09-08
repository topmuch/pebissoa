'use client';

/**
 * Page « La référence des pros du pays » — présentation de l'annuaire Pebiss,
 * chiffres clés, entreprises mises en avant (API) et catégories couvertes.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BusinessCard } from '@/components/shared/business-card';
import {
  BadgeCheck, MapPin, Compass, Gift, ArrowRight, Building2,
  Users, Star, Search, ShieldCheck, Clock, HeartHandshake,
} from 'lucide-react';

interface Biz {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  views: number;
  _count?: { reviews: number; products: number; services: number };
  category?: { id: string; name: string; slug: string; icon?: string | null } | null;
  avgRating?: number;
}

interface Cat {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

const KEY_STATS = [
  { value: 150, suffix: '+', icon: Building2, label: { fr: 'Entreprises référencées', pt: 'Empresas registadas', en: 'Listed businesses' } },
  { value: 12, suffix: '+', icon: MapPin, label: { fr: 'Villes couvertes', pt: 'Cidades cobertas', en: 'Cities covered' } },
  { value: 7, suffix: '+', icon: Compass, label: { fr: 'Secteurs d\'activité', pt: 'Setores de atividade', en: 'Business sectors' } },
  { value: 340, suffix: '+', icon: Star, label: { fr: 'Avis clients', pt: 'Avaliações de clientes', en: 'Customer reviews' } },
] as const;

const REASONS = [
  {
    Icon: BadgeCheck,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    title: { fr: 'Des pros vérifiés', pt: 'Profissionais verificados', en: 'Verified pros' },
    desc: { fr: 'Chaque fiche est contrôlée avant publication : coordonnées, adresse et activité réelles.', pt: 'Cada ficha é verificada antes da publicação: contactos, morada e atividade reais.', en: 'Every listing is checked before publishing: real contact details, address and activity.' },
  },
  {
    Icon: MapPin,
    color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    title: { fr: 'Proche de chez vous', pt: 'Perto de si', en: 'Near you' },
    desc: { fr: 'Bissau, Gabú, Bafatá, Canchungo… trouvez un pro dans votre ville ou quartier.', pt: 'Bissau, Gabú, Bafatá, Canchungo… encontre um profissional na sua cidade ou bairro.', en: 'Bissau, Gabú, Bafatá, Canchungo… find a pro in your city or neighbourhood.' },
  },
  {
    Icon: Clock,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    title: { fr: 'Disponible 24 h/24', pt: 'Disponível 24 h/24', en: 'Available 24/7' },
    desc: { fr: 'L\'annuaire est consultable à tout moment, sur mobile comme sur ordinateur.', pt: 'O diretório pode ser consultado a qualquer momento, no telemóvel ou no computador.', en: 'The directory is available anytime, on mobile and desktop.' },
  },
  {
    Icon: Gift,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    title: { fr: '100 % gratuit', pt: '100 % grátis', en: '100% free' },
    desc: { fr: 'Consulter l\'annuaire et contacter les pros ne coûte rien. Aucune carte requise.', pt: 'Consultar o diretório e contactar os profissionais é grátis. Sem cartão.', en: 'Browsing the directory and contacting pros is free. No card required.' },
  },
] as const;

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1600;
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
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-extrabold text-white">
      {count}
      {suffix}
    </span>
  );
}

export default function ReferenceProsPage() {
  const { tl } = useTranslation();
  const { data: bizData } = useQuery<{ businesses: Biz[] }>({
    queryKey: ['businesses', 'featured', 'reference-pros'],
    queryFn: () =>
      fetch('/api/businesses?limit=4&sortBy=views&sortOrder=desc').then((r) => r.json()),
  });
  const { data: categories } = useQuery<Cat[]>({
    queryKey: ['categories', 'reference-pros'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const featured = (bizData?.businesses || []).slice(0, 4);

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO avec image ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/pro-avantages/pro-reference.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003B7A]/95 via-[#0066CC]/85 to-[#0066CC]/60" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              {tl({ fr: 'L\'annuaire n°1 de Guinée-Bissau', pt: 'O diretório n.º 1 da Guiné-Bissau', en: 'The #1 directory in Guinea-Bissau' })}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {tl({ fr: 'La référence des pros du pays', pt: 'A referência dos profissionais do país', en: 'The go-to directory for local pros' })}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              {tl({
                fr: 'Des centaines de professionnels inscrits, partout en Guinée-Bissau. Commerces, artisans, services… trouvez en quelques secondes le bon pro près de chez vous.',
                pt: 'Centenas de profissionais inscritos, em toda a Guiné-Bissau. Comércios, artesãos, serviços… encontre em segundos o profissional certo perto de si.',
                en: 'Hundreds of registered professionals, all across Guinea-Bissau. Shops, craftsmen, services… find the right pro near you in seconds.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/annuaire">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-7 w-full sm:w-auto">
                  <Search className="h-5 w-5 mr-2" />
                  {tl({ fr: 'Explorer l\'annuaire', pt: 'Explorar o diretório', en: 'Explore the directory' })}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Inscrire mon entreprise', pt: 'Registar a minha empresa', en: 'List my business' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHIFFRES CLÉS ============ */}
      <section className="bg-[#0066CC] py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {KEY_STATS.map((s) => (
              <div key={s.label.fr} className="flex flex-col items-center text-center gap-1.5">
                <s.icon className="h-6 w-6 text-white/70 mb-1" aria-hidden />
                <AnimatedCounter target={s.value} suffix={s.suffix} />
                <p className="text-white/80 text-xs md:text-sm font-medium">{tl(s.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ POURQUOI LA RÉFÉRENCE ============ */}
      <section className="py-14 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Pourquoi Pebiss est la référence', pt: 'Porque a Pebiss é a referência', en: 'Why Pebiss is the reference' })}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {tl({
              fr: 'Un annuaire complet, fiable et pensé pour la Guinée-Bissau.',
              pt: 'Um diretório completo, fiável e pensado para a Guiné-Bissau.',
              en: 'A complete, reliable directory built for Guinea-Bissau.',
            })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {REASONS.map((r) => (
              <Card key={r.title.fr} className="border-0 shadow-sm hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-7 pb-6 px-5 flex flex-col items-center gap-3">
                  <div className={`p-3.5 rounded-2xl ${r.color}`}>
                    <r.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground">{tl(r.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tl(r.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROS MIS EN AVANT (API) ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                {tl({ fr: 'Des pros à la une', pt: 'Profissionais em destaque', en: 'Featured pros' })}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {tl({ fr: 'Les entreprises les plus consultées cette semaine.', pt: 'As empresas mais consultadas esta semana.', en: 'The most viewed businesses this week.' })}
              </p>
            </div>
            <Link href="/annuaire" className="hidden sm:inline-flex items-center gap-1 text-[#0066CC] hover:text-[#0052A3] font-semibold text-sm shrink-0">
              {tl({ fr: 'Tout voir', pt: 'Ver tudo', en: 'View all' })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-h-[560px] md:max-h-none overflow-y-auto md:overflow-visible">
                {featured.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
              <div className="mt-6 sm:hidden text-center">
                <Link href="/annuaire">
                  <Button variant="outline" className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white font-semibold">
                    {tl({ fr: 'Tout voir', pt: 'Ver tudo', en: 'View all' })}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-36 bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CATÉGORIES COUVERTES (API) ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                    {tl({ fr: 'Tous les secteurs sont sur Pebiss', pt: 'Todos os setores estão na Pebiss', en: 'Every sector is on Pebiss' })}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {tl({
                      fr: 'De la restauration à la mécanique, de la santé à la mode : chaque métier a sa place dans l\'annuaire. Et vous, rejoignez la communauté des pros du pays !',
                      pt: 'Da restauração à mecânica, da saúde à moda: cada profissão tem o seu lugar no diretório. Junte-se à comunidade de profissionais do país!',
                      en: 'From restaurants to mechanics, health to fashion: every trade belongs in the directory. Join the community of local pros!',
                    })}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/register">
                      <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold h-11 px-6 w-full sm:w-auto">
                        <HeartHandshake className="h-5 w-5 mr-2" />
                        {tl({ fr: 'Rejoindre l\'annuaire', pt: 'Juntar ao diretório', en: 'Join the directory' })}
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button variant="outline" className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC]/10 hover:text-[#0066CC] font-bold h-11 px-6 w-full sm:w-auto">
                        {tl({ fr: 'Voir les catégories', pt: 'Ver categorias', en: 'Browse categories' })}
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
                  {(categories || []).map((c) => (
                    <Link
                      key={c.id}
                      href={`/annuaire?category=${c.slug}`}
                      className="inline-flex items-center gap-1.5 bg-muted hover:bg-[#0066CC]/10 text-foreground/80 hover:text-[#0066CC] text-sm font-medium px-3.5 py-2 rounded-full transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0066CC]/60 shrink-0" aria-hidden />
                      {c.name}
                    </Link>
                  ))}
                  {!categories && [...Array(10)].map((_, i) => (
                    <div key={i} className="h-9 w-28 bg-muted animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {tl({ fr: 'Et si votre entreprise devenait la référence ?', pt: 'E se a sua empresa se tornasse a referência?', en: 'What if your business became the reference?' })}
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              {tl({
                fr: 'Inscrivez-vous gratuitement et soyez visible auprès de milliers de clients chaque mois.',
                pt: 'Registe-se gratuitamente e seja visto por milhares de clientes todos os meses.',
                en: 'Register for free and get seen by thousands of customers every month.',
              })}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-8">
                {tl({ fr: 'Créer ma fiche gratuitement', pt: 'Criar a minha ficha grátis', en: 'Create my free listing' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
