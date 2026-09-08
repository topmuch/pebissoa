import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'La référence des pros du pays - Pebiss',
  description: 'Des centaines de professionnels vérifiés référencés partout en Guinée-Bissau. Trouvez le bon pro près de chez vous sur Pebiss, l\'annuaire de référence.',
  keywords: [
    'annuaire professionnel Guinée-Bissau',
    'référence pros Bissau',
    'trouver un professionnel Guinée-Bissau',
    'Pebiss annuaire',
  ],
  openGraph: {
    title: 'La référence des pros du pays - Pebiss',
    description: 'Des centaines de professionnels référencés partout en Guinée-Bissau.',
    url: `${SITE_URL}/reference-pros`,
    images: [{ url: `${SITE_URL}/pro-avantages/pro-reference.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/reference-pros`,
  },
}

export default function ReferenceProsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
