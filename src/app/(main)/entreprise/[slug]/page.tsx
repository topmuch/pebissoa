import { Metadata } from 'next'
import { db } from '@/lib/db'
import EntrepriseDetailClient from './EntrepriseDetailClient'

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'
const SITE_NAME = 'Pebiss'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const business = await db.business.findUnique({
      where: { slug, isActive: true, isSuspended: false },
      select: {
        name: true,
        description: true,
        city: true,
        region: true,
        country: true,
        category: { select: { name: true } },
        coverImage: true,
        logo: true,
      },
    })

    if (!business) {
      return { title: 'Entreprise non trouvée' }
    }

    const title = `${business.name} - ${business.category?.name || 'Entreprise'} à ${business.city || 'Guinée-Bissau'}`
    const description = business.description
      ? business.description.substring(0, 160)
      : `${business.name}, ${business.category?.name || 'professionnel'} à ${business.city || 'Guinée-Bissau'}. Découvrez ses services, avis et coordonnées sur ${SITE_NAME}.`
    const imageUrl = business.coverImage || business.logo || `${SITE_URL}/hero-banner.jpg`

    const ogUrl = `${SITE_URL}/entreprise/${slug}`

    return {
      title,
      description,
      keywords: [business.name, business.city || '', business.region || '', business.category?.name || '', 'Guinée-Bissau', 'annuaire', 'Pebiss'].filter(Boolean),
      openGraph: {
        title,
        description,
        url: ogUrl,
        siteName: SITE_NAME,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: business.name }],
        locale: 'fr_GW',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: ogUrl,
      },
    }
  } catch {
    return { title: 'Entreprise - Pebiss' }
  }
}

// JSON-LD LocalBusiness structured data
function JsonLdLocalBusiness({ business }: { business: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description || undefined,
    url: `${SITE_URL}/entreprise/${business.slug}`,
    image: business.logo || business.coverImage || undefined,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.city || undefined,
      addressRegion: business.region || undefined,
      addressCountry: business.country || 'GW',
    },
    ...(business.website && { sameAs: [business.website, business.facebook, business.instagram, business.twitter, business.linkedin].filter(Boolean) }),
    ...(business.category && { category: business.category.name }),
    ...(business.avgRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.avgRating.toFixed(1),
        reviewCount: business._count?.reviews || 0,
      },
    }),
    openingHoursSpecification: business.hours?.filter((h: any) => !h.isClosed).map((h: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][h.dayOfWeek],
      opens: h.openTime,
      closes: h.closeTime,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// JSON-LD Breadcrumb
function JsonLdBreadcrumb({ business }: { business: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Annuaire', item: `${SITE_URL}/annuaire` },
      ...(business.category ? [{ '@type': 'ListItem', position: 3, name: business.category.name, item: `${SITE_URL}/annuaire?category=${business.category.slug}` }] : []),
      { '@type': 'ListItem', position: business.category ? 4 : 3, name: business.name, item: `${SITE_URL}/entreprise/${business.slug}` },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function BusinessDetailPage({ params }: Props) {
  const { slug } = await params

  let business = null
  try {
    business = await db.business.findUnique({
      where: { slug, isActive: true, isSuspended: false },
      select: {
        slug: true,
        name: true,
        description: true,
        city: true,
        region: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        facebook: true,
        instagram: true,
        twitter: true,
        linkedin: true,
        address: true,
        logo: true,
        coverImage: true,
        category: { select: { name: true, slug: true } },
        avgRating: true,
        hours: {
          select: { dayOfWeek: true, openTime: true, closeTime: true, isClosed: true },
        },
        _count: { select: { reviews: true } },
      },
    })
  } catch (error) {
    console.error('[entreprise/slug] Error fetching business:', error);
  }

  return (
    <>
      {business && (
        <>
          <JsonLdLocalBusiness business={business} />
          <JsonLdBreadcrumb business={business} />
        </>
      )}
      <EntrepriseDetailClient />
    </>
  )
}
