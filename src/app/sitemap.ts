import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

// Force dynamic rendering — DB is unavailable at Docker build time
export const dynamic = 'force-dynamic'

export default async function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw'

  // Fetch all active, non-suspended businesses
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      isSuspended: false,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Fetch all categories
  const categories = await db.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/annonces`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/apropos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/publicite`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Business pages
  const businessPages: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: `${siteUrl}/entreprise/${business.slug}`,
    lastModified: business.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages — use /annuaire with low priority since query params
  // are not supported in sitemap XML
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/annuaire`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...businessPages, ...categoryPages]
}
