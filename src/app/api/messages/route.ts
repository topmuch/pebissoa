import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET    /api/messages — liste des messages du formulaire de contact
//               (onglet « Messages » du dashboard ; auth requise).
// PATCH  /api/messages — marquer lu / non lu { id, isRead? }
// DELETE /api/messages?id=… — supprimer un message

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Authentification requise' }, { status: 401 }) };
  }
  return { session };
}

// GET — liste + compteur de non-lus
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') === 'unread' ? 'unread' : 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const skip = (page - 1) * limit;

    const where = filter === 'unread' ? { isRead: false } : {};

    const [messages, total, unreadCount] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.contactMessage.count({ where }),
      db.contactMessage.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({ messages, total, unreadCount, page, limit });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH — marquer lu / non lu
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // isRead optionnel : par défaut, marque comme lu
    const isRead = typeof body.isRead === 'boolean' ? body.isRead : true;

    const updated = await db.contactMessage.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error('PATCH /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE — supprimer un message
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await db.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
