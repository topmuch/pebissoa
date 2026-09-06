import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Contactez-nous - Pebiss',
  description: 'Contactez l\'équipe Pebiss pour toute question, suggestion ou demande d\'information sur notre annuaire professionnel de Guinée-Bissau. Nous sommes disponibles par téléphone et email.',
  keywords: [
    'contact Pebiss',
    'contacter annuaire Guinée-Bissau',
    'support Pebiss',
    'aide annuaire professionnel',
  ],
  openGraph: {
    title: 'Contactez-nous - Pebiss',
    description: 'Contactez l\'équipe Pebiss pour toute question sur notre annuaire professionnel.',
    url: `${SITE_URL}/contact`,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
