'use client';

/**
 * Page « Des avis pour vous aider à décider » — fonctionnement des avis,
 * charte de confiance et témoignages types.
 */

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Star, ShieldCheck, Search, MessageSquareQuote, Scale, Trash2,
  ArrowRight, Quote, ThumbsUp, Camera, Award,
} from 'lucide-react';

const STEPS = [
  {
    Icon: Search,
    step: '1',
    title: { fr: 'Je cherche un pro', pt: 'Procuro um profissional', en: 'I search for a pro' },
    desc: { fr: 'Plombier, restaurant, coiffeur… je trouve les pros près de moi dans l\'annuaire.', pt: 'Canalizador, restaurante, cabeleireiro… encontro profissionais perto de mim no diretório.', en: 'Plumber, restaurant, hairdresser… I find pros near me in the directory.' },
  },
  {
    Icon: Star,
    step: '2',
    title: { fr: 'Je compare les avis', pt: 'Comparo as avaliações', en: 'I compare reviews' },
    desc: { fr: 'Notes sur 5, avis détaillés, photos de clients : je me fais une opinion en quelques minutes.', pt: 'Notas de 5, avaliações detalhadas, fotografias de clientes: formo a minha opinião em minutos.', en: '5-star ratings, detailed reviews, customer photos: I form an opinion in minutes.' },
  },
  {
    Icon: ThumbsUp,
    step: '3',
    title: { fr: 'Je décide en confiance', pt: 'Decido com confiança', en: 'I decide with confidence' },
    desc: { fr: 'Je choisis le pro le mieux noté et je le contacte en un clic. Et après ma visite, je laisse mon avis !', pt: 'Escolho o profissional melhor avaliado e contacto-o num clique. E após a visita, deixo a minha avaliação!', en: 'I pick the best-rated pro and contact them in one click. And after my visit, I leave my review!' },
  },
] as const;

const TRUST = [
  {
    Icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    title: { fr: 'Avis de vrais clients', pt: 'Avaliações de clientes reais', en: 'Reviews from real customers' },
    desc: { fr: 'Seuls les utilisateurs inscrits peuvent laisser un avis, rattaché à une fiche précise.', pt: 'Apenas utilizadores registados podem deixar uma avaliação, ligada a uma ficha precisa.', en: 'Only registered users can leave a review, tied to a specific listing.' },
  },
  {
    Icon: Scale,
    color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    title: { fr: 'Équilibre garanti', pt: 'Equilíbrio garantido', en: 'Balanced by design' },
    desc: { fr: 'Les bons comme les moins bons avis sont publiés : personne ne peut trier les notes.', pt: 'As avaliações boas e menos boas são publicadas: ninguém pode filtrar as notas.', en: 'Good and bad reviews are both published: nobody can filter ratings.' },
  },
  {
    Icon: Trash2,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    title: { fr: 'Modération des abus', pt: 'Moderação de abusos', en: 'Abuse moderation' },
    desc: { fr: 'Insultes, fausses informations et avis sans rapport avec le service sont retirés.', pt: 'Insultos, informações falsas e avaliações sem relação com o serviço são removidos.', en: 'Insults, false information and off-topic reviews are removed.' },
  },
  {
    Icon: Award,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    title: { fr: 'Badges de qualité', pt: 'Selos de qualidade', en: 'Quality badges' },
    desc: { fr: 'Les pros réactifs et bien notés affichent des badges reconnaissables sur leur fiche.', pt: 'Os profissionais reativos e bem avaliados exibem selos reconhecíveis na sua ficha.', en: 'Responsive, well-rated pros display recognisable badges on their listing.' },
  },
] as const;

const SAMPLE_REVIEWS = [
  {
    name: 'Fatou D.',
    city: 'Bissau',
    rating: 5,
    text: {
      fr: '« J\'ai trouvé un électricien près de chez moi en 5 minutes. Les avis m\'ont permis de choisir quelqu\'un de sérieux, intervenu le jour même. »',
      pt: '« Encontrei um eletricista perto de mim em 5 minutos. As avaliações ajudaram-me a escolher alguém sério, que veio no próprio dia. »',
      en: '“I found an electrician near me in 5 minutes. The reviews helped me pick someone reliable who came the same day.”',
    },
  },
  {
    name: 'Mamadú S.',
    city: 'Bafatá',
    rating: 4,
    text: {
      fr: '« Les photos et les horaires sur la fiche m\'ont évité un déplacement inutile. Service correct, prix annoncés respectés. »',
      pt: '« As fotografias e os horários na ficha evitaram-me uma deslocação inútil. Serviço correto, preços anunciados respeitados. »',
      en: '“The photos and hours on the listing saved me a wasted trip. Decent service, advertised prices respected.”',
    },
  },
  {
    name: 'Amina L.',
    city: 'Canchungo',
    rating: 5,
    text: {
      fr: '« J\'ai réservé chez un traiteur très bien noté pour une fête familiale : tout était parfait, comme dans les avis. »',
      pt: '« Reservei com um serviço de catering muito bem avaliado para uma festa de família: tudo foi perfeito, como nas avaliações. »',
      en: '“I booked a highly rated caterer for a family party: everything was perfect, just like the reviews said.”',
    },
  },
] as const;

export default function AvisClientsPage() {
  const { tl } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO avec image ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/pro-avantages/pro-avis.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003B7A]/95 via-[#0066CC]/85 to-[#0066CC]/60" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Star className="h-3.5 w-3.5 fill-current" />
              {tl({ fr: 'La communauté recommande', pt: 'A comunidade recomenda', en: 'The community recommends' })}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {tl({ fr: 'Des avis pour vous aider à décider', pt: 'Avaliações para o ajudar a decidir', en: 'Reviews to help you decide' })}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              {tl({
                fr: 'Notes et avis des utilisateurs, photos, badges qualité et certifications… Choisissez le bon pro en toute confiance, grâce à l\'expérience de ceux qui l\'ont déjà testé.',
                pt: 'Notas e opiniões dos utilizadores, fotografias, selos de qualidade e certificações… Escolha o profissional certo com confiança, graças a quem já o testou.',
                en: 'User ratings and reviews, photos, quality badges and certifications… Choose the right pro with confidence, thanks to those who already tried them.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/annuaire">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Trouver des pros bien notés', pt: 'Encontrar profissionais bem avaliados', en: 'Find top-rated pros' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Laisser mon premier avis', pt: 'Deixar a minha primeira avaliação', en: 'Leave my first review' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMMENT ÇA MARCHE ============ */}
      <section className="py-14 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Comment ça marche ?', pt: 'Como funciona?', en: 'How does it work?' })}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {tl({
              fr: 'Trois étapes simples pour ne plus jamais choisir un pro au hasard.',
              pt: 'Três passos simples para nunca mais escolher um profissional ao acaso.',
              en: 'Three simple steps to never pick a pro at random again.',
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {STEPS.map((s) => (
              <Card key={s.step} className="border-0 shadow-sm hover:shadow-lg transition-shadow relative">
                <span className="absolute top-4 right-5 text-5xl font-extrabold text-[#0066CC]/10 select-none" aria-hidden>
                  {s.step}
                </span>
                <CardContent className="pt-7 pb-6 px-5">
                  <div className="inline-flex p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                    <s.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{tl(s.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tl(s.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHARTE DE CONFIANCE ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquareQuote className="h-6 w-6 text-[#0066CC]" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {tl({ fr: 'Des avis en qui vous pouvez avoir confiance', pt: 'Avaliações em que pode confiar', en: 'Reviews you can trust' })}
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                {tl({
                  fr: 'Notre charte garantit des avis utiles et sincères, dans l\'intérêt des clients comme des professionnels.',
                  pt: 'A nossa carta garante avaliações úteis e sinceras, no interesse dos clientes e dos profissionais.',
                  en: 'Our charter guarantees useful, sincere reviews, in the interest of customers and professionals alike.',
                })}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {TRUST.map((t) => (
                  <div key={t.title.fr} className="rounded-xl bg-muted/50 dark:bg-card p-5">
                    <div className={`inline-flex p-2.5 rounded-lg ${t.color} mb-3`}>
                      <t.Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm mb-1">{tl(t.title)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tl(t.desc)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============ TÉMOIGNAGES TYPES ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Ils ont choisi grâce aux avis', pt: 'Escolheram graças às avaliações', en: 'They chose thanks to reviews' })}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {tl({
              fr: 'Chaque mois, des milliers de Guinéens-Bissaviens utilisent les avis Pebiss pour choisir le bon pro.',
              pt: 'Todos os meses, milhares de guineenses usam as avaliações Pebiss para escolher o profissional certo.',
              en: 'Every month, thousands of Guinea-Bissau locals use Pebiss reviews to pick the right pro.',
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {SAMPLE_REVIEWS.map((r) => (
              <Card key={r.name} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-6 px-5 flex flex-col h-full">
                  <Quote className="h-6 w-6 text-[#0066CC]/30 mb-3" aria-hidden />
                  <div className="flex items-center gap-1 text-amber-500 mb-3" aria-label={`${r.rating}/5`}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed flex-1">{tl(r.text)}</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/60">
                    <div className="h-9 w-9 rounded-full bg-[#0066CC]/15 flex items-center justify-center text-[#0066CC] font-bold text-sm">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
            <Camera className="h-8 w-8 text-white/60 mx-auto mb-4" aria-hidden />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {tl({ fr: 'Votre avis aide toute la communauté', pt: 'A sua avaliação ajuda toda a comunidade', en: 'Your review helps the whole community' })}
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              {tl({
                fr: 'Vous avez testé un pro ? Partagez votre expérience : 30 secondes suffisent pour aider des milliers de personnes.',
                pt: 'Já experimentou um profissional? Partilhe a sua experiência: 30 segundos bastam para ajudar milhares de pessoas.',
                en: 'Tried a pro? Share your experience: 30 seconds is all it takes to help thousands of people.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-8 w-full sm:w-auto">
                  {tl({ fr: 'Créer un compte gratuit', pt: 'Criar uma conta grátis', en: 'Create a free account' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/annuaire">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-8 w-full sm:w-auto">
                  {tl({ fr: 'Explorer l\'annuaire', pt: 'Explorar o diretório', en: 'Explore the directory' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
