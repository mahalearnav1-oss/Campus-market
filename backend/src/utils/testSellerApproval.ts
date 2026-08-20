import { prisma } from '../config/prisma';
import { generateAccessToken } from './tokenUtils';
import { UserRole, SellerStatus, ProductStatus } from '@prisma/client';

async function runSellerApprovalTests() {
  const BASE_URL = 'http://localhost:5000/api/v1';
  console.log('🧪 Starting Mandatory Admin Seller Approval Test Suite...\n');

  // Find or create admin user for testing
  let adminUser = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, status: 'ACTIVE' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'test_admin_approval@campus.edu',
        passwordHash: 'dummy_hash',
        firstName: 'System',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        isStudentVerified: true,
      },
    });
  }

  const adminToken = generateAccessToken({
    userId: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });

  // Find a category for testing product creation
  const category = await prisma.category.findFirst();
  if (!category) {
    throw new Error('No category found in database for testing.');
  }

  const testEmail = `seller_approval_test_${Date.now()}@campus.edu`;

  try {
    // ------------------------------------------------------------------------
    // Test 1: New seller registers
    // ------------------------------------------------------------------------
    console.log('1. Registering new seller account...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Applicant',
        role: 'STUDENT_SELLER',
      }),
    }).then(r => r.json());

    if (!regRes.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes)}`);
    }

    const sellerUser = regRes.data.user;
    const sellerToken = regRes.data.accessToken;
    const sellerId = sellerUser.sellerId;

    // Check in database
    const dbSeller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!dbSeller || dbSeller.status !== SellerStatus.PENDING) {
      console.error('❌ Test 1 FAIL: Seller status is not PENDING. Found:', dbSeller?.status);
      process.exit(1);
    }
    console.log(`✅ Test 1 PASS: Seller registered with status = ${dbSeller.status} (PENDING)`);

    // ------------------------------------------------------------------------
    // Test 2: Pending seller attempts direct product creation via POST /products
    // ------------------------------------------------------------------------
    console.log('\n2. Pending seller attempts direct product creation (POST /products)...');
    const createRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Test Book Listing',
        description: 'Should be blocked by backend.',
        price: 499.00,
        quantity: 1,
        conditionGrade: 'GOOD',
        categoryId: category.id,
        images: [{ imageUrl: 'https://example.com/photo.jpg', isPrimary: true }],
      }),
    });

    const createJson = await createRes.json();
    if (createRes.status === 403 && (createJson.error?.code === 'SELLER_NOT_VERIFIED' || createJson.error?.code === 'FORBIDDEN')) {
      console.log(`✅ Test 2 PASS: Product creation rejected with status 403 (${createJson.error?.code}: ${createJson.error?.message})`);
    } else {
      console.error('❌ Test 2 FAIL: Expected 403 SELLER_NOT_VERIFIED, got:', createRes.status, createJson);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // Test 3: Pending seller attempts product publishing
    // ------------------------------------------------------------------------
    console.log('\n3. Pending seller attempts product publishing (POST /products/:id/publish)...');
    const pubRes = await fetch(`${BASE_URL}/products/some-fake-uuid/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
    });

    const pubJson = await pubRes.json();
    if (pubRes.status === 403 && (pubJson.error?.code === 'SELLER_NOT_VERIFIED' || pubJson.error?.code === 'FORBIDDEN')) {
      console.log(`✅ Test 3 PASS: Product publishing rejected with status 403 (${pubJson.error?.code}: ${pubJson.error?.message})`);
    } else {
      console.error('❌ Test 3 FAIL: Expected 403, got:', pubRes.status, pubJson);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // Test 4: Admin views Storefront Verification Queue
    // ------------------------------------------------------------------------
    console.log('\n4. Admin views Storefront Verification Queue (GET /admin/sellers?status=PENDING)...');
    const adminListRes = await fetch(`${BASE_URL}/admin/sellers?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    const foundInQueue = adminListRes.data?.sellers?.some((s: any) => s.id === sellerId);
    if (foundInQueue) {
      console.log(`✅ Test 4 PASS: Pending seller (${sellerId}) appears in admin verification queue.`);
    } else {
      console.error('❌ Test 4 FAIL: Seller not found in pending queue:', adminListRes);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // Test 5: Normal buyer attempts seller approval endpoint
    // ------------------------------------------------------------------------
    console.log('\n5. Normal buyer attempts to call admin seller approval endpoint...');
    const buyerRes = await fetch(`${BASE_URL}/admin/sellers/${sellerId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`, // buyer/seller token, not admin
      },
      body: JSON.stringify({ status: 'VERIFIED' }),
    });

    const buyerJson = await buyerRes.json();
    if (buyerRes.status === 403) {
      console.log(`✅ Test 5 PASS: Non-admin approval request forbidden (403).`);
    } else {
      console.error('❌ Test 5 FAIL: Expected 403 FORBIDDEN for non-admin, got:', buyerRes.status, buyerJson);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // Test 6: Admin approves seller
    // ------------------------------------------------------------------------
    console.log('\n6. Admin approves seller (POST /admin/sellers/:id/verify with VERIFIED)...');
    const approveRes = await fetch(`${BASE_URL}/admin/sellers/${sellerId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        notes: 'Identity verified with campus registry.',
      }),
    }).then(r => r.json());

    if (!approveRes.success || approveRes.data?.seller?.status !== 'VERIFIED') {
      console.error('❌ Test 6 FAIL: Admin approval failed:', approveRes);
      process.exit(1);
    }

    const updatedSellerDb = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (updatedSellerDb?.status !== SellerStatus.VERIFIED) {
      console.error('❌ Test 6 FAIL: Database seller status is not VERIFIED:', updatedSellerDb?.status);
      process.exit(1);
    }
    console.log(`✅ Test 6 PASS: Seller status updated to VERIFIED in database.`);

    // ------------------------------------------------------------------------
    // Test 7: Approved seller creates product
    // ------------------------------------------------------------------------
    console.log('\n7. Approved seller creates product (POST /products)...');
    const postRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        title: 'Approved Seller Calculus Textbook',
        description: 'Verified pre-owned campus item.',
        price: 850.00,
        quantity: 2,
        conditionGrade: 'LIKE_NEW',
        categoryId: category.id,
        images: [{ imageUrl: 'https://example.com/calculus.jpg', isPrimary: true }],
      }),
    }).then(r => r.json());

    if (!postRes.success || !postRes.data?.product?.id) {
      console.error('❌ Test 7 FAIL: Product creation failed for approved seller:', postRes);
      process.exit(1);
    }
    const createdProductId = postRes.data.product.id;
    console.log(`✅ Test 7 PASS: Product created successfully (ID: ${createdProductId}, Title: "${postRes.data.product.title}")`);

    // ------------------------------------------------------------------------
    // Test 8: Approved seller pauses & publishes product
    // ------------------------------------------------------------------------
    console.log('\n8. Approved seller publishes product (POST /products/:id/publish)...');
    const publishRes = await fetch(`${BASE_URL}/products/${createdProductId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
    }).then(r => r.json());

    if (!publishRes.success || publishRes.data?.product?.status !== ProductStatus.ACTIVE) {
      console.error('❌ Test 8 FAIL: Publish failed for approved seller:', publishRes);
      process.exit(1);
    }
    console.log(`✅ Test 8 PASS: Product published successfully with status ACTIVE.`);

    // Clean up created test product & seller
    await prisma.productImage.deleteMany({ where: { productId: createdProductId } });
    await prisma.product.deleteMany({ where: { id: createdProductId } });
    await prisma.sellerVerification.deleteMany({ where: { sellerId } });
    await prisma.sellerWallet.deleteMany({ where: { sellerId } });
    await prisma.notification.deleteMany({ where: { userId: sellerUser.id } });
    await prisma.seller.deleteMany({ where: { id: sellerId } });
    await prisma.cart.deleteMany({ where: { userId: sellerUser.id } });
    await prisma.wishlist.deleteMany({ where: { userId: sellerUser.id } });
    await prisma.notificationPreference.deleteMany({ where: { userId: sellerUser.id } });
    await prisma.user.deleteMany({ where: { id: sellerUser.id } });

    console.log('\n🎉 ALL 8 MANDATORY SELLER APPROVAL TESTS PASSED PERFECTLY!\n');
  } catch (error) {
    console.error('💥 Test suite encountered an error:', error);
    process.exit(1);
  }
}

runSellerApprovalTests();
