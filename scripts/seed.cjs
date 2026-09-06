// scripts/seed.cjs
// Seeds the database with sample data (categories, businesses, reviews, ads)
// Runs at container startup, safe to run multiple times (uses upsert pattern)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check if data already seeded
    const existingCount = await prisma.business.count();
    if (existingCount > 0) {
      console.log('✅ Database already has data, skipping seed.');
      return;
    }

    console.log('🌱 Seeding database with sample data...');

    // Create categories
    const categoriesData = [
      { name: 'Restaurants & Alimentation', slug: 'restaurants-alimentation', icon: 'UtensilsCrossed' },
      { name: 'Technologie & Informatique', slug: 'technologie-informatique', icon: 'Monitor' },
      { name: 'Santé & Bien-être', slug: 'sante-bien-etre', icon: 'Heart' },
      { name: 'Commerce & Distribution', slug: 'commerce-distribution', icon: 'ShoppingBag' },
      { name: 'Transport & Logistique', slug: 'transport-logistique', icon: 'Truck' },
      { name: 'Immobilier', slug: 'immobilier', icon: 'Building2' },
      { name: 'Éducation & Formation', slug: 'education-formation', icon: 'GraduationCap' },
      { name: 'Services Financiers', slug: 'services-financiers', icon: 'Landmark' },
      { name: 'Tourisme & Hôtellerie', slug: 'tourisme-hotellerie', icon: 'Plane' },
      { name: 'BTP & Construction', slug: 'btp-construction', icon: 'HardHat' },
      { name: 'Agriculture & Agroalimentaire', slug: 'agriculture-agroalimentaire', icon: 'Wheat' },
      { name: 'Mode & Textile', slug: 'mode-textile', icon: 'Shirt' },
      { name: 'Arts & Culture', slug: 'arts-culture', icon: 'Palette' },
      { name: 'Énergie & Environnement', slug: 'energie-environnement', icon: 'Zap' },
      { name: 'Conseil & Services', slug: 'conseil-services', icon: 'Briefcase' },
      { name: 'Sport & Loisirs', slug: 'sport-loisirs', icon: 'Dumbbell' },
    ];

    for (const cat of categoriesData) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }
    console.log(`  ✅ ${categoriesData.length} categories created`);

    // Create sample enterprises
    const enterprises = [
      {
        name: 'Bissau Digital Solutions',
        slug: 'bissau-digital-solutions',
        description: 'Votre partenaire technologique de confiance en Guinée-Bissau. Nous offrons des solutions numériques innovantes pour les entreprises, incluant le développement web, les applications mobiles et le consulting IT.',
        address: 'Avenida 14 de Novembro, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 955 00 73 71',
        email: 'contact@bissaudigital.gw',
        website: 'https://bissaudigital.gw',
        facebook: 'bissaudigital',
        instagram: 'bissau_digital',
        keywords: 'technologie, informatique, développement web',
        categorySlug: 'technologie-informatique',
      },
      {
        name: 'Saveurs de Bissau',
        slug: 'saveurs-de-bissau',
        description: 'Restaurant gastronomique proposant les meilleurs plats de la cuisine bissau-guinéenne traditionnelle. Caldo, Jollof, Mancarra et bien plus dans un cadre élégant au cœur de Bissau.',
        address: 'Rua do Mercado, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 966 36 49 44',
        email: 'info@saveursdebissau.gw',
        website: 'https://saveursdebissau.gw',
        keywords: 'restaurant, cuisine, bissau-guinéenne, caldo',
        categorySlug: 'restaurants-alimentation',
      },
      {
        name: 'Clinique Médicale Horizon',
        slug: 'clinique-medicale-horizon',
        description: 'Centre de soins modernes équipé des dernières technologies médicales. Notre équipe de médecins qualifiés offre des consultations, examens et soins de qualité à Bissau.',
        address: 'Avenida Domingos Ramos, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 977 22 11 33',
        email: 'contact@cliniquehorizon.gw',
        keywords: 'santé, clinique, médecin, consultation',
        categorySlug: 'sante-bien-etre',
      },
      {
        name: 'Guinée-Bissau Immobilier Premium',
        slug: 'guinee-bissau-immobilier-premium',
        description: 'Agence immobilière spécialisée dans la vente, la location et la gestion de biens immobiliers en Guinée-Bissau. Appartements, villas, bureaux et terrains.',
        address: 'Rua Kanu, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 988 44 55 66',
        email: 'info@gbimmobilier.gw',
        website: 'https://gbimmobilier.gw',
        keywords: 'immobilier, location, vente, maison, appartement',
        categorySlug: 'immobilier',
      },
      {
        name: 'TransExpress Logistique',
        slug: 'transexpress-logistique',
        description: 'Solutions de transport et logistique complètes pour les entreprises et particuliers. Livraison express, fret national et international, déménagement.',
        address: 'Porto de Bissau, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 955 77 88 99',
        email: 'contact@transexpress.gw',
        keywords: 'transport, logistique, livraison, fret',
        categorySlug: 'transport-logistique',
      },
      {
        name: 'Académie Excellence',
        slug: 'academie-excellence',
        description: "Centre de formation et d'éducation offrant des cours de soutien scolaire, des formations professionnelles et des ateliers de développement des compétences.",
        address: 'Bafatá, Guinée-Bissau',
        city: 'Bafatá',
        region: 'Bafatá',
        country: 'Guinée-Bissau',
        phone: '+245 966 11 22 33',
        email: 'info@academieexcellence.gw',
        keywords: 'éducation, formation, cours, soutien',
        categorySlug: 'education-formation',
      },
      {
        name: 'Afrika Fashion House',
        slug: 'afrika-fashion-house',
        description: 'Maison de mode africaine proposant des créations uniques alliant tradition et modernité. Prêt-à-porter, sur mesure et accessoires pour hommes et femmes.',
        address: 'Avenida Militar, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 977 55 66 77',
        email: 'contact@afrikafashion.gw',
        website: 'https://afrikafashion.gw',
        instagram: 'afrikafashion',
        keywords: 'mode, textile, vêtements, african, fashion',
        categorySlug: 'mode-textile',
      },
      {
        name: 'Banque Solidarité Finance',
        slug: 'banque-solidarite-finance',
        description: 'Institution financière offrant des services de microfinance, épargne, crédit et assurance pour les entrepreneurs et petites entreprises en Guinée-Bissau.',
        address: 'Avenida Amílcar Cabral, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 988 88 99 00',
        email: 'contact@solidaritefinance.gw',
        keywords: 'finance, banque, crédit, microfinance',
        categorySlug: 'services-financiers',
      },
      {
        name: 'Guinée-Bissau Tour Expérience',
        slug: 'guinee-bissau-tour-experience',
        description: 'Agence de voyage et de tourisme proposant des circuits touristiques, des séjours et des excursions pour découvrir les merveilles de la Guinée-Bissau et les îles Bijagós.',
        address: 'Porto de Bissau, Bissau',
        city: 'Bissau',
        region: 'Bissau',
        country: 'Guinée-Bissau',
        phone: '+245 955 33 44 55',
        email: 'info@gbtour.gw',
        website: 'https://gbtour.gw',
        keywords: 'tourisme, voyage, excursion, circuit, bijagós',
        categorySlug: 'tourisme-hotellerie',
      },
      {
        name: 'BTP Guinée-Bissau Construction',
        slug: 'btp-guinee-bissau-construction',
        description: 'Entreprise de construction et de travaux publics spécialisée dans le bâtiment, les routes, les ponts et les infrastructures en Guinée-Bissau.',
        address: 'Gabú, Guinée-Bissau',
        city: 'Gabú',
        region: 'Gabú',
        country: 'Guinée-Bissau',
        phone: '+245 966 77 88 00',
        email: 'contact@btpgb.gw',
        keywords: 'btp, construction, travaux, infrastructure',
        categorySlug: 'btp-construction',
      },
    ];

    for (const ent of enterprises) {
      const category = await prisma.category.findUnique({ where: { slug: ent.categorySlug } });
      if (!category) continue;

      const enterprisePassword = await bcrypt.hash('ent123', 10);
      const user = await prisma.user.upsert({
        where: { email: `${ent.slug}@pebiss.gw` },
        update: {},
        create: {
          email: `${ent.slug}@pebiss.gw`,
          password: enterprisePassword,
          name: ent.name,
          role: 'ENTERPRISE',
          phone: ent.phone,
        },
      });

      await prisma.business.upsert({
        where: { slug: ent.slug },
        update: {},
        create: {
          name: ent.name,
          slug: ent.slug,
          description: ent.description,
          address: ent.address,
          city: ent.city,
          region: ent.region,
          country: ent.country,
          phone: ent.phone,
          email: ent.email,
          website: ent.website || '',
          facebook: ent.facebook || '',
          instagram: ent.instagram || '',
          keywords: ent.keywords,
          categoryId: category.id,
          ownerId: user.id,
        },
      });
    }
    console.log(`  ✅ ${enterprises.length} enterprises created`);

    // Create business hours for each business
    const businesses = await prisma.business.findMany();
    for (const business of businesses) {
      for (let day = 0; day <= 6; day++) {
        await prisma.businessHour.create({
          data: {
            dayOfWeek: day,
            openTime: '08:00',
            closeTime: '18:00',
            isClosed: day === 0,
            businessId: business.id,
          },
        });
      }
    }
    console.log(`  ✅ Business hours created`);

    // Create sample reviews
    const sampleReviews = [
      { rating: 5, comment: 'Excellent service, je recommande vivement !' },
      { rating: 4, comment: 'Très professionnel et ponctuel.' },
      { rating: 5, comment: "Une équipe compétente et à l'écoute." },
      { rating: 4, comment: 'Bonne qualité de service, rapport qualité-prix correct.' },
      { rating: 3, comment: 'Service acceptable mais peut mieux faire.' },
    ];

    // Get admin user for reviews
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    for (const business of businesses) {
      for (let i = 0; i < 3; i++) {
        await prisma.review.create({
          data: {
            rating: sampleReviews[i].rating,
            comment: sampleReviews[i].comment,
            businessId: business.id,
            userId: admin ? admin.id : business.ownerId,
          },
        });
      }
    }
    console.log(`  ✅ Reviews created`);

    // Create sample ads
    for (const business of businesses) {
      await prisma.ad.create({
        data: {
          title: `Promotion spéciale - ${business.name}`,
          description: `Découvrez nos offres exceptionnelles ! ${business.description?.substring(0, 100)}...`,
          type: 'PROMOTION',
          businessId: business.id,
          categoryId: business.categoryId,
        },
      });
    }
    console.log(`  ✅ Ads created`);

    console.log('');
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
