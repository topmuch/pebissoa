import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/reviews - All reviews (admin only)
export async function GET(request: NextRequest) {
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
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const rating = searchParams.get('rating') || '';
    const hasResponse = searchParams.get('hasResponse') || '';
    const businessId = searchParams.get('businessId') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (hasResponse === 'true') {
      where.response = { not: null };
    } else if (hasResponse === 'false') {
      where.response = null;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews - Delete/moderate a review (admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'avis est requis' },
        { status: 400 }
      );
    }

    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    await db.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Avis supprimé' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    );
  }
}
