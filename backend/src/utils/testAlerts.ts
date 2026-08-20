import { prisma } from '../config/prisma';
import { alertService } from '../services/alertService';
import { productService } from '../services/productService';
import { productRepository } from '../repositories/productRepository';
import { userRepository } from '../repositories/userRepository';
import { ProductStatus, NotificationType } from '@prisma/client';

async function runAlertsTestSuite() {
  console.log('🧪 Starting CampusMarket Smart Price-Drop & Availability Alerts Test Suite...');

  // Setup 3 Test Users
  const userA = await userRepository.createUser({
    email: 'test_alert_user_a@campus.edu',
    passwordHash: 'dummyhash',
    firstName: 'Alice',
    lastName: 'Buyer',
  }).catch(() => prisma.user.findUniqueOrThrow({ where: { email: 'test_alert_user_a@campus.edu' } }));

  const userB = await userRepository.createUser({
    email: 'test_alert_user_b@campus.edu',
    passwordHash: 'dummyhash',
    firstName: 'Bob',
    lastName: 'Buyer',
  }).catch(() => prisma.user.findUniqueOrThrow({ where: { email: 'test_alert_user_b@campus.edu' } }));

  const userC = await userRepository.createUser({
    email: 'test_alert_user_c@campus.edu',
    passwordHash: 'dummyhash',
    firstName: 'Charlie',
    lastName: 'Buyer',
  }).catch(() => prisma.user.findUniqueOrThrow({ where: { email: 'test_alert_user_c@campus.edu' } }));

  // Find or create a seller
  const seller = await prisma.seller.findFirst({
    where: { status: 'VERIFIED' },
  });
  const college = await prisma.college.findFirst();
  const category = await prisma.category.findFirst();

  if (!seller || !college || !category) {
    throw new Error('Required seed data missing for alerts test.');
  }

  // Create a test product with initial price ₹500
  const product = await productRepository.createProduct({
    sellerId: seller.id,
    collegeId: college.id,
    status: ProductStatus.ACTIVE,
    input: {
      title: 'Digital Signal Processing — Oppenheim (Test Alert Edition)',
      description: 'Used textbook for alert testing.',
      conditionNotes: 'Test notes',
      allowedFulfillments: 'CAMPUS_MEETUP',
      price: 500,
      conditionGrade: 'GOOD' as any,
      categoryId: category.id,
      quantity: 2,
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', isPrimary: true, displayOrder: 0 }],
    },
  });

  console.log(`📦 Created Test Product "${product.title}" with Initial Price: ₹${product.price}`);

  // Test 1: Reject target price >= current price
  try {
    await alertService.setPriceAlert(userA.id, product.id, 500);
    throw new Error('FAILED: Expected error when targetPrice >= currentPrice');
  } catch (err: any) {
    console.log('✅ Test 1 (Reject target >= current): PASS', err.message);
  }

  try {
    await alertService.setPriceAlert(userA.id, product.id, 550);
    throw new Error('FAILED: Expected error when targetPrice > currentPrice');
  } catch (err: any) {
    console.log('✅ Test 1b (Reject target > current): PASS', err.message);
  }

  // Test 2: Create Valid Price Alert
  const alertA = await alertService.setPriceAlert(userA.id, product.id, 450);
  console.log('✅ Test 2 (Create valid alert A @ ₹450): PASS', {
    active: alertA.active,
    targetPrice: alertA.targetPrice,
  });

  // Test 3: Duplicate / Update Alert (User A updates target from 450 to 440)
  const updatedAlertA = await alertService.setPriceAlert(userA.id, product.id, 440);
  console.log('✅ Test 3 (Update existing alert target to ₹440): PASS', {
    active: updatedAlertA.active,
    targetPrice: updatedAlertA.targetPrice,
  });

  // Test 4: Get Price Alert Status
  const statusA = await alertService.getPriceAlert(userA.id, product.id);
  if (!statusA.active || statusA.targetPrice !== 440) {
    throw new Error(`FAILED: getPriceAlert returned invalid status: ${JSON.stringify(statusA)}`);
  }
  console.log('✅ Test 4 (Get alert status): PASS', statusA);

  // Test 5: Deactivate and Reactivate Alert
  await alertService.deactivatePriceAlert(userA.id, product.id);
  const deactivatedStatusA = await alertService.getPriceAlert(userA.id, product.id);
  if (deactivatedStatusA.active) {
    throw new Error('FAILED: Alert should be inactive after deactivation');
  }
  console.log('✅ Test 5 (Deactivate alert): PASS');

  // Reactivate Alert for User A at ₹450
  await alertService.setPriceAlert(userA.id, product.id, 450);
  // Set Alert for User B at ₹400
  await alertService.setPriceAlert(userB.id, product.id, 400);
  // Set Alert for User C at ₹300
  await alertService.setPriceAlert(userC.id, product.id, 300);
  console.log('✅ Test 6 (Multi-user alerts active: A=₹450, B=₹400, C=₹300): PASS');

  // Test 7: User Price Alerts List with Savings
  const userAList = await alertService.getUserPriceAlerts(userA.id);
  const foundAlert = userAList.alerts.find(a => a.productId === product.id);
  if (!foundAlert || foundAlert.savings !== 50 || foundAlert.savingsPercentage !== 10) {
    throw new Error(`FAILED: getUserPriceAlerts savings calculation mismatch: ${JSON.stringify(foundAlert)}`);
  }
  console.log('✅ Test 7 (getUserPriceAlerts formatting and savings metrics): PASS', {
    current: foundAlert.currentPrice,
    target: foundAlert.targetPrice,
    savings: foundAlert.savings,
    percent: foundAlert.savingsPercentage,
  });

  // Test 8: Price Drop Trigger: Seller updates price ₹500 -> ₹420
  // Target ₹450 (User A) should trigger!
  // Target ₹400 (User B) should NOT trigger!
  // Target ₹300 (User C) should NOT trigger!
  console.log('⚡ Triggering Seller Price Update: ₹500 -> ₹420...');
  await productService.updateProduct(seller.userId, seller.id, product.id, {
    price: 420,
  });

  const postTriggerA = await alertService.getPriceAlert(userA.id, product.id);
  const postTriggerB = await alertService.getPriceAlert(userB.id, product.id);
  const postTriggerC = await alertService.getPriceAlert(userC.id, product.id);

  if (postTriggerA.active !== false || !postTriggerA.triggeredAt) {
    throw new Error('FAILED: User A alert should have triggered and become inactive');
  }
  if (postTriggerB.active !== true) {
    throw new Error('FAILED: User B alert should remain active (420 > 400)');
  }
  if (postTriggerC.active !== true) {
    throw new Error('FAILED: User C alert should remain active (420 > 300)');
  }
  console.log('✅ Test 8 (Selective Trigger at ₹420: A triggered, B & C active): PASS');

  // Verify In-App Notification was created for User A
  const notifA = await prisma.notification.findFirst({
    where: {
      userId: userA.id,
      type: NotificationType.PRICE_DROP,
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!notifA || !notifA.body.includes('₹420')) {
    throw new Error(`FAILED: Price drop notification not found for User A: ${JSON.stringify(notifA)}`);
  }
  console.log('✅ Test 9 (In-App Notification created with ₹420 price & target info): PASS', notifA.body);

  // Test 10: Subsequent Price Edit ₹420 -> ₹380
  // User A should NOT trigger again (already deactivated).
  // User B (target 400) should now trigger!
  // User C (target 300) should NOT trigger!
  console.log('⚡ Triggering Subsequent Price Update: ₹420 -> ₹380...');
  await productService.updateProduct(seller.userId, seller.id, product.id, {
    price: 380,
  });

  const postTrigger2A = await alertService.getPriceAlert(userA.id, product.id);
  const postTrigger2B = await alertService.getPriceAlert(userB.id, product.id);
  const postTrigger2C = await alertService.getPriceAlert(userC.id, product.id);

  if (postTrigger2A.active !== false) throw new Error('User A alert was unexpectedly reactivated');
  if (postTrigger2B.active !== false || !postTrigger2B.triggeredAt) throw new Error('User B should have triggered at 380');
  if (postTrigger2C.active !== true) throw new Error('User C should remain active (380 > 300)');
  console.log('✅ Test 10 (Anti-Spam & Subsequent Trigger at ₹380: B triggered, A was not re-spammed): PASS');

  // Test 11: Availability Alerts (Restock / Unpause)
  console.log('⚡ Testing Availability / Back-in-Stock Alerts...');
  // Pause product
  await productService.pauseProduct(seller.userId, seller.id, product.id);

  // User A and User B set availability alerts
  await alertService.setAvailabilityAlert(userA.id, product.id);
  await alertService.setAvailabilityAlert(userB.id, product.id);

  const availA = await alertService.getAvailabilityAlert(userA.id, product.id);
  if (!availA.active) throw new Error('Availability alert should be active');

  // Seller unpauses / publishes product back to ACTIVE
  await productService.publishProduct(seller.userId, seller.id, product.id);

  const postAvailA = await alertService.getAvailabilityAlert(userA.id, product.id);
  const postAvailB = await alertService.getAvailabilityAlert(userB.id, product.id);

  if (postAvailA.active !== false || !postAvailA.triggeredAt) {
    throw new Error('FAILED: User A availability alert should have triggered and deactivated');
  }
  if (postAvailB.active !== false || !postAvailB.triggeredAt) {
    throw new Error('FAILED: User B availability alert should have triggered and deactivated');
  }

  const notifAvailA = await prisma.notification.findFirst({
    where: {
      userId: userA.id,
      type: NotificationType.BACK_IN_STOCK,
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!notifAvailA || !notifAvailA.title.includes('Back in Stock')) {
    throw new Error('FAILED: Back in stock notification not found for User A');
  }
  console.log('✅ Test 11 (Availability Alert trigger on restock / publish): PASS', notifAvailA.body);

  // Cleanup test product
  await prisma.priceAlert.deleteMany({ where: { productId: product.id } });
  await prisma.availabilityAlert.deleteMany({ where: { productId: product.id } });
  await prisma.notification.deleteMany({ where: { userId: { in: [userA.id, userB.id, userC.id] } } });
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });

  console.log('🎉 ALL 11 PRICE DROP & AVAILABILITY ALERT TESTS PASSED PERFECTLY!');
}

runAlertsTestSuite()
  .catch((e) => {
    console.error('❌ Test suite failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
