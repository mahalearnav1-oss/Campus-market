import { prisma } from '../config/prisma';
import { productService } from '../services/productService';
import { createProductSchema, updateProductSchema } from '../validators/productValidators';
import { ConditionGrade, UserRole, UserStatus, SellerStatus, ProductStatus } from '@prisma/client';

async function runProductImageTestSuite() {
  console.log('🧪 Starting CampusMarket Product Listing & Image URL Test Suite...\n');

  // Step 0: Ensure verified seller exists
  const sellerUser = await prisma.user.upsert({
    where: { email: 'image_test_seller@campus.edu' },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: 'image_test_seller@campus.edu',
      passwordHash: 'dummy_hash',
      firstName: 'ImageTest',
      lastName: 'Seller',
      role: UserRole.STUDENT_SELLER,
      status: UserStatus.ACTIVE,
      isStudentVerified: true,
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: { status: SellerStatus.VERIFIED },
    create: {
      userId: sellerUser.id,
      storeName: 'Image Test Storefront',
      status: SellerStatus.VERIFIED,
      sellerType: 'STUDENT',
    },
  });

  const category = await prisma.category.findFirstOrThrow();
  const college = await prisma.college.findFirst();

  const createdProductIds: string[] = [];

  try {
    // ── TEST 1: Standard HTTPS Image URL ──────────────────────────────────
    console.log('1. Testing product creation with standard HTTPS Image URL (Unsplash)...');
    const standardPayload = {
      title: 'Standard HTTPS Image URL Textbook',
      description: 'Used textbook with standard image URL',
      price: 350.0,
      categoryId: category.id,
      conditionGrade: ConditionGrade.GOOD,
      conditionNotes: 'Good condition',
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          isPrimary: true,
        },
      ],
    };

    const validated1 = createProductSchema.parse(standardPayload);
    const prod1 = await productService.createProduct(sellerUser.id, seller.id, college?.id || null, validated1);
    createdProductIds.push(prod1.id);
    console.log(`✅ Test 1 PASS: Product created with standard URL (ID: ${prod1.id}, Image: ${prod1.images[0]?.imageUrl?.slice(0, 50)}...).`);

    // ── TEST 2: Long HTTPS Image URL (>250 chars) ─────────────────────────
    console.log('\n2. Testing product creation with long HTTPS Image URL (>250 chars)...');
    const longUrl = 'https://images.unsplash.com/photo-1532012164546-f432f2e37072?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80&utm_source=campusmarket_academic_test&utm_medium=referral&utm_campaign=campus_books_listing&token=abcdef1234567890';
    const longPayload = {
      title: 'Long URL Advanced Mathematics',
      description: 'Used textbook with very long CDN URL',
      price: 520.0,
      categoryId: category.id,
      conditionGrade: ConditionGrade.LIKE_NEW,
      conditionNotes: 'No markings',
      images: [{ imageUrl: longUrl, isPrimary: true }],
    };

    const validated2 = createProductSchema.parse(longPayload);
    const prod2 = await productService.createProduct(sellerUser.id, seller.id, college?.id || null, validated2);
    createdProductIds.push(prod2.id);
    console.log(`✅ Test 2 PASS: Product created with long URL (Length: ${longUrl.length} chars, ID: ${prod2.id}).`);

    // ── TEST 3: Local Upload Relative URL (/api/v1/uploads/...) ───────────
    console.log('\n3. Testing product creation with local upload relative path...');
    const localUploadUrl = '/api/v1/uploads/course_photo_1786545412325.jpg';
    const localPayload = {
      title: 'Local Upload Calculus Book',
      description: 'Used textbook with uploaded image path',
      price: 400.0,
      categoryId: category.id,
      conditionGrade: ConditionGrade.GOOD,
      images: [{ imageUrl: localUploadUrl, isPrimary: true }],
    };

    const validated3 = createProductSchema.parse(localPayload);
    const prod3 = await productService.createProduct(sellerUser.id, seller.id, college?.id || null, validated3);
    createdProductIds.push(prod3.id);
    console.log(`✅ Test 3 PASS: Product created with local upload path (ID: ${prod3.id}).`);

    // ── TEST 4: Base64 Data URI Image ────────────────────────────────────
    console.log('\n4. Testing product creation with Base64 Data URI...');
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const dataUriPayload = {
      title: 'Data URI Lab Manual',
      description: 'Used lab manual with inline data URI',
      price: 150.0,
      categoryId: category.id,
      conditionGrade: ConditionGrade.FAIR,
      images: [{ imageUrl: dataUri, isPrimary: true }],
    };

    const validated4 = createProductSchema.parse(dataUriPayload);
    const prod4 = await productService.createProduct(sellerUser.id, seller.id, college?.id || null, validated4);
    createdProductIds.push(prod4.id);
    console.log(`✅ Test 4 PASS: Product created with Data URI (ID: ${prod4.id}).`);

    // ── TEST 5: Invalid Image URL (Should fail validation) ────────────────
    console.log('\n5. Testing invalid Image URL rejection with clear validation message...');
    const invalidPayload = {
      title: 'Invalid Image Test',
      price: 200.0,
      categoryId: category.id,
      images: [{ imageUrl: 'not-a-valid-url-protocol' }],
    };

    try {
      createProductSchema.parse(invalidPayload);
      throw new Error('Test 5 FAILED: Invalid URL was unexpectedly allowed!');
    } catch (err: any) {
      const issue = err.issues?.[0];
      if (issue && issue.message.includes('valid web image URL')) {
        console.log(`✅ Test 5 PASS: Invalid URL rejected with message: "${issue.message}".`);
      } else {
        throw err;
      }
    }

    // ── TEST 6: Empty/Missing Images Array (Should fail validation) ───────
    console.log('\n6. Testing empty images array rejection...');
    const noImagesPayload = {
      title: 'No Images Test',
      price: 200.0,
      categoryId: category.id,
      images: [],
    };

    try {
      createProductSchema.parse(noImagesPayload);
      throw new Error('Test 6 FAILED: Empty images array was unexpectedly allowed!');
    } catch (err: any) {
      const issue = err.issues?.[0];
      if (issue && issue.message.includes('At least one clear photo')) {
        console.log(`✅ Test 6 PASS: Empty images rejected with message: "${issue.message}".`);
      } else {
        throw err;
      }
    }

    // ── TEST 7: Updating product with new image URL ───────────────────────
    console.log('\n7. Testing product update with replacement image URL...');
    const newImageUrl = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';
    const updateInput = updateProductSchema.parse({
      images: [{ imageUrl: newImageUrl, isPrimary: true }],
    });

    const updated = await productService.updateProduct(sellerUser.id, seller.id, prod1.id, updateInput);
    if (updated.images[0]?.imageUrl === newImageUrl) {
      console.log(`✅ Test 7 PASS: Product image updated successfully to: ${newImageUrl.slice(0, 50)}...`);
    } else {
      throw new Error('Test 7 FAILED: Image URL was not updated.');
    }

    // ── TEST 8: Adding extra image via addProductImage ────────────────────
    console.log('\n8. Testing addProductImage service...');
    const extraImageUrl = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80';
    const addedImage = await productService.addProductImage(sellerUser.id, seller.id, prod1.id, extraImageUrl, false);
    if (addedImage && addedImage.imageUrl === extraImageUrl) {
      console.log(`✅ Test 8 PASS: Extra image added to product (Image ID: ${addedImage.id}).`);
    } else {
      throw new Error('Test 8 FAILED: Extra image was not added.');
    }

    console.log('\n🎉 ALL 8 PRODUCT IMAGE URL TESTS PASSED PERFECTLY!\n');
  } finally {
    // Cleanup test products and seller
    console.log('Cleaning up test records...');
    for (const pid of createdProductIds) {
      await prisma.productImage.deleteMany({ where: { productId: pid } }).catch(() => null);
      await prisma.auditLog.deleteMany({ where: { resourceId: pid } }).catch(() => null);
      await prisma.product.delete({ where: { id: pid } }).catch(() => null);
    }
    await prisma.seller.deleteMany({ where: { id: seller.id } }).catch(() => null);
    await prisma.user.deleteMany({ where: { id: sellerUser.id } }).catch(() => null);
    await prisma.auditLog.deleteMany({ where: { actorUserId: sellerUser.id } }).catch(() => null);
  }
}

runProductImageTestSuite()
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
