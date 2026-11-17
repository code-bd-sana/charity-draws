import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Seed Subscription Plans
  console.log('Seeding Subscription Plans...');
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0.00,
      durationDays: 30,
      maxActiveRaffles: 1,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      durationDays: 30,
      maxActiveRaffles: 5,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99.99,
      durationDays: 30,
      maxActiveRaffles: 999999,
    },
  ];

  const createdPlans: any[] = [];
  for (const plan of plans) {
    let existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name },
    });

    if (!existingPlan) {
      existingPlan = await prisma.subscriptionPlan.create({ data: plan });
      console.log(`✅ Created plan: ${plan.name}`);
    } else {
      console.log(`ℹ️ Plan already exists: ${plan.name}`);
    }
    createdPlans.push(existingPlan);
  }

  // 2. Seed Categories
  console.log('Seeding Categories...');
  const categories = [
    { name: 'Cash Prizes', slug: 'cash-prizes' },
    { name: 'Tech & Gadgets', slug: 'tech-gadgets' },
    { name: 'Luxury Watches', slug: 'luxury-watches' },
    { name: 'Holidays & Travel', slug: 'holidays-travel' },
    { name: 'Gaming & Consoles', slug: 'gaming-consoles' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Gift Cards & Vouchers', slug: 'gift-cards' },
    { name: 'Mystery Boxes & Hampers', slug: 'mystery-boxes' },
  ];

  for (const cat of categories) {
    const existingCat = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (!existingCat) {
      await prisma.category.create({ data: cat });
      console.log(`✅ Created category: ${cat.name}`);
    }
  }

  const salt = await bcrypt.genSalt(10);

  // 3. Seed Admin Accounts
  console.log('Seeding Admin Accounts...');
  const adminPassword = await bcrypt.hash('Admin@charitydraws2026!', salt);
  await prisma.user.upsert({
    where: { email: 'info@charitydraws.co.uk' },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      firstName: 'Charity Draws',
      lastName: 'Admin',
    },
    create: {
      email: 'info@charitydraws.co.uk',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      firstName: 'Charity Draws',
      lastName: 'Admin',
    },
  });
  console.log('✅ Admin Account ready (Email: info@charitydraws.co.uk)');

  const secondaryAdminPassword = await bcrypt.hash('admin@gmail.com', salt);
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash: secondaryAdminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      firstName: 'System',
      lastName: 'Admin',
    },
    create: {
      email: 'admin@gmail.com',
      passwordHash: secondaryAdminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      firstName: 'System',
      lastName: 'Admin',
    },
  });
  console.log('✅ Secondary Admin Account ready (Email: admin@gmail.com)');

  console.log('🚀 Seeding Completed Successfully! Both admin accounts ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
