import { prisma } from '../config/prisma';
import { SellerType, SellerStatus, UserRole } from '@prisma/client';
import { ApplySellerInput, UpdateSellerProfileInput } from '../validators/sellerValidators';

export class SellerRepository {
  async findByUserId(userId: string) {
    return prisma.seller.findUnique({
      where: { userId },
      include: {
        verifications: { orderBy: { createdAt: 'desc' } },
        wallet: true,
        user: { select: { firstName: true, lastName: true, email: true, college: true } },
      },
    });
  }

  async findById(sellerId: string) {
    return prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, college: true, createdAt: true } },
      },
    });
  }

  async createSellerApplication(userId: string, input: ApplySellerInput) {
    return prisma.$transaction(async (tx) => {
      // Create Seller record & Wallet
      const seller = await tx.seller.create({
        data: {
          userId,
          sellerType: input.sellerType,
          storeName: input.storeName,
          bio: input.bio || null,
          businessRegNumber: input.businessRegNumber || null,
          status: SellerStatus.PENDING,
          wallet: {
            create: {
              clearedBalance: 0.00,
              pendingEscrowBalance: 0.00,
            },
          },
          verifications: {
            create: {
              documentType: input.documentType,
              documentUrl: input.documentUrl,
              status: SellerStatus.PENDING,
            },
          },
        },
        include: {
          verifications: true,
          wallet: true,
        },
      });

      // Update User role if STUDENT_BUYER -> STUDENT_SELLER / COMMERCIAL_BOOKSTORE
      const targetRole = input.sellerType === SellerType.COMMERCIAL_BOOKSTORE
        ? UserRole.COMMERCIAL_BOOKSTORE
        : UserRole.STUDENT_SELLER;

      await tx.user.update({
        where: { id: userId },
        data: { role: targetRole },
      });

      return seller;
    });
  }

  async updateSellerProfile(sellerId: string, input: UpdateSellerProfileInput) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: {
        ...(input.storeName ? { storeName: input.storeName } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.businessRegNumber !== undefined ? { businessRegNumber: input.businessRegNumber } : {}),
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, college: true } },
      },
    });
  }

  async addVerificationDocument(sellerId: string, documentType: string, documentUrl: string) {
    return prisma.sellerVerification.create({
      data: {
        sellerId,
        documentType,
        documentUrl,
        status: SellerStatus.PENDING,
      },
    });
  }

  async updateSellerStatus(sellerId: string, status: SellerStatus) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: { status },
    });
  }
}

export const sellerRepository = new SellerRepository();
