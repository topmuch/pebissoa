import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, email, phone, avatar } = body;

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    // If email is being changed, check uniqueness
    if (email !== undefined && email !== session.user.email) {
      const existing = await db.user.findFirst({ where: { email, NOT: { id: userId } } });
      if (existing) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
      }
      updateData.email = email;
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
  }
}
