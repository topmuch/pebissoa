import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pebiss.gw' },
    update: {},
    create: {
      email: 'admin@pebiss.gw',
      password: adminPassword,
      name: 'Administrateur Pebiss',
      role: 'ADMIN',
    },
  });

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

  // Create sample enterprises (Guinée-Bissau)
  const enterprises = [
    {
      name: 'Bissau Digital Solutions',
      slug: 'bissau-digital-solutions',
      description: 'Votre partenaire technologique de confiance en Guinée-Bissau. Solutions numériques innovantes pour les entreprises.',
      address: 'Avenida 14 de Novembro, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 955 00 73 71', email: 'contact@bissaudigital.gw',
      website: 'https://bissaudigital.gw', facebook: 'bissaudigital',
      keywords: 'technologie, informatique, développement web',
      categoryId: 'technologie-informatique',
    },
    {
      name: 'Saveurs de Bissau',
      slug: 'saveurs-de-bissau',
      description: 'Restaurant gastronomique proposant les meilleurs plats de la cuisine bissau-guinéenne traditionnelle. Caldo, Jollof, Mancarra.',
      address: 'Rua do Mercado, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 966 36 49 44', email: 'info@saveursdebissau.gw',
      website: 'https://saveursdebissau.gw',
      keywords: 'restaurant, cuisine, bissau-guinéenne, caldo',
      categoryId: 'restaurants-alimentation',
    },
    {
      name: 'Clinique Médicale Horizon',
      slug: 'clinique-medicale-horizon',
      description: 'Centre de soins modernes équipé des dernières technologies médicales à Bissau.',
      address: 'Avenida Domingos Ramos, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 977 22 11 33', email: 'contact@cliniquehorizon.gw',
      keywords: 'santé, clinique, médecin, consultation',
      categoryId: 'sante-bien-etre',
    },
    {
      name: 'GB Immobilier Premium',
      slug: 'gb-immobilier-premium',
      description: 'Agence immobilière spécialisée dans la vente, la location et la gestion de biens immobiliers en Guinée-Bissau.',
      address: 'Rua Kanu, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 988 44 55 66', email: 'info@gbimmobilier.gw',
      website: 'https://gbimmobilier.gw',
      keywords: 'immobilier, location, vente, maison',
      categoryId: 'immobilier',
    },
    {
      name: 'TransExpress Logistique',
      slug: 'transexpress-logistique',
      description: 'Solutions de transport et logistique complètes en Guinée-Bissau.',
      address: 'Porto de Bissau, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 955 77 88 99', email: 'contact@transexpress.gw',
      keywords: 'transport, logistique, livraison, fret',
      categoryId: 'transport-logistique',
    },
    {
      name: 'Académie Excellence',
      slug: 'academie-excellence',
      description: "Centre de formation et d'éducation à Bafatá.",
      address: 'Bafatá, Guinée-Bissau',
      city: 'Bafatá', region: 'Bafatá', country: 'Guinée-Bissau',
      phone: '+245 966 11 22 33', email: 'info@academieexcellence.gw',
      keywords: 'éducation, formation, cours, soutien',
      categoryId: 'education-formation',
    },
    {
      name: 'Afrika Fashion House',
      slug: 'afrika-fashion-house',
      description: 'Maison de mode africaine proposant des créations uniques à Bissau.',
      address: 'Avenida Militar, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 977 55 66 77', email: 'contact@afrikafashion.gw',
      website: 'https://afrikafashion.gw', instagram: 'afrikafashion',
      keywords: 'mode, textile, vêtements, african, fashion',
      categoryId: 'mode-textile',
    },
    {
      name: 'Banque Solidarité Finance',
      slug: 'banque-solidarite-finance',
      description: 'Institution financière offrant microfinance, épargne et crédit en Guinée-Bissau.',
      address: 'Avenida Amílcar Cabral, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 988 88 99 00', email: 'contact@solidaritefinance.gw',
      keywords: 'finance, banque, crédit, microfinance',
      categoryId: 'services-financiers',
    },
    {
      name: 'GB Tour Expérience',
      slug: 'gb-tour-experience',
      description: 'Agence de voyage pour découvrir la Guinée-Bissau et les îles Bijagós.',
      address: 'Porto de Bissau, Bissau',
      city: 'Bissau', region: 'Bissau', country: 'Guinée-Bissau',
      phone: '+245 955 33 44 55', email: 'info@gbtour.gw',
      website: 'https://gbtour.gw',
      keywords: 'tourisme, voyage, excursion, bijagós',
      categoryId: 'tourisme-hotellerie',
    },
    {
      name: 'BTP Guinée-Bissau Construction',
      slug: 'btp-guinee-bissau-construction',
      description: 'Construction et travaux publics en Guinée-Bissau.',
      address: 'Gabú, Guinée-Bissau',
      city: 'Gabú', region: 'Gabú', country: 'Guinée-Bissau',
      phone: '+245 966 77 88 00', email: 'contact@btpgb.gw',
      keywords: 'btp, construction, travaux, infrastructure',
      categoryId: 'btp-construction',
    },
  ];

  for (const ent of enterprises) {
    const category = await prisma.category.findUnique({ where: { slug: ent.categoryId } });
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
        ...ent,
        categoryId: category.id,
        ownerId: user.id,
      },
    });
  }

  // Create business hours, reviews, ads
  const businesses = await prisma.business.findMany();
  for (const business of businesses) {
    for (let day = 0; day <= 6; day++) {
      await prisma.businessHour.create({
        data: { dayOfWeek: day, openTime: '08:00', closeTime: '18:00', isClosed: day === 0, businessId: business.id },
      });
    }
    for (let i = 0; i < 3; i++) {
      const comments = ['Excellent service !', 'Très professionnel.', 'Une équipe compétente.'];
      await prisma.review.create({
        data: { rating: [5, 4, 5][i], comment: comments[i], businessId: business.id, userId: admin.id },
      });
    }
    await prisma.ad.create({
      data: {
        title: `Promotion - ${business.name}`,
        description: `Découvrez nos offres !`,
        type: 'PROMOTION', businessId: business.id, categoryId: business.categoryId,
      },
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
