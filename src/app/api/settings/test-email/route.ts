import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

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
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Veuillez entrer une adresse email valide' },
        { status: 400 }
      );
    }

    // Get SMTP config from database
    const config = await db.siteConfig.findFirst();
    if (!config?.smtpHost || !config?.smtpUser || !config?.smtpPassword) {
      return NextResponse.json(
        { error: 'Configuration SMTP incomplète. Veuillez remplir l\'hôte, l\'utilisateur et le mot de passe.' },
        { status: 400 }
      );
    }

    const port = parseInt(config.smtpPort || '587', 10);

    // Build transport options
    const transportOptions: nodemailer.TransportOptions = {
      host: config.smtpHost,
      port,
      secure: config.smtpEncryption === 'ssl' || port === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    };

    // Add TLS option for explicit TLS
    if (config.smtpEncryption === 'tls') {
      (transportOptions as any).tls = {
        rejectUnauthorized: true,
      };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const fromName = config.smtpFromName || config.siteName || 'Pebiss';
    const fromEmail = config.smtpFromEmail || config.smtpUser;
    const siteName = config.siteName || 'Pebiss';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `✅ Email de test - ${siteName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📧 Email de test</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">
              Bonjour,
            </p>
            <p style="font-size: 16px; color: #374151;">
              Cet email confirme que votre configuration SMTP fonctionne correctement sur <strong>${siteName}</strong>.
            </p>
            <div style="background: white; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #374151; font-size: 14px;">
                <strong>Hôte :</strong> ${config.smtpHost}<br>
                <strong>Port :</strong> ${port}<br>
                <strong>Chiffrement :</strong> ${config.smtpEncryption}<br>
                <strong>Expéditeur :</strong> ${fromName} &lt;${fromEmail}&gt;
              </p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              Si vous recevez cet email, votre serveur de messagerie est correctement configuré.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email de test. Vérifiez votre configuration SMTP.' },
      { status: 500 }
    );
  }
}
