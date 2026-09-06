// scripts/init-production.cjs
// Exécuté au démarrage du conteneur PebissOa :
// 1. Crée l'utilisateur admin (env: ADMIN_EMAIL / ADMIN_PASSWORD)
// 2. Injecte les données de PRODUCTION (prisma/production-data.json)
//    si la base est vide : catégories, entreprises, photos, produits,
//    services, horaires, avis et publicités (IDs d'origine conservés).
//    Les images correspondantes sont déjà dans UPLOADS_DIR (copiées
//    depuis /app/.bundled-uploads par copy-bundled-uploads.cjs).

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DEFAULT_PASSWORD = 'Pebiss@2024';

async function main() {
  const prisma = new PrismaClient();
  console.log('🚀 Initialisation PebissOa...');

  try {
    // =============================================
    // 0. Données de production
    // =============================================
    const dataFile = path.join(__dirname, '..', 'prisma', 'production-data.json');
    if (!fs.existsSync(dataFile)) {
      console.log('⚠️  production-data.json introuvable, initialisation standard seule.');
      return;
    }
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const {
      categories = [], businesses = [], details = {}, ads = [], banners = [],
    } = raw;

    // =============================================
    // 1. Admin
    // =============================================
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pebiss.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Administrateur Pebiss';
    const adminHash = await bcrypt.hash(adminPassword, 12);

    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      console.log('  ✅ Admin existe déjà:', existingAdmin.email);
    } else {
      await prisma.user.create({
        data: {
          id: 'admin-pebiss-local',
          email: adminEmail,
          password: adminHash,
          name: adminName,
          role: 'ADMIN',
        },
      });
      console.log('  ✅ Admin créé:', adminEmail);
    }

    // =============================================
    // 2. Déjà initialisée ? (idempotent)
    // =============================================
    const businessCount = await prisma.business.count();
    if (businessCount > 0) {
      console.log(`  ✅ Base déjà initialisée (${businessCount} entreprises), seed ignoré.`);
      return;
    }

    // =============================================
    // 3. Configuration du site
    // =============================================
    await prisma.siteConfig.create({
      data: {
        siteName: 'Pebiss',
        logo: '/pebiss-logo-rgba.png',
        defaultLang: 'fr',
        maintenanceMode: false,
        email: 'contact@pebiss.com',
      },
    });
    console.log('  ✅ SiteConfig créée (maintenance désactivée)');

    // =============================================
    // 4. Catégories
    // =============================================
    for (const c of categories) {
      await prisma.category.create({
        data: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon ?? null,
          description: c.description || null,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        },
      }).catch((e) => console.log(`  ! catégorie ${c.slug}: ${e.message.slice(0, 60)}`));
    }
    console.log(`  ✅ ${categories.length} catégories créées`);

    // =============================================
    // 5. Entreprises + propriétaires
    // =============================================
    const all = new Map();
    for (const b of businesses) all.set(b.id, b);
    for (const d of Object.values(details)) if (!all.has(d.id)) all.set(d.id, d);

    const usedEmails = new Set([adminEmail.toLowerCase()]);
    let bizCount = 0;
    for (const b of all.values()) {
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
          name: (b.owner && b.owner.name) || b.name,
          role: 'ENTERPRISE',
          avatar: (b.owner && b.owner.avatar) || null,
        },
      }).catch(() => {});

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
          isActive: b.isActive !== false,
          isSuspended: !!b.isSuspended,
          views: b.views || 0,
          createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
          updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
        },
      }).catch((e) => console.log(`  ! entreprise ${b.slug}: ${e.message.slice(0, 60)}`));
      bizCount++;
    }
    console.log(`  ✅ ${bizCount} entreprises créées (+ propriétaires)`);

    // =============================================
    // 6. Photos / produits / services / horaires / avis
    // =============================================
    let photoCount = 0, productCount = 0, serviceCount = 0, hourCount = 0, reviewCount = 0;
    for (const [slug, d] of Object.entries(details)) {
      const business = await prisma.business.findUnique({ where: { slug } });
      if (!business) continue;

      for (const p of d.photos || []) {
        await prisma.businessPhoto.create({
          data: { id: p.id, url: p.url, businessId: business.id },
        }).catch(() => {});
        photoCount++;
      }
      for (const p of d.products || []) {
        await prisma.product.create({
          data: {
            id: p.id, name: p.name,
            description: p.description || null, price: p.price || null,
            imageUrl: p.imageUrl || null, businessId: business.id,
          },
        }).catch(() => {});
        productCount++;
      }
      for (const s of d.services || []) {
        await prisma.service.create({
          data: {
            id: s.id, name: s.name,
            description: s.description || null, price: s.price || null,
            businessId: business.id,
          },
        }).catch(() => {});
        serviceCount++;
      }
      for (const h of d.hours || []) {
        await prisma.businessHour.create({
          data: {
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || null,
            closeTime: h.closeTime || null,
            isClosed: h.isClosed !== false,
            businessId: business.id,
          },
        }).catch(() => {});
        hourCount++;
      }
      for (const r of d.reviews || []) {
        const reviewHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        await prisma.user.create({
          data: {
            id: r.userId,
            email: `visiteur-${String(r.userId).slice(-8).toLowerCase()}@pebiss.local`,
            password: reviewHash,
            name: (r.user && r.user.name) || `Visiteur ${String(r.userId).slice(-4)}`,
            role: 'VISITOR',
          },
        }).catch(() => {});
        await prisma.review.create({
          data: {
            id: r.id, rating: r.rating, comment: r.comment || null,
            businessId: business.id, userId: r.userId,
            response: r.response || null,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          },
        }).catch(() => {});
        reviewCount++;
      }
    }
    console.log(`  ✅ ${photoCount} photos, ${productCount} produits, ${serviceCount} services, ${hourCount} horaires, ${reviewCount} avis`);

    // =============================================
    // 7. Publicités (ads + banners, dédoublonnées)
    // =============================================
    const seen = new Set();
    let adCount = 0;
    for (const a of [...ads, ...banners]) {
      if (!a || !a.id || seen.has(a.id)) continue;
      seen.add(a.id);
      const bizOk = a.businessId
        ? await prisma.business.findUnique({ where: { id: a.businessId } })
        : null;
      const catOk = a.categoryId
        ? await prisma.category.findUnique({ where: { id: a.categoryId } })
        : null;
      await prisma.ad.create({
        data: {
          id: a.id,
          title: a.title,
          description: a.description || null,
          image: a.image || null,
          type: a.type || 'SERVICE',
          categoryId: catOk ? a.categoryId : null,
          businessId: bizOk ? a.businessId : null,
          link: a.link || null,
          position: a.position || 'home',
          format: a.format || '336x280',
          isActive: a.isActive !== false,
          startDate: a.startDate ? new Date(a.startDate) : null,
          endDate: a.endDate ? new Date(a.endDate) : null,
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
          updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
        },
      }).catch((e) => console.log(`  ! pub "${a.title}": ${e.message.slice(0, 60)}`));
      adCount++;
    }
    console.log(`  ✅ ${adCount} publicités créées`);

    console.log('🎉 Initialisation PebissOa terminée !');
  } catch (error) {
    console.error('❌ Erreur init-production:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
