import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a category (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check uniqueness
    const existing = await db.category.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon,
        description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT /api/categories - Update a category (admin only)
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
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, icon, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Generate new slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const slugExists = await db.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Une catégorie avec un nom similaire existe déjà' },
          { status: 409 }
        );
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        slug,
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
      },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Delete a category (admin only)
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
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { businesses: true } },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Check if category has businesses
    if (existing._count.businesses > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie contenant des entreprises' },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
