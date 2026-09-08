import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Des services en ligne pour vous faciliter la vie - Pebiss',
  description: 'Demande de devis, prise de rendez-vous, réservation, messagerie… Gagnez du temps avec les services en ligne gratuits de Pebiss.',
  keywords: [
    'services en ligne Guinée-Bissau',
    'devis professionnel Bissau',
    'rendez-vous en ligne Pebiss',
  ],
  openGraph: {
    title: 'Des services en ligne pour vous faciliter la vie - Pebiss',
    description: 'Devis, rendez-vous, réservation, messagerie… Gagnez du temps avec Pebiss.',
    url: `${SITE_URL}/services-en-ligne`,
    images: [{ url: `${SITE_URL}/pro-avantages/pro-services.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/services-en-ligne`,
  },
}

export default function ServicesEnLigneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
