import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'À Propos de Pebiss - Notre Mission',
  description: 'Découvrez Pebiss, le premier annuaire professionnel de Guinée-Bissau. Notre mission est de connecter entreprises et clients à travers un annuaire moderne et accessible.',
  keywords: [
    'à propos Pebiss',
    'mission annuaire Guinée-Bissau',
    'équipe Pebiss',
    'valeurs annuaire professionnel',
  ],
  openGraph: {
    title: 'À Propos de Pebiss',
    description: 'Découvrez Pebiss, le premier annuaire professionnel de Guinée-Bissau.',
    url: `${SITE_URL}/apropos`,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/apropos`,
  },
}

export default function AproposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
