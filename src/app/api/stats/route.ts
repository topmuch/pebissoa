import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/stats - Platform statistics (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalAds,
      totalCategories,
      usersByRole,
      businessesByRegion,
      topCategories,
      topBusinesses,
      recentReviews,
      recentBusinesses,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Total businesses
      db.business.count(),

      // Total reviews
      db.review.count(),

      // Total ads
      db.ad.count(),

      // Total categories
      db.category.count(),

      // Users by role
      db.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Businesses by region
      db.business.groupBy({
        by: ['region'],
        where: { region: { not: null } },
        _count: true,
      }),

      // Top categories (by business count)
      db.category.findMany({
        orderBy: {
          businesses: { _count: 'desc' },
        },
        take: 10,
        include: {
          _count: {
            select: { businesses: true },
          },
        },
      }),

      // Top businesses (by views)
      db.business.findMany({
        orderBy: { views: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          views: true,
          city: true,
          region: true,
          category: {
            select: { name: true, slug: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),

      // Recent reviews
      db.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { name: true, avatar: true },
          },
          business: {
            select: { name: true, slug: true },
          },
        },
      }),

      // Recent businesses
      db.business.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          city: true,
          isActive: true,
          owner: {
            select: { name: true },
          },
        },
      }),
    ]);

    // Average rating across all reviews
    const ratingAgg = await db.review.aggregate({
      _avg: { rating: true },
    });

    return NextResponse.json({
      totals: {
        users: totalUsers,
        businesses: totalBusinesses,
        reviews: totalReviews,
        ads: totalAds,
        categories: totalCategories,
        avgRating: ratingAgg._avg.rating
          ? Math.round(ratingAgg._avg.rating * 10) / 10
          : 0,
      },
      usersByRole,
      businessesByRegion,
      topCategories,
      topBusinesses,
      recentReviews,
      recentBusinesses,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
