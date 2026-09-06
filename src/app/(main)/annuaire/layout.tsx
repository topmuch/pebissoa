import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Annuaire des Entreprises de Guinée-Bissau - Rechercher et Trouver',
  description: 'Parcourez l\'annuaire professionnel complet de Guinée-Bissau. Recherchez des entreprises par ville, région ou catégorie. Restaurants, hôtels, santé, BTP, informatique et plus.',
  keywords: [
    'annuaire entreprises Guinée-Bissau',
    'trouver entreprise Bissau',
    'repertoire professionnel Guinée-Bissau',
    'entreprises par ville Guinée-Bissau',
    'services Bissau',
    'commerces Guinée-Bissau',
  ],
  openGraph: {
    title: 'Annuaire des Entreprises de Guinée-Bissau - Pebiss',
    description: 'Parcourez l\'annuaire professionnel complet de Guinée-Bissau. Recherchez par ville, région ou catégorie.',
    url: `${SITE_URL}/annuaire`,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/annuaire`,
  },
}

export default function AnnuaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
