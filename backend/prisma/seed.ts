import { PrismaClient, UserRole, UserStatus, SellerType, SellerStatus, ConditionGrade, ProductStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting CampusMarket Seed with Reasonable Indian Campus Prices...');

  // Clear existing products to ensure zero duplicates
  await prisma.productReview.deleteMany().catch(() => null);
  await prisma.cartItem.deleteMany().catch(() => null);
  await prisma.orderItem.deleteMany().catch(() => null);
  await prisma.wishlistItem.deleteMany().catch(() => null);
  await prisma.productImage.deleteMany().catch(() => null);
  await prisma.bookDetails.deleteMany().catch(() => null);
  await prisma.product.deleteMany().catch(() => null);

  // 1. Create Colleges
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

  const mit = await prisma.college.upsert({
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

  // 2. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@harvard.edu' },
    update: {},
    create: {
      email: 'admin@harvard.edu',
      passwordHash: hashPassword('AdminSecure2026!'),
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isStudentVerified: true,
      collegeId: harvard.id,
    },
  });

  // 3. Create Student Seller User 1 (Alice)
  const studentSeller1 = await prisma.user.upsert({
    where: { email: 'alice.seller@harvard.edu' },
    update: {},
    create: {
      email: 'alice.seller@harvard.edu',
      passwordHash: hashPassword('StudentPass123!'),
      firstName: 'Alice',
      lastName: 'Smith',
      role: UserRole.STUDENT_SELLER,
      status: UserStatus.ACTIVE,
      isStudentVerified: true,
      collegeId: harvard.id,
      seller: {
        create: {
          sellerType: SellerType.STUDENT,
          storeName: "Alice's Course Gear & Textbooks",
          bio: 'Junior Bio Major selling previous semester chemistry, calculus books & lab tools.',
          status: SellerStatus.VERIFIED,
          rating: 4.90,
          totalSalesCount: 14,
          wallet: { create: { clearedBalance: 1250.50, pendingEscrowBalance: 450.00 } },
        },
      },
    },
    include: { seller: true },
  });

  // 4. Create Student Seller User 2 (Bob)
  const studentSeller2 = await prisma.user.upsert({
    where: { email: 'bob.seller@mit.edu' },
    update: {},
    create: {
      email: 'bob.seller@mit.edu',
      passwordHash: hashPassword('StudentPass123!'),
      firstName: 'Bob',
      lastName: 'Chen',
      role: UserRole.STUDENT_SELLER,
      status: UserStatus.ACTIVE,
      isStudentVerified: true,
      collegeId: mit.id,
      seller: {
        create: {
          sellerType: SellerType.STUDENT,
          storeName: "Bob's MIT Electronics & Instruments",
          bio: 'Senior Electrical Engineering major selling lab tools, calculators & musical gear.',
          status: SellerStatus.VERIFIED,
          rating: 4.95,
          totalSalesCount: 28,
          wallet: { create: { clearedBalance: 4800.00, pendingEscrowBalance: 0.00 } },
        },
      },
    },
    include: { seller: true },
  });

  // 5. Create Commercial Bookstore Seller (Crimson Bookstore)
  const bookstoreSeller = await prisma.user.upsert({
    where: { email: 'contact@crimsonbooks.com' },
    update: {},
    create: {
      email: 'contact@crimsonbooks.com',
      passwordHash: hashPassword('BookstorePass123!'),
      firstName: 'Crimson',
      lastName: 'Bookstore',
      role: UserRole.COMMERCIAL_BOOKSTORE,
      status: UserStatus.ACTIVE,
      isStudentVerified: true,
      collegeId: harvard.id,
      seller: {
        create: {
          sellerType: SellerType.COMMERCIAL_BOOKSTORE,
          storeName: 'Crimson Official Campus Bookstore',
          bio: 'Official campus reseller of refurbished calculators, verified textbooks & stationery.',
          status: SellerStatus.VERIFIED,
          rating: 4.98,
          totalSalesCount: 195,
          businessRegNumber: 'REG-HARV-883912',
          wallet: { create: { clearedBalance: 24500.00, pendingEscrowBalance: 1200.00 } },
        },
      },
    },
    include: { seller: true },
  });

  // 6. Create Categories
  const textbooksCat = await prisma.category.upsert({
    where: { slug: 'textbooks' },
    update: {},
    create: {
      name: 'Textbooks & Study Guides',
      slug: 'textbooks',
      description: 'Course textbooks, solution manuals, and reference guides',
      displayOrder: 1,
    },
  });

  const electronicsCat = await prisma.category.upsert({
    where: { slug: 'calculators-electronics' },
    update: {},
    create: {
      name: 'Calculators & Electronics',
      slug: 'calculators-electronics',
      description: 'Graphing calculators, microcontrollers & lab instruments',
      displayOrder: 2,
    },
  });

  const toolsCat = await prisma.category.upsert({
    where: { slug: 'tools-equipment' },
    update: {},
    create: {
      name: 'Tools & Lab Equipment',
      slug: 'tools-equipment',
      description: 'Laboratory glassware, dissection kits, multimeters & hand tools',
      displayOrder: 3,
    },
  });

  // 7. Seed 8 Unique Products with Reasonable Indian Campus Prices (₹)
  if (studentSeller1.seller) {
    // Product 1: Chemistry Book
    await prisma.product.create({
      data: {
        sellerId: studentSeller1.seller.id,
        collegeId: harvard.id,
        categoryId: textbooksCat.id,
        title: 'Organic Chemistry (8th Edition)',
        description: 'Used for CHEM201 last semester. Minor yellow highlighting in Chapters 1-3. Binding and spine completely intact.',
        conditionGrade: ConditionGrade.GOOD,
        conditionNotes: 'Light edge wear on cover. No missing pages. Access code redeemed.',
        price: 450.00,
        originalMsrp: 1450.00,
        quantity: 1,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        bookDetails: {
          create: {
            isbn13: '9780134093413',
            author: 'Paula Yurkanis Bruice',
            publisher: 'Pearson',
            edition: '8th Edition',
            courseCode: 'CHEM201',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/chemistry_textbook_cover_1786457575258.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });

    // Product 2: Calculus Book
    await prisma.product.create({
      data: {
        sellerId: studentSeller1.seller.id,
        collegeId: harvard.id,
        categoryId: textbooksCat.id,
        title: 'Thomas Calculus: Early Transcendentals (14th Edition)',
        description: 'Required textbook for MATH21A/B. Clean pages with zero markings. Includes hardcover protection sleeve.',
        conditionGrade: ConditionGrade.LIKE_NEW,
        conditionNotes: 'Like brand new condition. Spine tight, crisp pages.',
        price: 680.00,
        originalMsrp: 1800.00,
        quantity: 1,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP',
        bookDetails: {
          create: {
            isbn13: '9780134438986',
            author: 'Joel R. Hass, Christopher E. Heil',
            publisher: 'Pearson',
            edition: '14th Edition',
            courseCode: 'MATH21A',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/calculus_textbook_cover_1786457605950.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });
  }

  if (studentSeller2.seller) {
    // Product 3: Algorithms Book
    await prisma.product.create({
      data: {
        sellerId: studentSeller2.seller.id,
        collegeId: mit.id,
        categoryId: textbooksCat.id,
        title: 'Introduction to Algorithms (CLRS 3rd Edition)',
        description: 'The bible of Computer Science algorithms (6.006 at MIT). Hardcover edition in pristine condition.',
        conditionGrade: ConditionGrade.BRAND_NEW,
        conditionNotes: 'Unopened unused copy.',
        price: 750.00,
        originalMsrp: 1650.00,
        quantity: 1,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        bookDetails: {
          create: {
            isbn13: '9780262033848',
            author: 'Cormen, Leiserson, Rivest, Stein',
            publisher: 'MIT Press',
            edition: '3rd Edition',
            courseCode: '6.006',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/algorithms_cs_book_1786457679600.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });

    // Product 4: Physics Book
    await prisma.product.create({
      data: {
        sellerId: studentSeller2.seller.id,
        collegeId: mit.id,
        categoryId: textbooksCat.id,
        title: 'University Physics with Modern Physics (15th Edition)',
        description: 'Comprehensive physics textbook for engineering majors. Includes problem set solutions bookmark.',
        conditionGrade: ConditionGrade.GOOD,
        conditionNotes: 'Light shelf wear on front cover corners.',
        price: 820.00,
        originalMsrp: 1950.00,
        quantity: 1,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP',
        bookDetails: {
          create: {
            isbn13: '9780135159552',
            author: 'Hugh D. Young, Roger A. Freedman',
            publisher: 'Pearson',
            edition: '15th Edition',
            courseCode: 'PHYS101',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/engineering_physics_textbook_1786458506686.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });
  }

  if (bookstoreSeller.seller) {
    // Product 5: TI-84 Calculator
    await prisma.product.create({
      data: {
        sellerId: bookstoreSeller.seller.id,
        collegeId: harvard.id,
        categoryId: electronicsCat.id,
        title: 'Texas Instruments TI-84 Plus CE Color Graphing Calculator',
        description: 'Refurbished TI-84 Plus CE Color Screen calculator. Tested, cleared memory, includes USB charging cable & rechargeable battery.',
        conditionGrade: ConditionGrade.LIKE_NEW,
        conditionNotes: 'Verified working by Crimson Bookstore technicians. Clean screen with zero dead pixels.',
        price: 3499.00,
        originalMsrp: 8999.00,
        quantity: 5,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        images: {
          create: [
            { imageUrl: '/images/ti84_calculator_photo_1786457657954.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });

    // Product 6: Lab Kit
    await prisma.product.create({
      data: {
        sellerId: bookstoreSeller.seller.id,
        collegeId: harvard.id,
        categoryId: toolsCat.id,
        title: 'Complete Biology & Anatomy Dissection Tool Set (15-Piece)',
        description: 'Stainless steel surgical grade dissection instruments including scalpels, forceps, curved scissors, and zipper case.',
        conditionGrade: ConditionGrade.BRAND_NEW,
        conditionNotes: 'Sealed stainless steel instruments.',
        price: 399.00,
        originalMsrp: 850.00,
        quantity: 12,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        images: {
          create: [
            { imageUrl: '/images/physics_lab_kit_1786457973983.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });

    // Product 7: Anatomy Atlas
    await prisma.product.create({
      data: {
        sellerId: bookstoreSeller.seller.id,
        collegeId: harvard.id,
        categoryId: textbooksCat.id,
        title: 'Atlas of Human Anatomy (7th Edition)',
        description: 'Illustrated medical student atlas with full-color anatomical diagrams by Frank H. Netter, MD.',
        conditionGrade: ConditionGrade.BRAND_NEW,
        conditionNotes: 'Brand new hardcover copy in shrink wrap.',
        price: 920.00,
        originalMsrp: 2250.00,
        quantity: 3,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        bookDetails: {
          create: {
            isbn13: '9780323393225',
            author: 'Frank H. Netter MD',
            publisher: 'Elsevier',
            edition: '7th Edition',
            courseCode: 'ANAT101',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/biology_anatomy_atlas_1786458250035.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });

    // Product 8: Python Data Science Book
    await prisma.product.create({
      data: {
        sellerId: bookstoreSeller.seller.id,
        collegeId: harvard.id,
        categoryId: textbooksCat.id,
        title: 'Python for Data Analysis & Machine Learning (3rd Edition)',
        description: 'Essential guide for Pandas, NumPy, and Scikit-Learn data science courses (CS109).',
        conditionGrade: ConditionGrade.LIKE_NEW,
        conditionNotes: 'Minimal corner wear. Crisp white pages.',
        price: 540.00,
        originalMsrp: 1150.00,
        quantity: 4,
        status: ProductStatus.ACTIVE,
        allowedFulfillments: 'CAMPUS_MEETUP,COURIER_SHIPPING',
        bookDetails: {
          create: {
            isbn13: '9781491957660',
            author: 'Wes McKinney',
            publisher: "O'Reilly Media",
            edition: '3rd Edition',
            courseCode: 'CS109',
          },
        },
        images: {
          create: [
            { imageUrl: '/images/python_data_science_book_1786458600513.png', isPrimary: true, displayOrder: 1 },
          ],
        },
      },
    });
  }

  console.log('🎉 Re-seeded Marketplace with Reasonable Indian Campus Prices (₹)!');
}

main()
  .catch((e) => {
    console.error('❌ Database Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
