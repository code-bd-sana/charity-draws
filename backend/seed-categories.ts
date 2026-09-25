import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding authentic Charity Draws categories...');

  // Old airsoft categories to clean up if they exist
  const oldAirsoftSlugs = [
    'aeg-rifles',
    'gbb-pistols',
    'sniper-rifles',
    'tactical-gear',
    'charity-rifles',
    'pistols',
    'shotguns',
    'optics-sights',
    'gear-and-apparel',
    'tactical-vests',
    'bbs-and-gas',
    'bbs-gas',
  ];

  await prisma.category.deleteMany({
    where: { slug: { in: oldAirsoftSlugs } },
  });

  const categoriesToSeed = [
    {
      name: 'Cash Prizes',
      slug: 'cash-prizes',
      icon: 'Sparkles',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Tech & Gadgets',
      slug: 'tech-gadgets',
      icon: 'Laptop',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Luxury Watches',
      slug: 'luxury-watches',
      icon: 'Watch',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Cars & Vehicles',
      slug: 'cars-vehicles',
      icon: 'Car',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Holidays & Travel',
      slug: 'holidays-travel',
      icon: 'Plane',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Gaming & Consoles',
      slug: 'gaming-consoles',
      icon: 'Gamepad',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      icon: 'Heart',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Gift Cards & Vouchers',
      slug: 'gift-cards',
      icon: 'Gift',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Mystery Boxes & Hampers',
      slug: 'mystery-boxes',
      icon: 'Trophy',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
    },
  ];

  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        icon: cat.icon,
        image: cat.image,
        name: cat.name,
        isActive: cat.isActive,
      },
      create: cat,
    });
    console.log(`Seeded category: ${cat.name}`);
  }

  console.log('Charity Draws categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
