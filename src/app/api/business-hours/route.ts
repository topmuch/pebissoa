import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/business-hours - Update business hours (full replace)
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
    const { businessId, hours } = body;

    if (!businessId || !hours || !Array.isArray(hours)) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'entreprise et les horaires sont requis' },
        { status: 400 }
      );
    }

    // Check if business exists and user owns it
    const business = await db.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    if (business.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Validate hours
    for (const hour of hours) {
      if (typeof hour.dayOfWeek !== 'number' || hour.dayOfWeek < 0 || hour.dayOfWeek > 6) {
        return NextResponse.json(
          { error: 'Le jour de la semaine doit être entre 0 et 6' },
          { status: 400 }
        );
      }

      if (!hour.isClosed && (!hour.openTime || !hour.closeTime)) {
        return NextResponse.json(
          { error: 'Les heures d\'ouverture et de fermeture sont requises pour les jours ouverts' },
          { status: 400 }
        );
      }
    }

    // Delete existing hours and create new ones (transaction)
    await db.$transaction(async (tx) => {
      await tx.businessHour.deleteMany({ where: { businessId } });

      for (const hour of hours) {
        await tx.businessHour.create({
          data: {
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.isClosed ? null : hour.openTime,
            closeTime: hour.isClosed ? null : hour.closeTime,
            isClosed: hour.isClosed || false,
            businessId,
          },
        });
      }
    });

    // Return updated hours
    const updatedHours = await db.businessHour.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(updatedHours);
  } catch (error) {
    console.error('Error updating business hours:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des horaires' },
      { status: 500 }
    );
  }
}
