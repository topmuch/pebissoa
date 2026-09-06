import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/register - Register a new enterprise account with full business data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      businessName,
      description,
      categoryId,
      address,
      city,
      businessPhone,
      businessEmail,
      website,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      tiktok,
      coverImage,
      country,
    } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Le nom, l\'email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (!businessName) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with ENTERPRISE role
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'ENTERPRISE',
      },
    });

    // Generate business slug
    const slug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create the business linked to the user with all provided fields
    const business = await db.business.create({
      data: {
        name: businessName,
        slug,
        ownerId: user.id,
        isActive: true,
        ...(description && { description }),
        ...(categoryId && { categoryId }),
        ...(address && { address }),
        ...(city && { city }),
        ...(businessPhone && { phone: businessPhone }),
        ...(businessEmail && { email: businessEmail }),
        ...(website && { website }),
        ...(facebook && { facebook }),
        ...(instagram && { instagram }),
        ...(twitter && { twitter }),
        ...(linkedin && { linkedin }),
        ...(whatsapp && { whatsapp }),
        ...(tiktok && { tiktok }),
        ...(coverImage && { coverImage }),
        ...(country && { country }),
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          city: business.city,
          categoryId: business.categoryId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
