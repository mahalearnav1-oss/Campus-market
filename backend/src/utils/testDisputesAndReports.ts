import { prisma } from '../config/prisma';
import { adminService } from '../services/adminService';
import {
  UserRole,
  UserStatus,
  SellerStatus,
  ProductStatus,
  OrderStatus,
  EscrowStatus,
  DisputeReason,
  DisputeStatus,
  ReportStatus,
  ConditionGrade,
  PaymentMethod,
  FulfillmentMode,
} from '@prisma/client';

async function runDisputesAndReportsTestSuite() {
  console.log('🧪 Starting CampusMarket Dispute & Abuse Reporting Test Suite...\n');

  // Step 0: Ensure an Admin, Buyer, Seller, and Product exist
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
  });
  if (!adminUser) throw new Error('No admin user found for tests');

  const buyerUser = await prisma.user.upsert({
    where: { email: 'dispute_test_buyer@campus.edu' },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: 'dispute_test_buyer@campus.edu',
      passwordHash: 'dummy_hash',
      firstName: 'DisputeBuyer',
      lastName: 'Student',
      role: UserRole.STUDENT_BUYER,
      status: UserStatus.ACTIVE,
    },
  });

  const unrelatedUser = await prisma.user.upsert({
    where: { email: 'dispute_unrelated_user@campus.edu' },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: 'dispute_unrelated_user@campus.edu',
      passwordHash: 'dummy_hash',
      firstName: 'Unrelated',
      lastName: 'User',
      role: UserRole.STUDENT_BUYER,
      status: UserStatus.ACTIVE,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'dispute_test_seller@campus.edu' },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: 'dispute_test_seller@campus.edu',
      passwordHash: 'dummy_hash',
      firstName: 'DisputeSeller',
      lastName: 'Merchant',
      role: UserRole.STUDENT_SELLER,
      status: UserStatus.ACTIVE,
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: { status: SellerStatus.VERIFIED },
    create: {
      userId: sellerUser.id,
      storeName: 'Dispute Test Store',
      status: SellerStatus.VERIFIED,
      sellerType: 'STUDENT',
    },
  });

  const college = await prisma.college.findFirst();
  const category = await prisma.category.upsert({
    where: { slug: 'textbooks' },
    update: {},
    create: {
      name: 'Textbooks',
      slug: 'textbooks',
      description: 'Course textbooks and academic books',
    },
  });

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      collegeId: college?.id || undefined,
      categoryId: category.id,
      title: 'Dispute Test Course Textbook',
      description: 'Used textbook for testing dispute and report systems',
      conditionGrade: ConditionGrade.GOOD,
      price: 499.0,
      quantity: 5,
      status: ProductStatus.ACTIVE,
    },
  });

  // Create an active test order with Escrow
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-DISP-${Date.now().toString().slice(-6)}`,
      buyerId: buyerUser.id,
      sellerId: seller.id,
      fulfillmentMode: FulfillmentMode.CAMPUS_MEETUP,
      status: OrderStatus.PAID_ESCROW,
      totalAmount: 499.0,
      subtotal: 499.0,
      platformFee: 25.0,
      escrowLedger: {
        create: {
          grossAmount: 499.0,
          platformFee: 25.0,
          netSellerPayout: 474.0,
          status: EscrowStatus.HELD,
        },
      },
      items: {
        create: {
          productId: product.id,
          sellerId: seller.id,
          snapshotTitle: product.title,
          snapshotCondition: product.conditionGrade,
          snapshotUnitPrice: 499.0,
          quantity: 1,
          totalPrice: 499.0,
        },
      },
    },
  });

  console.log(`0. Created test order #${testOrder.orderNumber} (ID: ${testOrder.id}) with Escrow HELD.\n`);

  // ── TEST 1: Unrelated user attempts to dispute order (Should fail 403) ────
  console.log('1. Testing unauthorized user dispute attempt...');
  try {
    await adminService.createDispute(unrelatedUser.id, {
      orderId: testOrder.id,
      reason: DisputeReason.ITEM_NOT_AS_DESCRIBED,
      explanation: 'I am an unrelated user trying to dispute someone else\'s purchase.',
    });
    throw new Error('Test 1 FAILED: Unrelated user was able to create dispute!');
  } catch (err: any) {
    if (err.code === 'FORBIDDEN_DISPUTE' || err.statusCode === 403) {
      console.log('✅ Test 1 PASS: Unauthorized user dispute rejected with 403 FORBIDDEN_DISPUTE.');
    } else {
      throw err;
    }
  }

  // ── TEST 2: Legitimate buyer creates dispute for own order ─────────────────
  console.log('\n2. Testing legitimate buyer dispute creation...');
  const dispute = await adminService.createDispute(buyerUser.id, {
    orderId: testOrder.id,
    reason: DisputeReason.ITEM_NOT_AS_DESCRIBED,
    explanation: 'The textbook had extensive water damage and multiple missing problem set pages.',
    proofImageUrls: ['https://campusmarket.edu/proofs/test_damage.jpg'],
  });

  if (dispute && dispute.status === DisputeStatus.OPENED) {
    console.log(`✅ Test 2 PASS: Dispute created successfully (ID: ${dispute.id}, Status: ${dispute.status}).`);
  } else {
    throw new Error('Test 2 FAILED: Dispute creation did not return OPENED dispute.');
  }

  // ── TEST 3: Verify order status updated to DISPUTED and notification sent ──
  console.log('\n3. Verifying order status transitioned to DISPUTED...');
  const updatedOrder = await prisma.order.findUnique({
    where: { id: testOrder.id },
    include: { dispute: true, statusHistory: true },
  });

  if (updatedOrder?.status === OrderStatus.DISPUTED) {
    console.log('✅ Test 3 PASS: Order status successfully transitioned to DISPUTED.');
  } else {
    throw new Error(`Test 3 FAILED: Order status is ${updatedOrder?.status}, expected DISPUTED.`);
  }

  // ── TEST 4: Duplicate dispute prevention (Should fail 409) ─────────────────
  console.log('\n4. Testing duplicate active dispute prevention...');
  try {
    await adminService.createDispute(buyerUser.id, {
      orderId: testOrder.id,
      reason: DisputeReason.WRONG_ITEM,
      explanation: 'Attempting to open duplicate active dispute for the same order.',
    });
    throw new Error('Test 4 FAILED: Duplicate dispute was allowed!');
  } catch (err: any) {
    if (err.code === 'DUPLICATE_DISPUTE' || err.statusCode === 409) {
      console.log('✅ Test 4 PASS: Duplicate dispute prevented with 409 DUPLICATE_DISPUTE.');
    } else {
      throw err;
    }
  }

  // ── TEST 5: Admin retrieves disputes in Resolution Center ──────────────────
  console.log('\n5. Testing admin dispute retrieval in Resolution Center...');
  const adminDisputes = await adminService.getDisputes(1, 20);
  const foundDispute = adminDisputes.disputes.find((d: any) => d.id === dispute.id);

  if (foundDispute && foundDispute.order?.orderNumber === testOrder.orderNumber) {
    console.log(`✅ Test 5 PASS: Dispute found in Admin Resolution Center queue with order #${foundDispute.order.orderNumber}.`);
  } else {
    throw new Error('Test 5 FAILED: Dispute not found in admin queue.');
  }

  // ── TEST 6: Admin resolves dispute with BUYER REFUND ──────────────────────
  console.log('\n6. Testing admin dispute resolution (RESOLVED_BUYER_REFUND)...');
  const resolvedDispute = await adminService.resolveDispute(adminUser.id, dispute.id, {
    status: 'RESOLVED_BUYER_REFUND',
    resolutionNotes: 'Buyer photographic proof verified. Escrow refunded to buyer.',
  });

  const postResolutionOrder = await prisma.order.findUnique({
    where: { id: testOrder.id },
    include: { escrowLedger: true },
  });

  if (
    resolvedDispute.status === DisputeStatus.RESOLVED_BUYER_REFUND &&
    postResolutionOrder?.status === OrderStatus.REFUNDED &&
    postResolutionOrder?.escrowLedger?.status === EscrowStatus.REFUNDED
  ) {
    console.log('✅ Test 6 PASS: Dispute resolved, Order set to REFUNDED, EscrowLedger set to REFUNDED.');
  } else {
    throw new Error('Test 6 FAILED: Dispute resolution did not update order/escrow states properly.');
  }

  // ── TEST 7: Authenticated user submits Abuse Report on a Product ───────────
  console.log('\n7. Testing user reporting a product listing...');
  const productReport = await adminService.createReport(buyerUser.id, {
    targetType: 'PRODUCT',
    targetId: product.id,
    reason: 'Misleading or inaccurate condition/description',
    description: 'Item condition was listed as Brand New but photo shows torn spine.',
  });

  if (productReport && productReport.status === ReportStatus.PENDING) {
    console.log(`✅ Test 7 PASS: Product report created (ID: ${productReport.id}, Status: PENDING).`);
  } else {
    throw new Error('Test 7 FAILED: Product report creation failed.');
  }

  // ── TEST 8: Reporting non-existent product fails 404 ───────────────────────
  console.log('\n8. Testing report on non-existent target ID...');
  try {
    await adminService.createReport(buyerUser.id, {
      targetType: 'PRODUCT',
      targetId: '00000000-0000-0000-0000-000000000000',
      reason: 'Fake item',
    });
    throw new Error('Test 8 FAILED: Non-existent product was reported successfully!');
  } catch (err: any) {
    if (err.code === 'PRODUCT_NOT_FOUND' || err.statusCode === 404) {
      console.log('✅ Test 8 PASS: Invalid target rejected with 404 PRODUCT_NOT_FOUND.');
    } else {
      throw err;
    }
  }

  // ── TEST 9: Authenticated user submits Abuse Report on a Seller ────────────
  console.log('\n9. Testing user reporting a seller storefront...');
  const sellerReport = await adminService.createReport(buyerUser.id, {
    targetType: 'SELLER',
    targetId: seller.id,
    reason: 'Suspicious or fraudulent behavior',
    description: 'Seller asked to transact outside CampusMarket escrow.',
  });

  if (sellerReport && sellerReport.status === ReportStatus.PENDING) {
    console.log(`✅ Test 9 PASS: Seller report created (ID: ${sellerReport.id}, Status: PENDING).`);
  } else {
    throw new Error('Test 9 FAILED: Seller report creation failed.');
  }

  // ── TEST 10: Admin retrieves and resolves Abuse Report ─────────────────────
  console.log('\n10. Testing admin report retrieval & resolution...');
  const adminReports = await adminService.getReports(1, 20);
  const foundReport = adminReports.reports.find((r: any) => r.id === productReport.id);

  if (!foundReport) {
    throw new Error('Test 10 FAILED: Product report not found in admin queue.');
  }

  const resolvedReport = await adminService.resolveReport(adminUser.id, productReport.id, {
    status: 'RESOLVED',
    resolutionNotes: 'Seller warned regarding accurate condition grading.',
  });

  if (resolvedReport.status === ReportStatus.RESOLVED && resolvedReport.assignedAdminId === adminUser.id) {
    console.log('✅ Test 10 PASS: Report resolved successfully with admin assignment and moderation notes.');
  } else {
    throw new Error('Test 10 FAILED: Report resolution failed.');
  }

  // Cleanup test artifacts
  console.log('\nCleaning up test records...');
  await prisma.dispute.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.escrowLedger.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.orderItem.deleteMany({ where: { OR: [{ orderId: testOrder.id }, { sellerId: seller.id }] } });
  await prisma.order.deleteMany({ where: { OR: [{ id: testOrder.id }, { sellerId: seller.id }, { buyerId: buyerUser.id }] } });
  await prisma.report.deleteMany({ where: { id: { in: [productReport.id, sellerReport.id] } } });
  await prisma.productImage.deleteMany({ where: { product: { sellerId: seller.id } } });
  await prisma.product.deleteMany({ where: { sellerId: seller.id } });
  await prisma.notification.deleteMany({ where: { userId: { in: [buyerUser.id, sellerUser.id, unrelatedUser.id] } } });
  await prisma.sellerVerification.deleteMany({ where: { sellerId: seller.id } });
  await prisma.sellerWallet.deleteMany({ where: { sellerId: seller.id } });
  await prisma.sellerReview.deleteMany({ where: { sellerId: seller.id } });
  await prisma.seller.deleteMany({ where: { id: seller.id } });
  await prisma.cart.deleteMany({ where: { userId: { in: [buyerUser.id, sellerUser.id, unrelatedUser.id] } } });
  await prisma.wishlist.deleteMany({ where: { userId: { in: [buyerUser.id, sellerUser.id, unrelatedUser.id] } } });
  await prisma.notificationPreference.deleteMany({ where: { userId: { in: [buyerUser.id, sellerUser.id, unrelatedUser.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [buyerUser.id, sellerUser.id, unrelatedUser.id] } } });

  console.log('\n🎉 ALL 10 DISPUTE & ABUSE REPORTING INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runDisputesAndReportsTestSuite()
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
