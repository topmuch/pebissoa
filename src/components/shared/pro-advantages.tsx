'use client';

/**
 * Section « Pourquoi PebissOa » — 4 cartes avantages, inspirée du bloc
 * « rencontrez le pro qu'il vous faut » des annuaires pro.
 * Placée tout en bas de la page d'accueil, juste avant le footer.
 */

import { Award, ClipboardList, ThumbsUp, CalendarCheck, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

interface ProCard {
  icon: LucideIcon;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  /** Couleurs douces du pastille d'icône */
  iconBg: string;
  iconColor: string;
}

const CARDS: ProCard[] = [
  {
    icon: Award,
    title: { fr: 'La référence des pros du pays', pt: 'A referência dos profissionais do país' },
    desc: {
      fr: 'Des centaines de professionnels inscrits, partout en Guinée-Bissau',
      pt: 'Centenas de profissionais inscritos, em toda a Guiné-Bissau',
    },
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: ClipboardList,
    title: { fr: 'Des fiches enrichies par les pros', pt: 'Fichas enriquecidas pelos profissionais' },
    desc: {
      fr: 'Horaires, prestations, actus, coordonnées, itinéraire… des informations mises à jour chaque jour',
      pt: 'Horários, serviços, notícias, contactos, itinerário… informações atualizadas todos os dias',
    },
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ThumbsUp,
    title: { fr: 'Des avis pour vous aider à décider', pt: 'Avaliações para o ajudar a decidir' },
    desc: {
      fr: 'Notes et avis des utilisateurs, photos, badges qualité et certifications…',
      pt: 'Notas e opiniões dos utilizadores, fotos, selos de qualidade e certificações…',
    },
    iconBg: 'bg-rose-100 dark:bg-rose-500/15',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: CalendarCheck,
    title: { fr: 'Des services en ligne pour vous faciliter la vie', pt: 'Serviços online para lhe facilitar a vida' },
    desc: {
      fr: 'Demande de devis, prise de rendez-vous, réservation, messagerie…',
      pt: 'Pedidos de orçamento, marcações, reservas, mensagens…',
    },
    iconBg: 'bg-violet-100 dark:bg-violet-500/15',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

export function ProAdvantages() {
  const { locale } = useTranslation();

  return (
    <section className="py-12 md:py-16" aria-labelledby="pro-advantages-title">
      <div className="container mx-auto px-4">
        <h2
          id="pro-advantages-title"
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center text-foreground mb-8 md:mb-10"
        >
          {locale === 'pt'
            ? 'Com a PebissOa, encontre sempre o profissional certo perto de si !'
            : 'Avec PebissOa, trouvez toujours le bon pro près de chez vous !'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title.fr}
                className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 px-5 py-8 md:px-6 md:py-10 text-center flex flex-col items-center"
              >
                {/* Icône dans une pastille colorée */}
                <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full ${card.iconBg} flex items-center justify-center mb-4 md:mb-6 shrink-0`}>
                  <Icon className={`h-8 w-8 md:h-10 md:w-10 ${card.iconColor}`} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-foreground leading-snug mb-2 md:mb-3">
                  {card.title[locale]}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {card.desc[locale]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
