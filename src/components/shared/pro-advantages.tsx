'use client';

/**
 * Section « Pourquoi Pebiss » — 4 cartes avantages avec IMAGES RÉELLES
 * (plus d'icônes). Placée tout en bas de la page d'accueil, juste avant le footer.
 * Pour changer une photo : remplacer le fichier dans /public/pro-avantages/.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

interface ProCard {
  /** Photo réelle affichée en haut de la carte (dans /public/pro-avantages) */
  image: string;
  /** Page dédiée vers laquelle la carte pointe */
  href: string;
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
    href: '/reference-pros',
    title: {
      fr: 'La référence des pros du pays',
      pt: 'A referência dos profissionais do país',
      en: 'The go-to directory for local pros',
    },
    desc: {
      fr: 'Des centaines de professionnels inscrits, partout en Guinée-Bissau',
      pt: 'Centenas de profissionais inscritos, em toda a Guiné-Bissau',
      en: 'Hundreds of registered professionals, all across Guinea-Bissau',
    },
  },
  {
    image: '/pro-avantages/pro-fiches.jpg',
    href: '/fiches-pros',
    title: {
      fr: 'Des fiches enrichies par les pros',
      pt: 'Fichas enriquecidas pelos profissionais',
      en: 'Listings enriched by the pros',
    },
    desc: {
      fr: 'Horaires, prestations, actus, coordonnées, itinéraire… des informations mises à jour chaque jour',
      pt: 'Horários, serviços, notícias, contactos, itinerário… informações atualizadas todos os dias',
      en: 'Opening hours, services, news, contact details, directions… information updated daily',
    },
  },
  {
    image: '/pro-avantages/pro-avis.jpg',
    href: '/avis-clients',
    title: {
      fr: 'Des avis pour vous aider à décider',
      pt: 'Avaliações para o ajudar a decidir',
      en: 'Reviews to help you decide',
    },
    desc: {
      fr: 'Notes et avis des utilisateurs, photos, badges qualité et certifications…',
      pt: 'Notas e opiniões dos utilizadores, fotos, selos de qualidade e certificações…',
      en: 'User ratings and reviews, photos, quality badges and certifications…',
    },
  },
  {
    image: '/pro-avantages/pro-services.jpg',
    href: '/services-en-ligne',
    title: {
      fr: 'Des services en ligne pour vous faciliter la vie',
      pt: 'Serviços online para lhe facilitar a vida',
      en: 'Online services to make life easier',
    },
    desc: {
      fr: 'Demande de devis, prise de rendez-vous, réservation, messagerie…',
      pt: 'Pedidos de orçamento, marcações, reservas, mensagens…',
      en: 'Quote requests, appointments, bookings, messaging…',
    },
  },
];

export function ProAdvantages() {
  const { locale, tl } = useTranslation();

  return (
    <section className="py-12 md:py-16" aria-labelledby="pro-advantages-title">
      <div className="container mx-auto px-4">
        <h2
          id="pro-advantages-title"
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center text-foreground mb-8 md:mb-10"
        >
          {tl({
            fr: 'Avec Pebiss, trouvez toujours le bon pro près de chez vous !',
            pt: 'Com a Pebiss, encontre sempre o profissional certo perto de si !',
            en: 'With Pebiss, always find the right pro near you!',
          })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CARDS.map((card) => (
            <Link
              key={card.title.fr}
              href={card.href}
              aria-label={card.title[locale]}
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
                <h3 className="text-sm md:text-base font-bold text-foreground leading-snug mb-2 group-hover:text-[#0066CC] transition-colors">
                  {card.title[locale]}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {card.desc[locale]}
                </p>
                <span className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-bold text-[#0066CC] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  {tl({ fr: 'En savoir plus', pt: 'Saber mais', en: 'Learn more' })}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
