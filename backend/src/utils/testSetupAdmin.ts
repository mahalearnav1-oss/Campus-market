import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, verifyAccessToken } from '../utils/tokenUtils';

const prisma = new PrismaClient();

async function runAdminSetupVerification() {
  console.log('🧪 Starting Setup Admin Verification Test Suite...\n');

  // Test 1: Query Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@harvard.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

  const adminUsers = await prisma.user.findMany({
    where: { email: adminEmail },
    include: { college: true },
  });

  console.log('1. Admin Record Existence:');
  if (adminUsers.length === 1) {
    console.log(`   ✅ Exactly ONE admin record found with email "${adminEmail}".`);
  } else {
    console.error(`   ❌ Expected 1 admin record, found ${adminUsers.length}`);
    process.exit(1);
  }

  const admin = adminUsers[0];

  // Test 2: Role and Status Validation
  console.log('\n2. Role & Status Integrity:');
  console.log(`   - Role:   ${admin.role} (Expected: ${UserRole.ADMIN}) -> ${admin.role === UserRole.ADMIN ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Status: ${admin.status} (Expected: ${UserStatus.ACTIVE}) -> ${admin.status === UserStatus.ACTIVE ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Student Verified: ${admin.isStudentVerified} -> ${admin.isStudentVerified ? '✅ PASS' : '❌ FAIL'}`);

  if (admin.role !== UserRole.ADMIN || admin.status !== UserStatus.ACTIVE) {
    console.error('   ❌ Admin role or status mismatch!');
    process.exit(1);
  }

  // Test 3: Campus/College Relationship
  console.log('\n3. Campus/College Relationship:');
  if (admin.college && admin.collegeId) {
    console.log(`   ✅ Valid College relation: "${admin.college.name}" (${admin.college.code}), ID: ${admin.collegeId}`);
  } else {
    console.error('   ❌ Admin is missing a college relationship!');
    process.exit(1);
  }

  // Test 4: Password Verification
  console.log('\n4. Password Authentication Check:');
  const isPasswordValid = await bcrypt.compare(adminPassword, admin.passwordHash);
  if (isPasswordValid) {
    console.log(`   ✅ Password successfully verified against bcrypt hash.`);
  } else {
    console.error('   ❌ Password does not match stored bcrypt hash!');
    process.exit(1);
  }

  // Test 5: JWT Token & Admin Claims
  console.log('\n5. JWT Authentication & Claims:');
  const token = generateAccessToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    collegeId: admin.collegeId,
  });

  const decoded = verifyAccessToken(token);
  if (decoded && decoded.role === UserRole.ADMIN && decoded.userId === admin.id) {
    console.log(`   ✅ Valid JWT Access Token generated and verified with role "${decoded.role}".`);
  } else {
    console.error('   ❌ JWT verification failed or claims mismatch!');
    process.exit(1);
  }

  // Test 6: Reference Data Validation
  console.log('\n6. Reference Data Validation:');
  const collegeCount = await prisma.college.count();
  const categoryCount = await prisma.category.count();
  console.log(`   - Colleges count:   ${collegeCount} -> ${collegeCount >= 3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Categories count: ${categoryCount} -> ${categoryCount >= 4 ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n🎉 ALL ADMIN SETUP TESTS PASSED SUCCESSFULLY!\n');
}

runAdminSetupVerification()
  .catch((err) => {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
