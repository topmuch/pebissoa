import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/businesses/[slug]/reviews/[reviewId] - Respond to a review (business owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { slug, reviewId } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if business exists
    const business = await db.business.findUnique({ where: { slug } });
    if (!business) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Check if review exists
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
    if (!review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // Only business owner or admin can respond
    if (review.businessId !== business.id) {
      return NextResponse.json(
        { error: 'Cet avis n\'appartient pas à cette entreprise' },
        { status: 400 }
      );
    }

    if (business.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas être vide' },
        { status: 400 }
      );
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: { response },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réponse à l\'avis' },
      { status: 500 }
    );
  }
}
