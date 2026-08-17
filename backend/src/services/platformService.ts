import { prisma } from '../config/prisma';
import { UserRole, UserStatus, ProductStatus } from '@prisma/client';

export class PlatformService {
  async getPlatformStats() {
    const [verifiedStudents, activeListings, activeCampuses] = await Promise.all([
      // Count verified, active students (STUDENT_BUYER or STUDENT_SELLER)
      prisma.user.count({
        where: {
          role: { in: [UserRole.STUDENT_BUYER, UserRole.STUDENT_SELLER] },
          status: UserStatus.ACTIVE,
          isStudentVerified: true,
          deletedAt: null,
        },
      }),
      // Count currently active, in-stock public product listings
      prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
          quantity: { gt: 0 },
          deletedAt: null,
        },
      }),
      // Count registered colleges/campuses
      prisma.college.count(),
    ]);

    return {
      verifiedStudents,
      activeListings,
      activeCampuses,
    };
  }
}

export const platformService = new PlatformService();
