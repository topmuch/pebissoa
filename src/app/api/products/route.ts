import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/products - Add a product
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
    const userRole = (session.user as any).role;

    const body = await request.json();
    const { name, description, price, imageUrl, businessId } = body;

    if (!name || !businessId) {
      return NextResponse.json(
        { error: 'Le nom et l\'entreprise sont requis' },
        { status: 400 }
      );
    }

    // Check ownership
    if (userRole !== 'ADMIN') {
      const business = await db.business.findUnique({ where: { id: businessId } });
      if (!business || business.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        businessId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}

// PUT /api/products - Update a product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const body = await request.json();
    const { id, name, description, price, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant du produit est requis' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
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

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

// DELETE /api/products - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant du produit est requis' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
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

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}
