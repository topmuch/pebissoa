import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ads - List ads with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const businessId = searchParams.get('businessId') || '';
    const position = searchParams.get('position') || '';
    const search = searchParams.get('search') || '';
    // Verify admin role from session (not from unauthenticated query param)
    let isAdmin = false;
    try {
      const session = await getServerSession(authOptions);
      isAdmin = !!(session?.user && (session.user as any).role === 'ADMIN' && searchParams.get('admin') === 'true');
    } catch {
      // Not authenticated — stay in public mode
    }
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (position) {
      where.position = position;
    }

    if (search) {
      where.title = { contains: search };
    }

    // Public mode: only show active ads within date range
    if (!isAdmin) {
      where.isActive = true;

      // Date range filter: only show if current date is within range, or if no dates set
      where.OR = [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: { lte: now } }, { endDate: null }] },
        { AND: [{ startDate: null }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] },
      ];
    }

    const [ads, total] = await Promise.all([
      db.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              city: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      db.ad.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      ads,
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
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des publicités' },
      { status: 500 }
    );
  }
}

// POST /api/ads - Create a new ad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const body = await request.json();
    const { title, description, image, type, categoryId, businessId, link, position, format, isActive, startDate, endDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    // Verify user owns the business (or is admin)
    const userRole = (session.user as any).role;
    if (businessId && userRole !== 'ADMIN') {
      const business = await db.business.findUnique({
        where: { id: businessId },
      });
      if (!business || business.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Non autorisé à créer une publicité pour cette entreprise' },
          { status: 403 }
        );
      }
    }

    // Validate type
    const validTypes = ['SERVICE', 'PROMOTION', 'PRODUCT', 'EVENT'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de publicité invalide' },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats = ['728x90', '336x280', '300x600'];
    if (format && !validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Format invalide' },
        { status: 400 }
      );
    }

    // Validate position
    const validPositions = ['home', 'enterprise'];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json(
        { error: 'Position invalide' },
        { status: 400 }
      );
    }

    const ad = await db.ad.create({
      data: {
        title,
        description,
        image,
        type: type || 'SERVICE',
        categoryId: categoryId || null,
        businessId: businessId || null,
        link: link || null,
        position: position || 'home',
        format: format || '336x280',
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la publicité' },
      { status: 500 }
    );
  }
}
