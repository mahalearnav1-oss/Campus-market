import { prisma } from '../config/prisma';
import { User, UserRole, UserStatus, SellerType, SellerStatus } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        college: { select: { id: true, name: true, code: true, city: true, state: true } },
        seller: { select: { id: true, sellerType: true, status: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        college: { select: { id: true, name: true, code: true, city: true, state: true } },
        seller: { select: { id: true, storeName: true, sellerType: true, status: true, rating: true } },
        preferences: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    collegeId?: string | null;
    course?: string | null;
    semester?: number | null;
  }) {
    return prisma.$transaction(async (tx) => {
      let targetCollegeId = data.collegeId;
      if (!targetCollegeId) {
        const defaultCollege = await tx.college.findFirst();
        if (defaultCollege) {
          targetCollegeId = defaultCollege.id;
        } else {
          const newCol = await tx.college.create({
            data: {
              name: 'Pimpri Chinchwad Education Trust (PCET)',
              code: 'PCET',
              domain: 'pcet.org.in',
              city: 'Pune',
              state: 'MH',
            },
          });
          targetCollegeId = newCol.id;
        }
      }

      const isSellerRole = data.role === UserRole.STUDENT_SELLER || data.role === UserRole.COMMERCIAL_BOOKSTORE;

      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || UserRole.STUDENT_BUYER,
          status: UserStatus.ACTIVE,
          isStudentVerified: true,
          collegeId: targetCollegeId,
          course: data.course || null,
          semester: data.semester || null,
          cart: { create: {} },
          wishlist: { create: {} },
          preferences: { create: {} },
          ...(isSellerRole ? {
            seller: {
              create: {
                sellerType: data.role === UserRole.COMMERCIAL_BOOKSTORE ? SellerType.COMMERCIAL_BOOKSTORE : SellerType.STUDENT,
                storeName: `${data.firstName}'s Campus Store`,
                status: SellerStatus.PENDING,
                wallet: {
                  create: {
                    clearedBalance: 0.00,
                    pendingEscrowBalance: 0.00,
                  },
                },
                verifications: {
                  create: {
                    documentType: 'Student ID',
                    documentUrl: 'https://campusmarket.internal/docs/student_id.pdf',
                    status: SellerStatus.PENDING,
                  },
                },
              },
            },
          } : {}),
        },
        include: {
          seller: { select: { id: true, status: true, storeName: true } },
          college: { select: { id: true, name: true, code: true, city: true, state: true } },
        },
      });
      return user;
    });
  }

  async updateProfile(id: string, data: {
    firstName?: string;
    lastName?: string;
    bio?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    collegeId?: string | null;
    course?: string | null;
    semester?: number | null;
  }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.collegeId !== undefined ? { collegeId: data.collegeId } : {}),
        ...(data.course !== undefined ? { course: data.course } : {}),
        ...(data.semester !== undefined ? { semester: data.semester } : {}),
      },
      include: {
        college: { select: { id: true, name: true, code: true, city: true, state: true } },
      },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}

export const userRepository = new UserRepository();
