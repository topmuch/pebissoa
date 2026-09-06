import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/settings - Full config with SMTP fields (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    let config = await db.siteConfig.findFirst();

    if (!config) {
      config = await db.siteConfig.create({
        data: {
          siteName: 'Pebiss',
          defaultLang: 'pt',
        },
      });
    }

    // Hide sensitive SMTP password from the response
    const { smtpPassword, ...safeConfig } = config;
    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}
