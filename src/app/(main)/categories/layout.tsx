import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

export const metadata: Metadata = {
  title: 'Toutes les Catégories - Annuaire Pebiss Guinée-Bissau',
  description: 'Explorez toutes les catégories d\'entreprises de Guinée-Bissau : restaurants, hôtels, santé, BTP, mode, technologie, transport et plus. Trouvez le professionnel qu\'il vous faut.',
  keywords: [
    'catégories entreprises Guinée-Bissau',
    'secteurs d\'activité Bissau',
    'annuaire par catégorie Pebiss',
    'trouver professionnel Guinée-Bissau',
  ],
  openGraph: {
    title: 'Toutes les Catégories - Pebiss',
    description: 'Explorez tous les secteurs d\'activité disponibles sur Pebiss et trouvez les professionnels qu\'il vous faut.',
    url: `${SITE_URL}/categories`,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768 }],
  },
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
