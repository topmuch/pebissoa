'use client';

/**
 * Page « Publicité » (espace annonceurs) — design engageant :
 * hero immersif, chiffres clés, emplacements bannières illustrés,
 * fonctionnement, forfaits, FAQ et CTA de contact.
 */

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Eye, Target, TrendingUp, Headphones, Check, ArrowRight, Sparkles, Crown, Zap,
  MessageCircle, MousePointerClick, Palette, Rocket, BadgeCheck, Megaphone,
  Users, MousePointerClick as ClickIcon, Star, MapPin,
} from 'lucide-react';

const benefits = [
  { key: 'ads_page_benefit_1', key_desc: 'ads_page_benefit_1_desc', Icon: Eye, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { key: 'ads_page_benefit_2', key_desc: 'ads_page_benefit_2_desc', Icon: Target, color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400' },
  { key: 'ads_page_benefit_3', key_desc: 'ads_page_benefit_3_desc', Icon: TrendingUp, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
  { key: 'ads_page_benefit_4', key_desc: 'ads_page_benefit_4_desc', Icon: Headphones, color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
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

/* Emplacements bannières disponibles sur le site */
const PLACEMENTS = [
  {
    preview: 'h-28 aspect-[16/8]', // 1440x720
    name: { fr: 'Carrousel promo — Accueil (gauche)', pt: 'Carrossel promocional — Início (esquerda)', en: 'Promo carousel — Homepage (left)' },
    desc: { fr: 'Le format premium : rotation automatique des visuels, pleine largeur sous le hero.', pt: 'O formato premium: rotação automática de visuais, largura total sob o hero.', en: 'The premium format: auto-rotating visuals, full width below the hero.' },
    badge: { fr: 'Le plus vu', pt: 'Mais visto', en: 'Most seen' },
  },
  {
    preview: 'h-28 aspect-[16/8]', // 1440x720
    name: { fr: 'Bannière — Accueil (droite)', pt: 'Banner — Início (direita)', en: 'Banner — Homepage (right)' },
    desc: { fr: 'Face au carrousel, un emplacement fixe réservé à votre marque.', pt: 'Face ao carrossel, um espaço fixo reservado à sua marca.', en: 'Facing the carousel, a fixed spot reserved for your brand.' },
  },
  {
    preview: 'h-24 aspect-[336/280]',
    name: { fr: 'Encart 336×280 — Milieu d\'accueil', pt: 'Módulo 336×280 — Meio do início', en: '336×280 box — Homepage middle' },
    desc: { fr: 'Un encart compact au cœur de la page d\'accueil.', pt: 'Um módulo compacto no coração da página inicial.', en: 'A compact box in the heart of the homepage.' },
  },
  {
    preview: 'h-10 aspect-[728/90]',
    name: { fr: 'Leaderboard 728×90 — Avant footer', pt: 'Leaderboard 728×90 — Antes do rodapé', en: '728×90 leaderboard — Before footer' },
    desc: { fr: 'Une bande pleine largeur en fin de page, dernière impression avant le départ.', pt: 'Uma faixa de largura total no fim da página, a última impressão antes de sair.', en: 'A full-width strip at the end of the page, the last impression before leaving.' },
  },
  {
    preview: 'h-36 aspect-[300/600]',
    name: { fr: 'Skyscraper 300×600 — Fiche entreprise', pt: 'Skyscraper 300×600 — Ficha de empresa', en: '300×600 skyscraper — Business listing' },
    desc: { fr: 'Grand format vertical visible pendant toute la lecture d\'une fiche.', pt: 'Grande formato vertical visível durante toda a leitura de uma ficha.', en: 'Large vertical format visible throughout a listing visit.' },
  },
  {
    preview: 'h-10 aspect-[728/90]',
    name: { fr: 'Leaderboard 728×90 — Détail entreprise', pt: 'Leaderboard 728×90 — Detalhe de empresa', en: '728×90 leaderboard — Business detail' },
    desc: { fr: 'Votre marque juste avant que le client ne contacte l\'entreprise.', pt: 'A sua marca mesmo antes de o cliente contactar a empresa.', en: 'Your brand right before the customer contacts the business.' },
  },
] as const;

const STEPS = [
  {
    Icon: MessageCircle,
    title: { fr: '1. Parlons de votre objectif', pt: '1. Falamos do seu objetivo', en: '1. Let\'s talk about your goal' },
    desc: { fr: 'Contactez-nous par WhatsApp ou via le formulaire : nous vous conseillons l\'emplacement le plus rentable selon votre activité.', pt: 'Contacte-nos por WhatsApp ou através do formulário: aconselhamos o local mais rentável para a sua atividade.', en: 'Reach us on WhatsApp or via the form: we recommend the most profitable placement for your business.' },
  },
  {
    Icon: Palette,
    title: { fr: '2. Envoyez votre visuel', pt: '2. Envie o seu visual', en: '2. Send your visual' },
    desc: { fr: 'Pas de designer ? Pas de souci : notre équipe prépare un visuel professionnel pour vous.', pt: 'Sem designer? Sem problema: a nossa equipa cria um visual profissional para si.', en: 'No designer? No problem: our team prepares a professional visual for you.' },
  },
  {
    Icon: Rocket,
    title: { fr: '3. Votre bannière est en ligne', pt: '3. O seu banner está online', en: '3. Your banner is live' },
    desc: { fr: 'Publication en 24 à 48 h, suivi des performances et ajustements inclus pendant toute la campagne.', pt: 'Publicação em 24–48 h, acompanhamento de desempenho e ajustes incluídos durante toda a campanha.', en: 'Live within 24–48 h, performance tracking and adjustments included throughout the campaign.' },
  },
] as const;

const AUDIENCE = [
  { Icon: Users, value: { fr: 'Des milliers', pt: 'Milhares', en: 'Thousands' }, label: { fr: 'de visiteurs chaque mois', pt: 'de visitantes por mês', en: 'of visitors every month' } },
  { Icon: MousePointerClick, value: '7+', label: { fr: 'emplacements premium', pt: 'locais premium', en: 'premium placements' } },
  { Icon: Star, value: '340+', label: { fr: 'avis clients publiés', pt: 'avaliações publicadas', en: 'customer reviews published' } },
  { Icon: MapPin, value: '12+', label: { fr: 'villes couvertes', pt: 'cidades cobertas', en: 'cities covered' } },
] as const;

const FAQ = [
  {
    q: { fr: 'Combien coûte une bannière sur Pebiss ?', pt: 'Quanto custa um banner na Pebiss?', en: 'How much does a banner on Pebiss cost?' },
    a: {
      fr: 'Les tarifs dépendent de l\'emplacement choisi et de la durée de la campagne. Le carrousel d\'accueil est l\'emplacement le plus performant ; les encarts intérieurs sont plus abordables. Contactez-nous pour un devis personnalisé sous 24 h.',
      pt: 'Os preços dependem do local escolhido e da duração da campanha. O carrossel do início é o local com melhor desempenho; os módulos interiores são mais acessíveis. Contacte-nos para um orçamento personalizado em 24 h.',
      en: 'Pricing depends on the placement and campaign length. The homepage carousel is the best-performing spot; inner boxes are more affordable. Contact us for a personalized quote within 24 h.',
    },
  },
  {
    q: { fr: 'Faut-il fournir son propre visuel ?', pt: 'É preciso fornecer o próprio visual?', en: 'Do I need to provide my own visual?' },
    a: {
      fr: 'Non. Si vous n\'avez pas de visuel, notre équipe en crée un gratuitement à partir de votre logo et de vos couleurs. Vous validez avant la mise en ligne.',
      pt: 'Não. Se não tiver um visual, a nossa equipa cria um gratuitamente a partir do seu logótipo e cores. Valida antes da publicação.',
      en: 'No. If you don\'t have a visual, our team creates one for free from your logo and colors. You approve it before it goes live.',
    },
  },
  {
    q: { fr: 'Combien de temps pour être en ligne ?', pt: 'Quanto tempo para ficar online?', en: 'How long until my ad is live?' },
    a: {
      fr: 'Entre 24 et 48 heures après réception du visuel validé et du règlement. Votre bannière reste affichée pendant toute la durée convenue.',
      pt: 'Entre 24 e 48 horas após a receção do visual validado e do pagamento. O seu banner permanece exibido durante todo o período acordado.',
      en: 'Between 24 and 48 hours after receiving the approved visual and payment. Your banner stays up for the entire agreed period.',
    },
  },
  {
    q: { fr: 'Puis-je suivre les performances de ma bannière ?', pt: 'Posso acompanhar o desempenho do meu banner?', en: 'Can I track my banner\'s performance?' },
    a: {
      fr: 'Oui : vues et clics sont suivis et vous recevez un rapport mensuel. Nous pouvons ajuster l\'emplacement ou le visuel pour améliorer vos résultats.',
      pt: 'Sim: visualizações e cliques são registados e recebe um relatório mensal. Podemos ajustar o local ou o visual para melhorar os resultados.',
      en: 'Yes: views and clicks are tracked and you receive a monthly report. We can adjust the placement or visual to improve results.',
    },
  },
  {
    q: { fr: 'Quels formats d\'image acceptez-vous ?', pt: 'Que formatos de imagem aceitam?', en: 'Which image formats do you accept?' },
    a: {
      fr: 'JPG ou PNG, haute qualité, aux dimensions de l\'emplacement choisi (ex. 1440×720 pour le carrousel). Nous adaptons gratuitement votre visuel si besoin.',
      pt: 'JPG ou PNG, alta qualidade, nas dimensões do local escolhido (ex. 1440×720 para o carrossel). Adaptamos gratuitamente o seu visual se necessário.',
      en: 'JPG or PNG, high quality, at the chosen placement dimensions (e.g. 1440×720 for the carousel). We adapt your visual for free if needed.',
    },
  },
] as const;

export default function PublicitePage() {
  const { t, tl } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO immersif ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/banners/pro-dark.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00284F]/95 via-[#0066CC]/85 to-[#0099FF]/60" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Megaphone className="h-3.5 w-3.5" />
              {tl({ fr: 'Espace annonceurs', pt: 'Espaço anunciantes', en: 'Advertiser hub' })}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {tl({ fr: 'Votre marque, en tête d\'affiche sur Pebiss', pt: 'A sua marca, em destaque na Pebiss', en: 'Your brand, front and center on Pebiss' })}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              {tl({
                fr: 'Bannières premium sur la page d\'accueil, fiches mises en avant, forfaits flexibles : atteignez des milliers de clients en Guinée-Bissau, au moment exact où ils cherchent vos produits.',
                pt: 'Banners premium na página inicial, fichas destacadas, pacotes flexíveis: alcance milhares de clientes na Guiné-Bissau, no momento exato em que procuram os seus produtos.',
                en: 'Premium homepage banners, featured listings, flexible packages: reach thousands of customers in Guinea-Bissau, at the exact moment they search for your products.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-7 w-full sm:w-auto">
                  {t('ads_page_cta_button')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/245956007371" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-7 w-full sm:w-auto">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {tl({ fr: 'WhatsApp direct', pt: 'WhatsApp direto', en: 'Direct WhatsApp' })}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE (bande bleue) ============ */}
      <section className="bg-[#0066CC] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE.map((a) => (
              <div key={a.label.fr} className="flex flex-col items-center text-center gap-1">
                <a.Icon className="h-5 w-5 text-white/70 mb-1" aria-hidden />
                <p className="text-white font-extrabold text-xl md:text-2xl leading-none">{tl(a.value)}</p>
                <p className="text-white/80 text-xs md:text-sm">{tl(a.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ POURQUOI ANNONCER ============ */}
      <section className="py-14 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {t('ads_page_why')}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('ads_page_why_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {benefits.map((b) => (
              <Card key={b.key} className="text-center border-0 shadow-sm hover:shadow-lg transition-shadow group">
                <CardContent className="pt-7 pb-6 px-5 flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl ${b.color} group-hover:scale-110 transition-transform duration-300`}>
                    <b.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{t(b.key)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(b.key_desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EMPLACEMENTS & FORMATS ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-3 justify-center">
            <BadgeCheck className="h-6 w-6 text-[#0066CC]" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground">
              {tl({ fr: 'Où votre bannière peut apparaître', pt: 'Onde o seu banner pode aparecer', en: 'Where your banner can appear' })}
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            {tl({
              fr: '6 emplacements premium, tous responsives : votre visuel s\'adapte parfaitement au mobile comme à l\'ordinateur.',
              pt: '6 locais premium, todos responsivos: o seu visual adapta-se perfeitamente ao telemóvel e ao computador.',
              en: '6 premium placements, all responsive: your visual fits perfectly on mobile and desktop.',
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {PLACEMENTS.map((p) => (
              <Card key={p.name.fr} className="border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                {/* Miniature de l'emplacement */}
                <div className="p-4 pb-0">
                  <div className="h-44 w-full rounded-lg bg-muted/60 dark:bg-muted/20 flex items-center justify-center">
                    <div className={`${p.preview} max-w-full rounded-md bg-gradient-to-br from-[#0066CC] to-[#0099FF] relative overflow-hidden flex items-center justify-center group-hover:scale-[1.04] transition-transform duration-300`}>
                      <Megaphone className="h-4 w-4 md:h-5 md:w-5 text-white/30" aria-hidden />
                      {p.badge && (
                        <span className="absolute top-1.5 right-1.5 bg-white text-[#0066CC] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                          {tl(p.badge)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-4 pb-5 px-5">
                  <h3 className="font-bold text-foreground text-sm mb-1">{tl(p.name)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tl(p.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMMENT ÇA MARCHE ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Comment ça marche ?', pt: 'Como funciona?', en: 'How does it work?' })}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            {tl({
              fr: 'De la première discussion à la mise en ligne : 3 étapes simples, accompagnées par notre équipe.',
              pt: 'Da primeira conversa à publicação: 3 passos simples, acompanhados pela nossa equipa.',
              en: 'From first chat to going live: 3 simple steps, guided by our team.',
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {STEPS.map((s) => (
              <Card key={s.title.fr} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="pt-7 pb-6 px-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <s.Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm md:text-base">{tl(s.title)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tl(s.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FORFAITS ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {t('ads_page_plans')}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            {tl({
              fr: 'Commencez gratuitement, évoluez quand votre entreprise grandit.',
              pt: 'Comece grátis, evolua quando a sua empresa crescer.',
              en: 'Start for free, upgrade as your business grows.',
            })}
          </p>
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
                    ⭐ {tl({ fr: 'Populaire', pt: 'Popular', en: 'Popular' })}
                  </div>
                )}
                <CardContent className={`p-6 flex flex-col ${plan.highlighted ? 'pt-10' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.highlighted ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'}`}>
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
                    className={`w-full h-11 font-bold ${
                      plan.highlighted
                        ? 'bg-[#0066CC] hover:bg-[#0052A3] text-white'
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

      {/* ============ FAQ ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-3 justify-center">
            <ClickIcon className="h-5 w-5 text-[#0066CC]" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground">
              {tl({ fr: 'Questions fréquentes', pt: 'Perguntas frequentes', en: 'Frequently asked questions' })}
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-8">
            {tl({
              fr: 'Tout ce qu\'il faut savoir avant de lancer votre campagne.',
              pt: 'Tudo o que precisa de saber antes de lançar a sua campanha.',
              en: 'Everything you need to know before launching your campaign.',
            })}
          </p>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold text-foreground text-sm md:text-base">
                  {tl(f.q)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {tl(f.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  {t('ads_page_cta_title')}
                </h2>
                <p className="text-white/85 text-base md:text-lg mb-8 max-w-xl mx-auto">
                  {t('ads_page_cta_desc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-8 w-full sm:w-auto">
                      {t('ads_page_cta_button')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/245956007371" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-8 w-full sm:w-auto">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      {tl({ fr: 'Discuter sur WhatsApp', pt: 'Conversar no WhatsApp', en: 'Chat on WhatsApp' })}
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
