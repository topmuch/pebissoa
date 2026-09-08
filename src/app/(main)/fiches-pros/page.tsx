'use client';

/**
 * Page « Des fiches enrichies par les pros » — tout ce qu'une fiche Pebiss
 * contient : horaires, prestations, photos, actus, itinéraire, etc.
 */

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock, Camera, Newspaper, Phone, MapPin, Wrench, Share2,
  MessageSquare, Check, ArrowRight, LayoutList, Star, BadgeCheck, Eye,
} from 'lucide-react';

const FEATURES = [
  {
    Icon: Clock,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    title: { fr: 'Horaires d\'ouverture', pt: 'Horário de funcionamento', en: 'Opening hours' },
    desc: { fr: 'Jours et horaires détaillés, pour savoir quand y aller avant de vous déplacer.', pt: 'Dias e horários detalhados, para saber quando ir antes de se deslocar.', en: 'Detailed days and hours, so you know when to go before heading out.' },
  },
  {
    Icon: Wrench,
    color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    title: { fr: 'Prestations & produits', pt: 'Serviços e produtos', en: 'Services & products' },
    desc: { fr: 'La liste des services et produits proposés, avec descriptions et prix quand ils sont communiqués.', pt: 'A lista de serviços e produtos oferecidos, com descrições e preços quando divulgados.', en: 'The list of services and products offered, with descriptions and prices when shared.' },
  },
  {
    Icon: Camera,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    title: { fr: 'Photos réelles', pt: 'Fotografias reais', en: 'Real photos' },
    desc: { fr: 'Vitrine, équipe, réalisations… des photos publiées par le pro lui-même.', pt: 'Vitrine, equipa, trabalhos… fotografias publicadas pelo próprio profissional.', en: 'Storefront, team, work samples… photos posted by the pro themselves.' },
  },
  {
    Icon: Newspaper,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    title: { fr: 'Actualités & promos', pt: 'Notícias e promoções', en: 'News & deals' },
    desc: { fr: 'Nouveautés, promotions, horaires spéciaux : l\'actualité de l\'entreprise en temps réel.', pt: 'Novidades, promoções, horários especiais: a atualidade da empresa em tempo real.', en: 'News, promotions, special hours: the business updates in real time.' },
  },
  {
    Icon: Phone,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
    title: { fr: 'Coordonnées complètes', pt: 'Contactos completos', en: 'Full contact details' },
    desc: { fr: 'Téléphone, WhatsApp, e-mail, réseaux sociaux : contactez le pro en un clic.', pt: 'Telefone, WhatsApp, e-mail, redes sociais: contacte o profissional num clique.', en: 'Phone, WhatsApp, email, social media: reach the pro in one click.' },
  },
  {
    Icon: MapPin,
    color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    title: { fr: 'Adresse & itinéraire', pt: 'Morada e itinerário', en: 'Address & directions' },
    desc: { fr: 'Adresse précise, carte et itinéraire pour arriver sans stress.', pt: 'Morada precisa, mapa e itinerário para chegar sem stress.', en: 'Exact address, map and directions to get there stress-free.' },
  },
  {
    Icon: Share2,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    title: { fr: 'Réseaux sociaux', pt: 'Redes sociais', en: 'Social media' },
    desc: { fr: 'Facebook, Instagram, TikTok… suivez l\'activité du pro partout.', pt: 'Facebook, Instagram, TikTok… siga a atividade do profissional em todo o lado.', en: 'Facebook, Instagram, TikTok… follow the pro\'s activity everywhere.' },
  },
  {
    Icon: MessageSquare,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    title: { fr: 'Messagerie directe', pt: 'Mensagens diretas', en: 'Direct messaging' },
    desc: { fr: 'Posez une question ou demandez un devis sans quitter la fiche.', pt: 'Faça uma pergunta ou peça um orçamento sem sair da ficha.', en: 'Ask a question or request a quote without leaving the listing.' },
  },
] as const;

const PRO_POINTS = [
  { fr: 'Visible sur Google et partagé facilement', pt: 'Visível no Google e partilhável facilmente', en: 'Visible on Google and easy to share' },
  { fr: 'Fiche modifiable à tout moment depuis votre espace', pt: 'Ficha editável a qualquer momento no seu espaço', en: 'Listing editable anytime from your dashboard' },
  { fr: 'Plus de confiance grâce aux avis et aux badges', pt: 'Mais confiança graças às avaliações e aos selos', en: 'More trust thanks to reviews and badges' },
  { fr: 'Des clients qui arrivent déjà bien informés', pt: 'Clientes que chegam já bem informados', en: 'Customers who arrive already well informed' },
] as const;

export default function FichesProsPage() {
  const { tl } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO avec image ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/pro-avantages/pro-fiches.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003B7A]/95 via-[#0066CC]/85 to-[#0066CC]/60" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <LayoutList className="h-3.5 w-3.5" />
              {tl({ fr: 'Des informations fiables, chaque jour', pt: 'Informações fiáveis, todos os dias', en: 'Reliable information, every day' })}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {tl({ fr: 'Des fiches enrichies par les pros', pt: 'Fichas enriquecidas pelos profissionais', en: 'Listings enriched by the pros' })}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              {tl({
                fr: 'Horaires, prestations, actus, coordonnées, itinéraire… Sur Pebiss, chaque fiche est une vraie vitrine mise à jour chaque jour par le professionnel lui-même.',
                pt: 'Horários, serviços, notícias, contactos, itinerário… Na Pebiss, cada ficha é uma verdadeira vitrina atualizada todos os dias pelo próprio profissional.',
                en: 'Hours, services, news, contacts, directions… On Pebiss, every listing is a true storefront updated daily by the professional themselves.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/annuaire">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Découvrir des fiches', pt: 'Descobrir fichas', en: 'Browse listings' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Créer ma fiche', pt: 'Criar a minha ficha', en: 'Create my listing' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CE QUE CONTIENT UNE FICHE ============ */}
      <section className="py-14 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Tout ce qu\'une fiche Pebiss contient', pt: 'Tudo o que uma ficha Pebiss contém', en: 'Everything a Pebiss listing contains' })}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {tl({
              fr: 'Fini les informations incomplètes : chaque fiche rassemble tout ce qu\'il faut pour décider.',
              pt: 'Chega de informações incompletas: cada ficha reúne tudo o que é preciso para decidir.',
              en: 'No more incomplete info: every listing gathers everything you need to decide.',
            })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title.fr} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-5 px-5">
                  <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}>
                    <f.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{tl(f.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tl(f.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ APERÇU DE FICHE (maquette) ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Texte */}
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                {tl({ fr: 'Une vitrine claire pour chaque entreprise', pt: 'Uma vitrina clara para cada empresa', en: 'A clear storefront for every business' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {tl({
                  fr: 'Le client voit tout en un coup d\'œil : qui vous êtes, ce que vous proposez, où vous êtes et comment vous joindre. Résultat : plus d\'appels, plus de visites, plus de ventes.',
                  pt: 'O cliente vê tudo num relance: quem é, o que oferece, onde está e como contactá-lo. Resultado: mais chamadas, mais visitas, mais vendas.',
                  en: 'Customers see everything at a glance: who you are, what you offer, where you are and how to reach you. Result: more calls, more visits, more sales.',
                })}
              </p>
              <ul className="space-y-3 mb-8">
                {PRO_POINTS.map((p) => (
                  <li key={p.fr} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </span>
                    {tl(p)}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold h-11 px-6">
                  {tl({ fr: 'Enrichir ma fiche maintenant', pt: 'Enriquecer a minha ficha agora', en: 'Enrich my listing now' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Maquette fiche */}
            <Card className="border-0 shadow-xl overflow-hidden max-w-md w-full mx-auto">
              <div className="relative h-40 bg-gradient-to-br from-[#0066CC] to-[#0099FF]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <LayoutList className="h-14 w-14 text-white/25" />
                </div>
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-[#0066CC] text-[10px] font-extrabold px-2 py-1 rounded">
                  <BadgeCheck className="h-3 w-3" /> PRO
                </span>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                      <span className="text-xs text-muted-foreground ml-1">4,8</span>
                    </div>
                  </div>
                  <div className="flex -space-x-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-11 w-11 rounded-lg border-2 border-white bg-muted" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-[#0066CC]" /> {tl({ fr: 'Lun – Sam · 8h – 19h', pt: 'Seg – Sáb · 8h – 19h', en: 'Mon – Sat · 8am – 7pm' })}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-[#0066CC]" /> Bissau, Amura I</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 text-[#0066CC]" /> +245 9 •• •• •• •</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4 text-[#0066CC]" /> {tl({ fr: 'Itinéraire · Site web · Devis', pt: 'Itinerário · Website · Orçamento', en: 'Directions · Website · Quote' })}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 h-9 rounded-full bg-[#0066CC]/10 flex items-center justify-center text-[#0066CC] text-xs font-bold">
                    {tl({ fr: 'Voir la fiche', pt: 'Ver a ficha', en: 'View listing' })}
                  </div>
                  <div className="flex-1 h-9 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-xs font-bold">
                    {tl({ fr: 'Contacter', pt: 'Contactar', en: 'Contact' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {tl({ fr: 'Votre entreprise mérite une belle vitrine', pt: 'A sua empresa merece uma boa vitrina', en: 'Your business deserves a great storefront' })}
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              {tl({
                fr: 'Créez votre fiche gratuitement en quelques minutes et complétez-la quand vous voulez.',
                pt: 'Crie a sua ficha gratuitamente em poucos minutos e complete-a quando quiser.',
                en: 'Create your listing for free in minutes and complete it whenever you want.',
              })}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-8">
                {tl({ fr: 'Créer ma fiche gratuite', pt: 'Criar a minha ficha grátis', en: 'Create my free listing' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
