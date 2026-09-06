/**
 * Seed Pebiss avec les données réelles de production (pebiss.com)
 * - Utilise /home/z/scrape/pebiss-data.json (collecté via les API publiques)
 * - Conserve les IDs de production pour un clone fidèle
 * - Les images référencées (/api/uploads/*) sont déjà dans ./uploads/
 *
 * Usage: bun prisma/seed-production.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const DATA_CANDIDATES = [
  process.env.PEBISS_DATA_FILE,
  join(process.cwd(), 'prisma', 'production-data.json'),
  '/home/z/scrape/pebiss-data.json',
].filter(Boolean) as string[];
const DATA_FILE = DATA_CANDIDATES.find((p) => existsSync(p));
if (!DATA_FILE) {
  console.error('❌ Fichier de données introuvable. Définir PEBISS_DATA_FILE.');
  process.exit(1);
}
const DEFAULT_PASSWORD = 'Pebiss@2024';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pebiss.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

interface RawBusiness {
  id: string; name: string; slug: string; description?: string | null;
  logo?: string | null; coverImage?: string | null; address?: string | null;
  city?: string | null; region?: string | null; country?: string | null;
  phone?: string | null; email?: string | null; website?: string | null;
  facebook?: string | null; instagram?: string | null; twitter?: string | null;
  linkedin?: string | null; whatsapp?: string | null; tiktok?: string | null;
  keywords?: string | null; categoryId?: string | null; ownerId: string;
  isActive: boolean; isSuspended: boolean; views: number;
  createdAt: string; updatedAt: string;
  owner?: { id: string; name: string; avatar?: string | null };
}
interface RawDetail extends RawBusiness {
  photos?: { id: string; url: string; businessId: string }[];
  products?: { id: string; name: string; description?: string | null; price?: string | null; imageUrl?: string | null; businessId: string }[];
  services?: { id: string; name: string; description?: string | null; price?: string | null; businessId: string }[];
  hours?: { id: string; dayOfWeek: number; openTime?: string | null; closeTime?: string | null; isClosed: boolean; businessId: string }[];
  reviews?: { id: string; rating: number; comment?: string | null; businessId: string; userId: string; response?: string | null; createdAt: string; user?: { id: string; name?: string } }[];
}
interface RawAd {
  id: string; title: string; description?: string | null; image?: string | null;
  type?: string; categoryId?: string | null; businessId?: string | null; link?: string | null;
  position?: string; format?: string; isActive?: boolean;
  startDate?: string | null; endDate?: string | null; createdAt?: string; updatedAt?: string;
}
interface RawCategory {
  id: string; name: string; slug: string; icon?: string | null; description?: string | null;
}

async function main() {
  const raw = JSON.parse(readFileSync(DATA_FILE, 'utf-8')) as {
    categories: RawCategory[];
    businesses: RawBusiness[];
    details: Record<string, RawDetail>;
    ads: RawAd[];
    banners: RawAd[];
  };

  console.log('📦 Purge des tables existantes...');
  await prisma.review.deleteMany();
  await prisma.businessHour.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.businessPhoto.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.business.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteConfig.deleteMany();

  console.log('⚙️  Configuration du site...');
  await prisma.siteConfig.create({
    data: {
      siteName: 'Pebiss',
      logo: '/pebiss-logo-rgba.png',
      defaultLang: 'fr',
      maintenanceMode: false,
      email: 'contact@pebiss.com',
    },
  });

  console.log('👑 Utilisateur admin...');
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      id: 'admin-pebiss-local',
      email: ADMIN_EMAIL,
      password: adminHash,
      name: 'Administrateur Pebiss',
      role: 'ADMIN',
    },
  });

  console.log('📂 Catégories...');
  for (const c of raw.categories) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? null,
        description: c.description || null,
        createdAt: new Date(c.createdAt || Date.now()),
        updatedAt: new Date(c.updatedAt || Date.now()),
      },
    });
  }
  console.log(`   ${raw.categories.length} catégories créées`);

  console.log('🏢 Entreprises + propriétaires...');
  const usedEmails = new Set<string>([ADMIN_EMAIL.toLowerCase()]);
  let ownerCount = 0;
  let bizCount = 0;

  const allBusinesses: RawBusiness[] = [];
  for (const b of raw.businesses) {
    if (!allBusinesses.find((x) => x.id === b.id)) allBusinesses.push(b);
  }
  for (const d of Object.values(raw.details)) {
    if (!allBusinesses.find((x) => x.id === d.id)) allBusinesses.push(d);
  }

  for (const b of allBusinesses) {
    // Créer le propriétaire (email unique)
    let ownerEmail = (b.email || '').trim().toLowerCase();
    if (!ownerEmail || !ownerEmail.includes('@') || usedEmails.has(ownerEmail)) {
      ownerEmail = `owner-${b.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@pebiss.local`;
    }
    while (usedEmails.has(ownerEmail)) {
      ownerEmail = ownerEmail.replace(/@/, `+${Math.floor(Math.random() * 9999)}@`);
    }
    usedEmails.add(ownerEmail);

    const userHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await prisma.user.create({
      data: {
        id: b.ownerId,
        email: ownerEmail,
        password: userHash,
        name: b.owner?.name || b.name,
        role: 'ENTERPRISE',
        avatar: b.owner?.avatar || null,
      },
    });
    ownerCount++;

    // Éviter les doublons d'entreprises (par slug)
    const exists = await prisma.business.findUnique({ where: { slug: b.slug } });
    if (exists) continue;

    await prisma.business.create({
      data: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description || null,
        logo: b.logo || null,
        coverImage: b.coverImage || null,
        address: b.address || null,
        city: b.city || null,
        region: b.region || null,
        country: b.country || 'Guinée-Bissau',
        phone: b.phone || null,
        email: b.email || null,
        website: b.website || null,
        facebook: b.facebook || null,
        instagram: b.instagram || null,
        twitter: b.twitter || null,
        linkedin: b.linkedin || null,
        whatsapp: b.whatsapp || null,
        tiktok: b.tiktok || null,
        keywords: b.keywords || null,
        categoryId: b.categoryId || null,
        ownerId: b.ownerId,
        isActive: b.isActive ?? true,
        isSuspended: b.isSuspended ?? false,
        views: b.views ?? 0,
        createdAt: new Date(b.createdAt || Date.now()),
        updatedAt: new Date(b.updatedAt || Date.now()),
      },
    });
    bizCount++;
  }
  console.log(`   ${ownerCount} propriétaires, ${bizCount} entreprises créées`);

  console.log('📷 Photos, produits, services, horaires, avis...');
  let photoCount = 0, productCount = 0, serviceCount = 0, hourCount = 0, reviewCount = 0;
  const reviewUsers = new Map<string, string>(); // userId -> name

  for (const [slug, d] of Object.entries(raw.details)) {
    const business = await prisma.business.findUnique({ where: { slug } });
    if (!business) continue;

    for (const p of d.photos || []) {
      if (await prisma.businessPhoto.findUnique({ where: { id: p.id } })) continue;
      await prisma.businessPhoto.create({
        data: { id: p.id, url: p.url, businessId: business.id },
      });
      photoCount++;
    }
    for (const p of d.products || []) {
      if (await prisma.product.findUnique({ where: { id: p.id } })) continue;
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description || null,
          price: p.price || null,
          imageUrl: p.imageUrl || null,
          businessId: business.id,
        },
      });
      productCount++;
    }
    for (const s of d.services || []) {
      if (await prisma.service.findUnique({ where: { id: s.id } })) continue;
      await prisma.service.create({
        data: {
          id: s.id,
          name: s.name,
          description: s.description || null,
          price: s.price || null,
          businessId: business.id,
        },
      });
      serviceCount++;
    }
    for (const h of d.hours || []) {
      await prisma.businessHour.create({
        data: {
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime || null,
          closeTime: h.closeTime || null,
          isClosed: h.isClosed ?? false,
          businessId: business.id,
        },
      });
      hourCount++;
    }
    for (const r of d.reviews || []) {
      if (await prisma.review.findUnique({ where: { id: r.id } })) continue;
      // Créer l'utilisateur visiteur si besoin
      if (!reviewUsers.has(r.userId)) {
        const name = r.user?.name || `Visiteur ${r.userId.slice(-4)}`;
        reviewUsers.set(r.userId, name);
        const vHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        await prisma.user.create({
          data: {
            id: r.userId,
            email: `visiteur-${r.userId.slice(-8).toLowerCase()}@pebiss.local`,
            password: vHash,
            name,
            role: 'VISITOR',
          },
        }).catch(() => null);
      }
      await prisma.review.create({
        data: {
          id: r.id,
          rating: r.rating,
          comment: r.comment || null,
          businessId: business.id,
          userId: r.userId,
          response: r.response || null,
          createdAt: new Date(r.createdAt || Date.now()),
        },
      }).catch(() => null);
      reviewCount++;
    }
  }
  console.log(`   ${photoCount} photos, ${productCount} produits, ${serviceCount} services, ${hourCount} horaires, ${reviewCount} avis`);

  console.log('📢 Publicités (fusion ads + banners)...');
  const seenAds = new Set<string>();
  let adCount = 0;
  for (const a of [...raw.ads, ...raw.banners]) {
    if (!a || !a.id || seenAds.has(a.id)) continue;
    seenAds.add(a.id);
    const businessExists = a.businessId
      ? await prisma.business.findUnique({ where: { id: a.businessId } })
      : null;
    const categoryExists = a.categoryId
      ? await prisma.category.findUnique({ where: { id: a.categoryId } })
      : null;
    await prisma.ad.create({
      data: {
        id: a.id,
        title: a.title,
        description: a.description || null,
        image: a.image || null,
        type: a.type || 'SERVICE',
        categoryId: categoryExists ? a.categoryId : null,
        businessId: businessExists ? a.businessId : null,
        link: a.link || null,
        position: a.position || 'home',
        format: a.format || '336x280',
        isActive: a.isActive ?? true,
        startDate: a.startDate ? new Date(a.startDate) : null,
        endDate: a.endDate ? new Date(a.endDate) : null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
      },
    }).catch((e) => console.log(`   ! pub "${a.title}": ${e.message.slice(0, 80)}`));
    adCount++;
  }
  console.log(`   ${adCount} publicités créées`);

  console.log('✅ SEED TERMINÉ');
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    businesses: await prisma.business.count(),
    photos: await prisma.businessPhoto.count(),
    products: await prisma.product.count(),
    ads: await prisma.ad.count(),
    reviews: await prisma.review.count(),
  };
  console.log('📊 Résumé:', JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
