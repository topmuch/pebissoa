import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Des fiches enrichies par les pros - Pebiss',
  description: 'Horaires, prestations, photos, actualités, itinéraire… Découvrez des fiches complètes et mises à jour chaque jour par les professionnels sur Pebiss.',
  keywords: [
    'fiche entreprise Guinée-Bissau',
    'horaires professionnels Bissau',
    'informations entreprises Pebiss',
  ],
  openGraph: {
    title: 'Des fiches enrichies par les pros - Pebiss',
    description: 'Des fiches complètes et mises à jour chaque jour par les professionnels.',
    url: `${SITE_URL}/fiches-pros`,
    images: [{ url: `${SITE_URL}/pro-avantages/pro-fiches.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/fiches-pros`,
  },
}

export default function FichesProsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
