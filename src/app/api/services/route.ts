import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/services - Add a service
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
    const { name, description, price, businessId } = body;

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

    const service = await db.service.create({
      data: {
        name,
        description,
        price,
        businessId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du service' },
      { status: 500 }
    );
  }
}

// PUT /api/services - Update a service
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
    const { id, name, description, price } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant du service est requis' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
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

    const service = await db.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du service' },
      { status: 500 }
    );
  }
}

// DELETE /api/services - Delete a service
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
        { error: 'L\'identifiant du service est requis' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
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

    await db.service.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Service supprimé' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    );
  }
}
