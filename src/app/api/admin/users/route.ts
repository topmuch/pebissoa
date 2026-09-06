import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - All users (admin only)
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
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              isSuspended: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
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
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a user (admin only)
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
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Le nom, l\'email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ['ADMIN', 'ENTERPRISE'];
    const userRoleValue = validRoles.includes(role) ? role : 'ENTERPRISE';

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRoleValue,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Block/unblock a user (admin only)
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
    const adminId = (session.user as any).id;

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, isBlocked, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'identifiant de l\'utilisateur est requis' },
        { status: 400 }
      );
    }

    // Cannot block yourself
    if (id === adminId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const VALID_ROLES = ['ADMIN', 'ENTERPRISE', 'VISITOR'];
    const user = await db.user.update({
      where: { id },
      data: {
        ...(isBlocked !== undefined && { isBlocked }),
        ...(role && { role: VALID_ROLES.includes(role) ? role : existing.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}
