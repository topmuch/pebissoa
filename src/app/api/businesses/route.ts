import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/businesses - List businesses with search, filters, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const region = searchParams.get('region') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
    const featured = searchParams.get('featured') === 'true';
    const ownerId = searchParams.get('ownerId') || '';
    const ALLOWED_SORT = ['createdAt', 'name', 'views', 'rating'];
    const sortBy = ALLOWED_SORT.includes(searchParams.get('sortBy') || '') ? (searchParams.get('sortBy') as string) : 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
      isSuspended: false,
    };

    // If ownerId is specified, remove isActive/isSuspended filter and filter by owner
    if (ownerId) {
      where.ownerId = ownerId;
      delete where.isActive;
      delete where.isSuspended;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { keywords: { contains: query } },
        { city: { contains: query } },
        { region: { contains: query } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (city) {
      where.city = { contains: city };
    }

    if (region) {
      where.region = { contains: region };
    }

    if (featured) {
      where.coverImage = { not: null };
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          owner: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              reviews: true,
              products: true,
              services: true,
            },
          },
        },
      }),
      db.business.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      businesses,
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
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    );
  }
}

// POST /api/businesses - Create a new business
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
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
      tiktok,
      keywords,
      categoryId,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingSlug = await db.business.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Une entreprise avec un nom similaire existe déjà' },
        { status: 409 }
      );
    }

    const userId = (session.user as any).id;

    const business = await db.business.create({
      data: {
        name,
        slug,
        description,
        logo,
        coverImage,
        address,
        city,
        region,
        country: country || 'Guinée-Bissau',
        phone,
        email,
        website,
        facebook,
        instagram,
        twitter,
        linkedin,
        whatsapp,
        tiktok,
        keywords,
        categoryId,
        ownerId: userId,
      },
      include: {
        category: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entreprise' },
      { status: 500 }
    );
  }
}
