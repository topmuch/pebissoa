'use client';

/**
 * Section « Pourquoi Pebiss » — 4 cartes avantages avec IMAGES RÉELLES
 * (plus d'icônes). Placée tout en bas de la page d'accueil, juste avant le footer.
 * Pour changer une photo : remplacer le fichier dans /public/pro-avantages/.
 */

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

interface ProCard {
  /** Photo réelle affichée en haut de la carte (dans /public/pro-avantages) */
  image: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
}

/** Photo avec repli dégradé si le fichier est introuvable */
function CardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/25">
        <span className="text-2xl font-extrabold text-primary/40">Pebiss</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

const CARDS: ProCard[] = [
  {
    image: '/pro-avantages/pro-reference.jpg',
    title: { fr: 'La référence des pros du pays', pt: 'A referência dos profissionais do país' },
    desc: {
      fr: 'Des centaines de professionnels inscrits, partout en Guinée-Bissau',
      pt: 'Centenas de profissionais inscritos, em toda a Guiné-Bissau',
    },
  },
  {
    image: '/pro-avantages/pro-fiches.jpg',
    title: { fr: 'Des fiches enrichies par les pros', pt: 'Fichas enriquecidas pelos profissionais' },
    desc: {
      fr: 'Horaires, prestations, actus, coordonnées, itinéraire… des informations mises à jour chaque jour',
      pt: 'Horários, serviços, notícias, contactos, itinerário… informações atualizadas todos os dias',
    },
  },
  {
    image: '/pro-avantages/pro-avis.jpg',
    title: { fr: 'Des avis pour vous aider à décider', pt: 'Avaliações para o ajudar a decidir' },
    desc: {
      fr: 'Notes et avis des utilisateurs, photos, badges qualité et certifications…',
      pt: 'Notas e opiniões dos utilizadores, fotos, selos de qualidade e certificações…',
    },
  },
  {
    image: '/pro-avantages/pro-services.jpg',
    title: { fr: 'Des services en ligne pour vous faciliter la vie', pt: 'Serviços online para lhe facilitar a vida' },
    desc: {
      fr: 'Demande de devis, prise de rendez-vous, réservation, messagerie…',
      pt: 'Pedidos de orçamento, marcações, reservas, mensagens…',
    },
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
            ? 'Com a Pebiss, encontre sempre o profissional certo perto de si !'
            : 'Avec Pebiss, trouvez toujours le bon pro près de chez vous !'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CARDS.map((card) => (
            <div
              key={card.title.fr}
              className="group bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              {/* Photo réelle */}
              <div className="relative h-36 md:h-44 overflow-hidden">
                <CardImage src={card.image} alt={card.title[locale]} />
                {/* Voile bas pour lier l'image au texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Textes */}
              <div className="flex flex-1 flex-col px-4 py-4 md:px-5 md:py-5 text-center">
                <h3 className="text-sm md:text-base font-bold text-foreground leading-snug mb-2">
                  {card.title[locale]}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {card.desc[locale]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
