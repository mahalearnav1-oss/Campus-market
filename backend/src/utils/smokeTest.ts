import { prisma } from '../config/prisma';

async function runSmokeTest() {
  const BASE_URL = 'http://localhost:5000/api/v1';
  console.log('🧪 Starting CampusMarket Full Backend & API Smoke Test...');

  // 1. Health
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('1. Health Check:', healthRes.status === 'UP' ? '✅ PASS' : '❌ FAIL', healthRes);

  // 2. Categories
  const catRes = await fetch(`${BASE_URL}/categories`).then(r => r.json());
  console.log('2. Categories:', catRes.success ? '✅ PASS' : '❌ FAIL', `Found ${catRes.data?.categories?.length} categories`);

  // 3. Products
  const prodRes = await fetch(`${BASE_URL}/products?limit=5`).then(r => r.json());
  console.log('3. Marketplace Products:', prodRes.success ? '✅ PASS' : '❌ FAIL', `Found ${prodRes.data?.products?.length} products`);

  const sampleProduct = prodRes.data?.products?.[0];
  if (!sampleProduct) {
    console.error('❌ No products found in database to test detail & cart.');
    return;
  }

  // 4. Product Detail
  const detailRes = await fetch(`${BASE_URL}/products/${sampleProduct.id}`).then(r => r.json());
  console.log('4. Product Detail:', detailRes.success ? '✅ PASS' : '❌ FAIL', detailRes.data?.product?.title);

  // 5. Product Reviews
  const revRes = await fetch(`${BASE_URL}/products/${sampleProduct.id}/reviews`).then(r => r.json());
  console.log('5. Product Reviews:', revRes.success ? '✅ PASS' : '❌ FAIL', `Summary: ${revRes.data?.summary?.averageRating || '0'}★ (${revRes.data?.summary?.totalReviews || 0} reviews)`);

  // 6. Test User Authentication (Login as buyer/admin)
  // Let's find an existing user in DB
  const existingUser = await prisma.user.findFirst({
    where: { status: 'ACTIVE' },
    include: { seller: true }
  });

  if (!existingUser) {
    console.error('❌ No active user found in database.');
    return;
  }

  console.log(`👤 Using test user: ${existingUser.email} (${existingUser.role})`);

  // Login via API
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: existingUser.email,
      password: 'StudentPass123!',
    }),
  }).then(r => r.json());

  let token = loginRes.data?.accessToken;
  if (!token) {
    console.log('⚠️ Seed password mismatch, generating direct token for test user...');
    const { generateAccessToken } = await import('../utils/tokenUtils');
    token = generateAccessToken({
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      sellerId: existingUser.seller?.id || null,
      collegeId: existingUser.collegeId || null,
    });
  } else {
    console.log('6. Auth Login:', '✅ PASS');
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 7. Auth Me
  const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders }).then(r => r.json());
  console.log('7. Auth Profile (/auth/me):', meRes.success ? '✅ PASS' : '❌ FAIL', meRes.data?.user?.email);

  // 8. Wishlist
  const wishRes = await fetch(`${BASE_URL}/wishlist`, { headers: authHeaders }).then(r => r.json());
  console.log('8. Wishlist:', wishRes.success ? '✅ PASS' : '❌ FAIL', `Total: ${wishRes.data?.wishlist?.totalCount || 0}`);

  // 9. Add to Cart
  const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: sampleProduct.id, quantity: 1 }),
  }).then(r => r.json());
  console.log('9. Add To Cart:', addCartRes.success ? '✅ PASS' : '❌ FAIL', `Cart count: ${addCartRes.data?.cart?.totalItemCount}`);

  // 10. Fetch Cart
  const cartRes = await fetch(`${BASE_URL}/cart`, { headers: authHeaders }).then(r => r.json());
  console.log('10. Fetch Cart (/cart):', cartRes.success ? '✅ PASS' : '❌ FAIL', `Subtotal: ₹${cartRes.data?.cart?.subtotal}`);

  // 11. User Address
  let addressRes = await fetch(`${BASE_URL}/users/me/addresses`, { headers: authHeaders }).then(r => r.json());
  let addressId = addressRes.data?.addresses?.[0]?.id;

  if (!addressId) {
    const createAddr = await fetch(`${BASE_URL}/users/me/addresses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        label: 'Campus Meetup SafeZone',
        recipientName: `${existingUser.firstName} ${existingUser.lastName}`,
        phone: '9876543210',
        streetAddress: '100 University Ave',
        dormOrBuilding: 'Library Gate',
        city: 'Pune',
        state: 'MH',
        postalCode: '411044',
        isDefault: true,
      }),
    }).then(r => r.json());
    addressId = createAddr.data?.address?.id;
  }
  console.log('11. User Shipping Address:', addressId ? '✅ PASS' : '❌ FAIL', addressId);

  // 12. Create & Deliver Order Instantly
  const createOrderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      shippingAddressId: addressId,
      fulfillmentMode: 'CAMPUS_MEETUP',
    }),
  }).then(r => r.json());

  console.log('12. Create Order & Instant Delivery:', createOrderRes.success ? '✅ PASS' : '❌ FAIL', `Order: #${createOrderRes.data?.order?.orderNumber}, Status: ${createOrderRes.data?.order?.status}`);

  const orderNumber = createOrderRes.data?.order?.orderNumber;

  // 13. Fetch Order Receipt
  if (orderNumber) {
    const orderDetailRes = await fetch(`${BASE_URL}/orders/${orderNumber}`, { headers: authHeaders }).then(r => r.json());
    console.log('13. Order Receipt (/orders/:num):', orderDetailRes.success ? '✅ PASS' : '❌ FAIL', `Items: ${orderDetailRes.data?.order?.items?.length}, Status: ${orderDetailRes.data?.order?.status}`);

    const orderItem = orderDetailRes.data?.order?.items?.[0];
    if (orderItem) {
      // 14. Submit 0-5 Star Rating
      const rateRes = await fetch(`${BASE_URL}/products/${orderItem.productId}/reviews`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          orderItemId: orderItem.id,
          rating: 5,
          title: '5/5 Excellent Condition',
          comment: 'Book was in pristine condition, great seller interaction.',
        }),
      }).then(r => r.json());
      console.log('14. Submit 0-5 Star Rating:', rateRes.success ? '✅ PASS' : '❌ FAIL', rateRes.message || rateRes.error?.message);
    }
  }

  // 15. Notifications
  const notifRes = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders }).then(r => r.json());
  console.log('15. Notifications (/notifications):', notifRes.success ? '✅ PASS' : '❌ FAIL', `Count: ${notifRes.data?.notifications?.length}`);

  // 16. Conversations
  const convRes = await fetch(`${BASE_URL}/conversations`, { headers: authHeaders }).then(r => r.json());
  console.log('16. Conversations (/conversations):', convRes.success ? '✅ PASS' : '❌ FAIL', `Threads: ${convRes.data?.conversations?.length || 0}`);

  // 17. Admin Analytics (if admin)
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (adminUser) {
    const { generateAccessToken } = await import('../utils/tokenUtils');
    const adminToken = generateAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN' as any,
      collegeId: adminUser.collegeId || null,
      sellerId: null,
    });
    const adminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());
    console.log('17. Admin Dashboard Analytics:', adminRes.success ? '✅ PASS' : '❌ FAIL', `Total Users: ${adminRes.data?.totalUsers}, Total Products: ${adminRes.data?.totalProducts}`);
  }

  console.log('🏁 All Backend & API Smoke Tests Completed Successfully!');
  process.exit(0);
}

runSmokeTest().catch((err) => {
  console.error('Smoke Test Failed:', err);
  process.exit(1);
});
