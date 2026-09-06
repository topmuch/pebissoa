import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/settings - Get public site config (no SMTP or notification fields)
export async function GET() {
  try {
    let config = await db.siteConfig.findFirst({
      select: {
        id: true,
        siteName: true,
        logo: true,
        favicon: true,
        address: true,
        phone: true,
        email: true,
        seoTitle: true,
        seoDescription: true,
        seoImage: true,
        defaultLang: true,
        facebook: true,
        instagram: true,
        twitter: true,
        linkedin: true,
        whatsapp: true,
        tiktok: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!config) {
      config = await db.siteConfig.create({
        data: {
          siteName: 'Pebiss',
          defaultLang: 'pt',
        },
        select: {
          id: true,
          siteName: true,
          logo: true,
          favicon: true,
          address: true,
          phone: true,
          email: true,
          seoTitle: true,
          seoDescription: true,
          seoImage: true,
          defaultLang: true,
          facebook: true,
          instagram: true,
          twitter: true,
          linkedin: true,
          whatsapp: true,
          tiktok: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update site config (admin only)
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
    const {
      siteName,
      logo,
      favicon,
      address,
      phone,
      email,
      seoTitle,
      seoDescription,
      seoImage,
      defaultLang,
      facebook,
      instagram,
      twitter,
      linkedin,
      whatsapp,
      tiktok,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFromName,
      smtpFromEmail,
      smtpEncryption,
      notifNewAd,
      notifNewReview,
      notifWeeklyReport,
      notifAdApproved,
      notifWelcome,
      maintenanceMode,
      maintenanceMessage,
      maintenanceEndTime,
    } = body;

    let config = await db.siteConfig.findFirst();

    if (!config) {
      config = await db.siteConfig.create({
        data: {
          siteName: siteName || 'Pebiss',
          logo,
          favicon,
          address,
          phone,
          email,
          seoTitle,
          seoDescription,
          seoImage,
          defaultLang: defaultLang || 'pt',
          facebook,
          instagram,
          twitter,
          linkedin,
          whatsapp,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          smtpFromName,
          smtpFromEmail,
          smtpEncryption: smtpEncryption || 'none',
          notifNewAd: notifNewAd ?? true,
          notifNewReview: notifNewReview ?? true,
          notifWeeklyReport: notifWeeklyReport ?? false,
          notifAdApproved: notifAdApproved ?? true,
          notifWelcome: notifWelcome ?? true,
          maintenanceMode: maintenanceMode ?? false,
          maintenanceMessage,
          maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
        },
      });
    } else {
      config = await db.siteConfig.update({
        where: { id: config.id },
        data: {
          ...(siteName !== undefined && { siteName }),
          ...(logo !== undefined && { logo }),
          ...(favicon !== undefined && { favicon }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(seoTitle !== undefined && { seoTitle }),
          ...(seoDescription !== undefined && { seoDescription }),
          ...(seoImage !== undefined && { seoImage }),
          ...(defaultLang !== undefined && { defaultLang }),
          ...(facebook !== undefined && { facebook }),
          ...(instagram !== undefined && { instagram }),
          ...(twitter !== undefined && { twitter }),
          ...(linkedin !== undefined && { linkedin }),
          ...(whatsapp !== undefined && { whatsapp }),
          ...(tiktok !== undefined && { tiktok }),
          ...(smtpHost !== undefined && { smtpHost }),
          ...(smtpPort !== undefined && { smtpPort }),
          ...(smtpUser !== undefined && { smtpUser }),
          ...(smtpPassword !== undefined && { smtpPassword }),
          ...(smtpFromName !== undefined && { smtpFromName }),
          ...(smtpFromEmail !== undefined && { smtpFromEmail }),
          ...(smtpEncryption !== undefined && { smtpEncryption }),
          ...(notifNewAd !== undefined && { notifNewAd }),
          ...(notifNewReview !== undefined && { notifNewReview }),
          ...(notifWeeklyReport !== undefined && { notifWeeklyReport }),
          ...(notifAdApproved !== undefined && { notifAdApproved }),
          ...(notifWelcome !== undefined && { notifWelcome }),
          ...(maintenanceMode !== undefined && { maintenanceMode }),
          ...(maintenanceMessage !== undefined && { maintenanceMessage }),
          ...(maintenanceEndTime !== undefined && {
            maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
          }),
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    );
  }
}
