import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedReferenceData() {
  // 1. Reference Colleges
  const pcet = await prisma.college.upsert({
    where: { code: 'PCET' },
    update: {
      name: 'Pimpri Chinchwad Education Trust (PCET)',
      domain: 'pcet.org.in',
      city: 'Pune',
      state: 'MH',
    },
    create: {
      name: 'Pimpri Chinchwad Education Trust (PCET)',
      code: 'PCET',
      domain: 'pcet.org.in',
      city: 'Pune',
      state: 'MH',
      latitude: 18.6517,
      longitude: 73.7615,
    },
  });

  await prisma.college.upsert({
    where: { code: 'MIT' },
    update: {},
    create: {
      name: 'Massachusetts Institute of Technology',
      code: 'MIT',
      domain: 'mit.edu',
      city: 'Cambridge',
      state: 'MA',
      latitude: 42.3601,
      longitude: -71.0942,
    },
  });

  await prisma.college.upsert({
    where: { code: 'HARVARD' },
    update: {},
    create: {
      name: 'Harvard University',
      code: 'HARVARD',
      domain: 'harvard.edu',
      city: 'Cambridge',
      state: 'MA',
      latitude: 42.377,
      longitude: -71.1167,
    },
  });

  // 2. Reference Categories
  await prisma.category.upsert({
    where: { slug: 'textbooks' },
    update: {},
    create: {
      name: 'Textbooks & Course Materials',
      slug: 'textbooks',
      description: 'Standard engineering, medical, computer science, and liberal arts textbooks.',
      displayOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'lab-equipment' },
    update: {},
    create: {
      name: 'Lab & Electronics Gear',
      slug: 'lab-equipment',
      description: 'Calculators, dissection kits, development boards, and lab gear.',
      displayOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'notes-study-aids' },
    update: {},
    create: {
      name: 'Study Guides & Notes',
      slug: 'notes-study-aids',
      description: 'Handwritten summaries, exam prep guides, and formula sheets.',
      displayOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'dorm-essentials' },
    update: {},
    create: {
      name: 'Dorm & Living Essentials',
      slug: 'dorm-essentials',
      description: 'Desk lamps, organizers, mini appliances, and room gear.',
      displayOrder: 4,
    },
  });

  // 3. Default Development Admin Account
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@harvard.edu';
  const adminPlainPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

  if (isProduction && !process.env.ADMIN_PASSWORD) {
    console.log('ℹ️  Skipping default admin initialization in production without explicit ADMIN_PASSWORD.');
  } else {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPlainPassword, saltRounds);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isStudentVerified: true,
        collegeId: pcet.id,
        ...(process.env.ADMIN_PASSWORD ? { passwordHash } : {}),
      },
      create: {
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isStudentVerified: true,
        collegeId: pcet.id,
      },
    });

    console.log(`✓ Development admin account ready (${admin.email} / ${admin.role})`);
  }
}

if (process.argv[1] && process.argv[1].includes('seedReference')) {
  seedReferenceData()
    .then(() => {
      console.log('✓ Reference data and development admin account ready.');
    })
    .catch((err) => {
      console.error('Error seeding reference data & admin:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

