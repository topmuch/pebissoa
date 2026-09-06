import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/businesses/[slug] - Get a single business by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const business = await db.business.findUnique({
      where: { slug },
      include: {
        category: true,
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        photos: {
          orderBy: { createdAt: 'desc' },
        },
        products: {
          orderBy: { createdAt: 'desc' },
        },
        services: {
          orderBy: { createdAt: 'desc' },
        },
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reviews: true,
            products: true,
            services: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.business.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    // Calculate average rating
    const reviews = business.reviews;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      ...business,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'entreprise' },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[slug] - Update a business
export async function PUT(
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
    const userRole = (session.user as any).role;

    // Check if business exists
    const existing = await db.business.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Only owner or admin can update
    if (existing.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      logo,
      coverImage,
      address,
      city,
      region,
      country,
      phone,
      email,
      website,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      keywords,
      categoryId,
      addPhoto,
      removePhoto,
    } = body;

    // Handle addPhoto: create a new BusinessPhoto record
    if (addPhoto) {
      const photo = await db.businessPhoto.create({
        data: { url: addPhoto, businessId: existing.id },
      });
      return NextResponse.json({ photo, message: 'Photo ajoutée' });
    }

    // Handle removePhoto: verify ownership then delete
    if (removePhoto) {
      const photo = await db.businessPhoto.findUnique({ where: { id: removePhoto } });
      if (!photo || photo.businessId !== existing.id) {
        return NextResponse.json({ error: 'Photo non trouvée' }, { status: 404 });
      }
      await db.businessPhoto.delete({ where: { id: removePhoto } });
      return NextResponse.json({ message: 'Photo supprimée' });
    }

    // If name changed, update slug
    let newSlug = slug;
    if (name && name !== existing.name) {
      newSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const slugExists = await db.business.findFirst({
        where: { slug: newSlug, id: { not: existing.id } },
      });
      if (slugExists) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    const business = await db.business.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(newSlug !== slug && { slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(region !== undefined && { region }),
        ...(country && { country }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(facebook !== undefined && { facebook }),
        ...(instagram !== undefined && { instagram }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(keywords !== undefined && { keywords }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entreprise' },
      { status: 500 }
    );
  }
}
