import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/businesses/[slug]/reviews - List reviews for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10') || 10));
    const skip = (page - 1) * limit;

    // Check if business exists
    const business = await db.business.findUnique({ where: { slug } });
    if (!business) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { businessId: business.id },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.review.count({
        where: { businessId: business.id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Get full average from all reviews
    const allReviewAgg = await db.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        avgRating: allReviewAgg._avg.rating
          ? Math.round(allReviewAgg._avg.rating * 10) / 10
          : 0,
        totalReviews: allReviewAgg._count.rating,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// POST /api/businesses/[slug]/reviews - Create a review for a business
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const userId = (session.user as any).id;

    // Check if business exists
    const business = await db.business.findUnique({ where: { slug } });
    if (!business) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this business
    const existingReview = await db.review.findFirst({
      where: {
        businessId: business.id,
        userId,
      },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour cette entreprise' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    if (comment && comment.length > 2000) {
      return NextResponse.json(
        { error: 'Le commentaire ne doit pas dépasser 2000 caractères' },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        rating,
        comment,
        businessId: business.id,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'avis' },
      { status: 500 }
    );
  }
}
