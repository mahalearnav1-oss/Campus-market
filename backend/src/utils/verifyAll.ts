async function verify() {
  const fe = await fetch('http://localhost:5173').then(r => r.text());
  const health = await fetch('http://localhost:5000/api/v1/health').then(r => r.json());
  const prod = await fetch('http://localhost:5000/api/v1/products').then(r => r.json());
  const cats = await fetch('http://localhost:5000/api/v1/categories').then(r => r.json());

  console.log('--- SYSTEM INTEGRATION AUDIT SUMMARY ---');
  console.log('1. Frontend Dev Server (5173):', fe.includes('id="root"') ? '✅ ONLINE & SERVING HTML' : '❌ ERROR');
  console.log('2. Backend Health (5000):', health.status === 'UP' ? '✅ HEALTHY' : '❌ ERROR', health.services);
  console.log('3. Active Products Catalog:', prod.success && prod.data?.products?.length > 0 ? `✅ ${prod.data.products.length} PRODUCTS ACTIVE` : '❌ EMPTY');
  console.log('4. Course Categories:', cats.success && cats.data?.categories?.length > 0 ? `✅ ${cats.data.categories.length} CATEGORIES ACTIVE` : '❌ EMPTY');
  console.log('----------------------------------------');
}

verify().catch(console.error);
