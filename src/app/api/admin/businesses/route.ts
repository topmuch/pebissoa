import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/businesses - All businesses with management data (admin only)
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
    const status = searchParams.get('status') || ''; // active, suspended, inactive
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status === 'active') {
      where.isActive = true;
      where.isSuspended = false;
    } else if (status === 'suspended') {
      where.isSuspended = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
        { region: { contains: search } },
        { owner: { name: { contains: search } } },
      ];
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: {
            select: {
              reviews: true,
              products: true,
              services: true,
              ads: true,
              photos: true,
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
    console.error('Error fetching admin businesses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    );
  }
}

// POST /api/admin/businesses - Create a new business (admin only)
// If ownerName/ownerEmail/ownerPassword are provided, creates a new user account
// If not provided, the business is owned by the admin user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('[POST /api/admin/businesses] No session');
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      console.error('[POST /api/admin/businesses] Not admin, role:', userRole);
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error('[POST /api/admin/businesses] Failed to parse JSON body:', parseErr);
      return NextResponse.json(
        { error: 'Corps de la requête invalide (JSON)' },
        { status: 400 }
      );
    }

    const {
      businessName,
      categoryId,
      description,
      address,
      city,
      region,
      country,
      businessPhone,
      businessEmail,
      website,
      logo,
      coverImage,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      tiktok,
      keywords,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = body;



    if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    let ownerId = (session.user as any).id; // Default: admin owns the business

    // If owner info is provided, create a new user account
    if (ownerName && ownerEmail && ownerPassword) {
      if (ownerPassword.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        );
      }

      const existingUser = await db.user.findUnique({ where: { email: ownerEmail } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      const user = await db.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: 'ENTERPRISE',
        },
      });
      ownerId = user.id;
    }

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existingSlug = await db.business.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    // Create business
    const business = await db.business.create({
      data: {
        name: businessName,
        slug: finalSlug,
        categoryId: categoryId || null,
        description: description || null,
        address: address || null,
        city: city || null,
        region: region || null,
        country: country || 'Guinée-Bissau',
        phone: businessPhone || null,
        email: businessEmail || null,
        website: website || null,
        logo: logo || null,
        coverImage: coverImage || null,
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        whatsapp: whatsapp || null,
        tiktok: tiktok || null,
        keywords: keywords || null,
        ownerId,
        isActive: true,
        isSuspended: false,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });


    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/businesses] Error creating business:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entreprise' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/businesses - Suspend/activate a business (admin only)
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, isSuspended, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    const existing = await db.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Cross-validate isActive/isSuspended: can't be both true
    let resolvedActive = isActive;
    let resolvedSuspended = isSuspended;
    if (resolvedActive === true) resolvedSuspended = false;
    if (resolvedSuspended === true) resolvedActive = false;

    const business = await db.business.update({
      where: { id },
      data: {
        ...(resolvedSuspended !== undefined && { isSuspended: resolvedSuspended }),
        ...(resolvedActive !== undefined && { isActive: resolvedActive }),
      },
      include: {
        category: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error updating business status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entreprise' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/businesses - Delete a business (admin only)
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    const existing = await db.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Delete business and all related data (cascading)
    await db.business.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Entreprise supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entreprise' },
      { status: 500 }
    );
  }
}
