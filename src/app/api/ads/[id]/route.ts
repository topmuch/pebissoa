import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ads/[id] - Get a single ad
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await db.ad.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            city: true,
            region: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Publicité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la publicité' },
      { status: 500 }
    );
  }
}

// PUT /api/ads/[id] - Update an ad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if ad exists
    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Publicité non trouvée' },
        { status: 404 }
      );
    }

    // Check ownership
    if (userRole !== 'ADMIN') {
      const business = await db.business.findUnique({
        where: { id: existing.businessId },
      });
      if (!business || business.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { title, description, image, type, categoryId, format, position, link, isActive, startDate, endDate } = body;

    // Validate type
    const validTypes = ['SERVICE', 'PROMOTION', 'PRODUCT', 'EVENT'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de publicité invalide' },
        { status: 400 }
      );
    }

    const ad = await db.ad.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(type && { type }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(format && { format }),
        ...(position && { position }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: {
        business: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la publicité' },
      { status: 500 }
    );
  }
}

// DELETE /api/ads/[id] - Delete an ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if ad exists
    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Publicité non trouvée' },
        { status: 404 }
      );
    }

    // Check ownership
    if (userRole !== 'ADMIN') {
      const business = await db.business.findUnique({
        where: { id: existing.businessId },
      });
      if (!business || business.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }
    }

    await db.ad.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Publicité supprimée' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la publicité' },
      { status: 500 }
    );
  }
}
