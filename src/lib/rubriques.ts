// Rubriques d'accueil — raccourcis vers les annonces par thème
// Chaque rubrique regroupe une ou plusieurs catégories de la base.
// "Bons plans" n'a pas de catégories : il pointe vers toutes les annonces.
import type { LucideIcon } from 'lucide-react';
import { Flame, UtensilsCrossed, BedDouble, ShoppingBag, HeartPulse, Home, Car, HardHat } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

export interface Rubrique {
  key: string;
  labels: Record<Locale, string>;
  subtitles: Record<Locale, string>;
  /** Slugs de catégories regroupés — vide = toutes les annonces */
  categories: string[];
  icon: LucideIcon;
  /** Image réelle affichée sur la grande carte carrée (dans /public) */
  image: string;
  /** Classes gradient Tailwind (fallback de fond sous l'image) */
  gradient: string;
  /** URL de destination */
  href: string;
}

export const RUBRIQUES: Rubrique[] = [
  {
    key: 'bons-plans',
    labels: { fr: 'Bons plans', pt: 'Boas ofertas', en: 'Great deals' },
    subtitles: { fr: 'Toutes les bonnes affaires', pt: 'Todos os bons negócios', en: 'All the best deals' },
    categories: [],
    icon: Flame,
    image: '/rubriques/bons-plans.jpg',
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    href: '/annuaire',
  },
  {
    key: 'restos',
    labels: { fr: 'Restos', pt: 'Restaurantes', en: 'Eateries' },
    subtitles: { fr: 'Restaurants & alimentation', pt: 'Restaurantes & alimentação', en: 'Restaurants & food' },
    categories: ['restaurants', 'restaurants-alimentation'],
    icon: UtensilsCrossed,
    image: '/rubriques/restos.jpg',
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    href: '/annuaire?category=restaurants,restaurants-alimentation',
  },
  {
    key: 'hotels',
    labels: { fr: 'Hôtels', pt: 'Hotéis', en: 'Hotels' },
    subtitles: { fr: 'Hôtels & tourisme', pt: 'Hotéis & turismo', en: 'Hotels & tourism' },
    categories: ['hotels', 'tourisme-hotellerie', 'tourisme'],
    icon: BedDouble,
    image: '/rubriques/hotels.jpg',
    gradient: 'from-teal-500 via-emerald-500 to-green-600',
    href: '/annuaire?category=hotels,tourisme-hotellerie,tourisme',
  },
  {
    key: 'shoppings',
    labels: { fr: 'Shoppings', pt: 'Compras', en: 'Shopping' },
    subtitles: { fr: 'Mode & boutiques', pt: 'Moda & lojas', en: 'Fashion & shops' },
    categories: ['mode-textile', 'mode-accessoires', 'commerce-distribution', 'electroniques'],
    icon: ShoppingBag,
    image: '/rubriques/shoppings.jpg',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    href: '/annuaire?category=mode-textile,mode-accessoires,commerce-distribution,electroniques',
  },
  {
    key: 'sante',
    labels: { fr: 'Santé', pt: 'Saúde', en: 'Health' },
    subtitles: { fr: 'Pharmacies & bien-être', pt: 'Farmácias & bem-estar', en: 'Pharmacies & wellness' },
    categories: ['sante-bien-etre'],
    icon: HeartPulse,
    image: '/rubriques/sante.jpg',
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
    href: '/annuaire?category=sante-bien-etre',
  },
  {
    key: 'immobilier',
    labels: { fr: 'Immobilier', pt: 'Imobiliário', en: 'Real Estate' },
    subtitles: { fr: 'Logements & agences', pt: 'Casas & agências', en: 'Homes & agencies' },
    categories: ['immobilier'],
    icon: Home,
    image: '/rubriques/immobilier.jpg',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    href: '/annuaire?category=immobilier',
  },
  {
    key: 'transport',
    labels: { fr: 'Auto & transport', pt: 'Auto & transporte', en: 'Auto & Transport' },
    subtitles: { fr: 'Taxis, bus & logistique', pt: 'Táxis & logística', en: 'Taxis, buses & logistics' },
    categories: ['transport-logistique'],
    icon: Car,
    image: '/rubriques/transport.jpg',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    href: '/annuaire?category=transport-logistique',
  },
  {
    key: 'travaux',
    labels: { fr: 'Travaux & services', pt: 'Obras & serviços', en: 'Works & Services' },
    subtitles: { fr: 'Bâtiment & artisans', pt: 'Construção & artesãos', en: 'Building & craftsmen' },
    categories: ['btp-construction'],
    icon: HardHat,
    image: '/rubriques/travaux.jpg',
    gradient: 'from-slate-500 via-gray-600 to-zinc-700',
    href: '/annuaire?category=btp-construction',
  },
];

/** Retrouve la rubrique correspondant à une valeur de filtre catégorie (slugs joints par des virgules) */
export function findRubriqueByCategory(categoryParam: string): Rubrique | undefined {
  if (!categoryParam || !categoryParam.includes(',')) return undefined;
  const slugs = categoryParam.split(',').map((s) => s.trim()).filter(Boolean);
  return RUBRIQUES.find((r) => r.categories.length > 0 && r.categories.join(',') === slugs.join(','));
}
