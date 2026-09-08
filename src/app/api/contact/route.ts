import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/contact — soumission publique du formulaire de contact
// (type « contact » par défaut ; « password_reset » pour les demandes
//  de réinitialisation de mot de passe depuis la page de connexion).
// Tous les messages arrivent dans l'onglet « Messages » du dashboard.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const type = body.type === 'password_reset' ? 'password_reset' : 'contact';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    // Validations de base
    if (name.length < 2) {
      return NextResponse.json({ error: 'Le nom est requis (2 caractères minimum).' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json({ error: 'Le message est trop court.' }, { status: 400 });
    }

    const created = await db.contactMessage.create({
      data: {
        type,
        name: name.slice(0, 120),
        email: email.slice(0, 180),
        phone: phone ? phone.slice(0, 40) : null,
        subject: subject ? subject.slice(0, 180) : null,
        message: message.slice(0, 5000),
      },
    });

    return NextResponse.json(
      { success: true, id: created.id, message: 'Message envoyé avec succès.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/contact error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
