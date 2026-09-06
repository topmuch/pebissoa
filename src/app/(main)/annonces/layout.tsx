import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Annonces et Publicités - Promouvez votre Activité',
  description: 'Découvrez les annonces et publicités sur Pebiss. Promouvez votre entreprise, service ou produit auprès de milliers de clients potentiels en Guinée-Bissau.',
  keywords: [
    'annonces Guinée-Bissau',
    'publicité Guinée-Bissau',
    'promouvoir entreprise',
    'publicité professionnelle',
    'marketing Guinée-Bissau',
  ],
  openGraph: {
    title: 'Annonces et Publicités - Pebiss',
    description: 'Découvrez les annonces et publicités sur Pebiss. Promouvez votre activité.',
    url: `${SITE_URL}/annonces`,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/annonces`,
  },
}

export default function AnnoncesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
