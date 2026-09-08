import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Des avis pour vous aider à décider - Pebiss',
  description: 'Notes et avis des utilisateurs, photos, badges qualité… Choisissez le bon professionnel en toute confiance grâce aux avis vérifiés de Pebiss.',
  keywords: [
    'avis professionnels Guinée-Bissau',
    'notes entreprises Bissau',
    'avis vérifiés Pebiss',
  ],
  openGraph: {
    title: 'Des avis pour vous aider à décider - Pebiss',
    description: 'Choisissez le bon professionnel grâce aux avis vérifiés de Pebiss.',
    url: `${SITE_URL}/avis-clients`,
    images: [{ url: `${SITE_URL}/pro-avantages/pro-avis.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/avis-clients`,
  },
}

export default function AvisClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
