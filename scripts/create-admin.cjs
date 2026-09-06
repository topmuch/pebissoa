// scripts/create-admin.cjs
// Creates the initial admin user for Pebiss if it doesn't exist yet.
// This script runs at container startup.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pebiss.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Administrateur Pebiss';

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        phone: process.env.ADMIN_PHONE || '',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log('   ⚠️  Change the default password after first login!');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user with this email already exists.');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
