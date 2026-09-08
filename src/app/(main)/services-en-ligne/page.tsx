'use client';

/**
 * Page « Des services en ligne pour vous faciliter la vie » — devis,
 * rendez-vous, réservation, messagerie : les services Pebiss expliqués.
 */

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, CalendarCheck, BookmarkCheck, MessagesSquare,
  Navigation, PhoneCall, Megaphone, BellRing, Check, ArrowRight,
  Timer, Wifi, Smartphone,
} from 'lucide-react';

const SERVICES = [
  {
    Icon: FileText,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    title: { fr: 'Demande de devis', pt: 'Pedido de orçamento', en: 'Quote request' },
    desc: { fr: 'Décrivez votre besoin une fois : le pro vous répond avec un prix, sans vous déplacer.', pt: 'Descreva a sua necessidade uma vez: o profissional responde com um preço, sem deslocação.', en: 'Describe your need once: the pro replies with a price, no travel needed.' },
  },
  {
    Icon: CalendarCheck,
    color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    title: { fr: 'Prise de rendez-vous', pt: 'Marcação de compromissos', en: 'Appointment booking' },
    desc: { fr: 'Choisissez un créneau directement depuis la fiche du pro, 24 h/24.', pt: 'Escolha um horário diretamente na ficha do profissional, 24 h/24.', en: 'Pick a time slot right from the pro\'s listing, 24/7.' },
  },
  {
    Icon: BookmarkCheck,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    title: { fr: 'Réservation de services', pt: 'Reserva de serviços', en: 'Service booking' },
    desc: { fr: 'Table, prestation, produit : réservez en ligne et recevez une confirmation.', pt: 'Mesa, serviço, produto: reserve online e receba uma confirmação.', en: 'Table, service, product: book online and get a confirmation.' },
  },
  {
    Icon: MessagesSquare,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    title: { fr: 'Messagerie directe', pt: 'Mensagens diretas', en: 'Direct messaging' },
    desc: { fr: 'Échangez avec le pro depuis votre compte : questions, précisions, suivi.', pt: 'Fale com o profissional a partir da sua conta: perguntas, detalhes, acompanhamento.', en: 'Chat with the pro from your account: questions, details, follow-up.' },
  },
  {
    Icon: Navigation,
    color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    title: { fr: 'Itinéraire en un clic', pt: 'Itinerário num clique', en: 'One-click directions' },
    desc: { fr: 'Ouvrez la carte et lancez la navigation vers le pro, où que vous soyez.', pt: 'Abra o mapa e inicie a navegação até ao profissional, de onde estiver.', en: 'Open the map and start navigating to the pro from anywhere.' },
  },
  {
    Icon: PhoneCall,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    title: { fr: 'Appel & WhatsApp directs', pt: 'Chamada e WhatsApp diretos', en: 'Direct call & WhatsApp' },
    desc: { fr: 'Un bouton pour appeler ou écrire sur WhatsApp, sans chercher le numéro.', pt: 'Um botão para ligar ou escrever no WhatsApp, sem procurar o número.', en: 'One button to call or WhatsApp, no need to hunt for the number.' },
  },
  {
    Icon: Megaphone,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
    title: { fr: 'Petites annonces', pt: 'Anúncios classificados', en: 'Classified ads' },
    desc: { fr: 'Achetez et vendez gratuitement vos produits près de chez vous.', pt: 'Compre e venda gratuitamente os seus produtos perto de si.', en: 'Buy and sell your products for free, near you.' },
  },
  {
    Icon: BellRing,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    title: { fr: 'Suivi de vos demandes', pt: 'Acompanhamento dos pedidos', en: 'Request tracking' },
    desc: { fr: 'Retrouvez devis, rendez-vous et messages dans votre tableau de bord personnel.', pt: 'Encontre orçamentos, compromissos e mensagens no seu painel pessoal.', en: 'Find quotes, appointments and messages in your personal dashboard.' },
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: '1',
    title: { fr: 'Je crée mon compte gratuit', pt: 'Crio a minha conta grátis', en: 'I create my free account' },
    desc: { fr: 'Nom, e-mail, mot de passe : 1 minute montre en main.', pt: 'Nome, e-mail, palavra-passe: 1 minuto, cronómetro na mão.', en: 'Name, email, password: just 1 minute.' },
  },
  {
    step: '2',
    title: { fr: 'Je choisis un pro et un service', pt: 'Escolho um profissional e um serviço', en: 'I pick a pro and a service' },
    desc: { fr: 'Devis, rendez-vous ou réservation : je clique sur le bouton correspondant.', pt: 'Orçamento, compromisso ou reserva: clico no botão correspondente.', en: 'Quote, appointment or booking: I click the matching button.' },
  },
  {
    step: '3',
    title: { fr: 'Je suis la réponse depuis mon tableau de bord', pt: 'Acompanho a resposta no meu painel', en: 'I follow the reply from my dashboard' },
    desc: { fr: 'Notification dès que le pro répond. Simple, clair, traçable.', pt: 'Notificação assim que o profissional responde. Simples, claro, rastreável.', en: 'Notification as soon as the pro replies. Simple, clear, traceable.' },
  },
] as const;

const BENEFITS = [
  { Icon: Timer, label: { fr: 'Zéro attente au téléphone', pt: 'Zero espera ao telefone', en: 'No time wasted on hold' } },
  { Icon: Wifi, label: { fr: 'Tout se fait en ligne, 24 h/24', pt: 'Tudo online, 24 h/24', en: 'Everything online, 24/7' } },
  { Icon: Smartphone, label: { fr: 'Pensé pour le mobile', pt: 'Pensado para o telemóvel', en: 'Designed for mobile' } },
  { Icon: Check, label: { fr: '100 % gratuit pour les clients', pt: '100 % grátis para os clientes', en: '100% free for customers' } },
] as const;

export default function ServicesEnLignePage() {
  const { tl } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* ============ HERO avec image ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/pro-avantages/pro-services.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003B7A]/95 via-[#0066CC]/85 to-[#0066CC]/60" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Timer className="h-3.5 w-3.5" />
              {tl({ fr: 'Gagnez du temps, en ligne', pt: 'Ganze tempo, online', en: 'Save time, online' })}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {tl({ fr: 'Des services en ligne pour vous faciliter la vie', pt: 'Serviços online para lhe facilitar a vida', en: 'Online services to make life easier' })}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              {tl({
                fr: 'Demande de devis, prise de rendez-vous, réservation, messagerie… Faites tout depuis votre téléphone, gratuitement, sans appeler ni vous déplacer.',
                pt: 'Pedido de orçamento, marcação, reserva, mensagens… Faça tudo a partir do seu telemóvel, gratuitamente, sem ligar nem se deslocar.',
                en: 'Quote requests, appointments, bookings, messaging… Do it all from your phone, for free, no calls or travel needed.',
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Créer mon compte gratuit', pt: 'Criar a minha conta grátis', en: 'Create my free account' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/annuaire">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white font-bold h-12 px-7 w-full sm:w-auto">
                  {tl({ fr: 'Essayer maintenant', pt: 'Experimentar agora', en: 'Try it now' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AVANTAGES RAPIDES ============ */}
      <section className="bg-[#0066CC] py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.label.fr} className="flex items-center justify-center gap-2.5 text-white">
                <b.Icon className="h-5 w-5 text-white/70 shrink-0" aria-hidden />
                <p className="text-sm font-medium">{tl(b.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TOUS LES SERVICES ============ */}
      <section className="py-14 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-3">
            {tl({ fr: 'Tous vos services au même endroit', pt: 'Todos os serviços no mesmo lugar', en: 'All your services in one place' })}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {tl({
              fr: 'Depuis n\'importe quelle fiche pro, lancez le service dont vous avez besoin.',
              pt: 'A partir de qualquer ficha, inicie o serviço de que precisa.',
              en: 'From any pro listing, launch the service you need.',
            })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {SERVICES.map((s) => (
              <Card key={s.title.fr} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-5 px-5">
                  <div className={`inline-flex p-3 rounded-xl ${s.color} mb-4`}>
                    <s.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{tl(s.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tl(s.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMMENT ÇA MARCHE ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8 text-center">
                {tl({ fr: '3 étapes, et c\'est fait', pt: '3 passos, e está feito', en: '3 steps and you\'re done' })}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                {HOW_IT_WORKS.map((s, i) => (
                  <div key={s.step} className="relative flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-[#0066CC] text-white font-extrabold text-lg flex items-center justify-center mb-4">
                      {s.step}
                    </div>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-border" aria-hidden />
                    )}
                    <h3 className="font-bold text-foreground mb-1.5">{tl(s.title)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{tl(s.desc)}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/register">
                  <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold h-11 px-7">
                    {tl({ fr: 'Commencer maintenant', pt: 'Começar agora', en: 'Get started now' })}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============ CÔTÉ PROS ============ */}
      <section className="pb-14 md:pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center rounded-2xl bg-muted/60 dark:bg-card p-8 md:p-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                {tl({ fr: 'Vous êtes un pro ? Recevez des demandes qualifiées', pt: 'É profissional? Receba pedidos qualificados', en: 'Are you a pro? Receive qualified requests' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {tl({
                  fr: 'Chaque demande de devis ou de rendez-vous arrive directement dans votre tableau de bord, avec le détail du besoin. Vous répondez quand vous voulez — et vous ne payez aucune commission.',
                  pt: 'Cada pedido de orçamento ou marcação chega diretamente ao seu painel, com o detalhe da necessidade. Responde quando quiser — e não paga nenhuma comissão.',
                  en: 'Every quote or appointment request lands directly in your dashboard, with the full details. Reply whenever you want — and pay zero commission.',
                })}
              </p>
              <Link href="/register">
                <Button variant="outline" className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white font-bold h-11 px-6">
                  {tl({ fr: 'Inscrire mon entreprise', pt: 'Registar a minha empresa', en: 'List my business' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: FileText, fr: 'Devis reçus', pt: 'Orçamentos recebidos', en: 'Quotes received' },
                { Icon: CalendarCheck, fr: 'Rendez-vous confirmés', pt: 'Compromissos confirmados', en: 'Confirmed appointments' },
                { Icon: MessagesSquare, fr: 'Messages clients', pt: 'Mensagens de clientes', en: 'Customer messages' },
                { Icon: BellRing, fr: 'Alertes en temps réel', pt: 'Alertas em tempo real', en: 'Real-time alerts' },
              ].map((x) => (
                <div key={x.fr} className="rounded-xl bg-white dark:bg-background p-4 text-center shadow-sm">
                  <x.Icon className="h-6 w-6 text-[#0066CC] mx-auto mb-2" aria-hidden />
                  <p className="text-xs font-semibold text-foreground">{tl(x)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#0099FF] p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {tl({ fr: 'Simplifiez-vous la vie dès aujourd\'hui', pt: 'Facilite a sua vida hoje mesmo', en: 'Make your life easier today' })}
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              {tl({
                fr: 'Un compte gratuit suffit pour profiter de tous les services en ligne de Pebiss.',
                pt: 'Uma conta grátis basta para usufruir de todos os serviços online da Pebiss.',
                en: 'One free account is all you need to enjoy all Pebiss online services.',
              })}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#0066CC] hover:bg-white/90 font-bold h-12 px-8">
                {tl({ fr: 'Créer mon compte gratuit', pt: 'Criar a minha conta grátis', en: 'Create my free account' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
