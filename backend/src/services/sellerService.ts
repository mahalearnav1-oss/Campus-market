import { sellerRepository } from '../repositories/sellerRepository';
import { ApplySellerInput, UpdateSellerProfileInput, SubmitVerificationInput } from '../validators/sellerValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { SellerStatus } from '@prisma/client';

export class SellerService {
  async applySeller(userId: string, input: ApplySellerInput, ipAddress?: string) {
    const existing = await sellerRepository.findByUserId(userId);
    if (existing) {
      const error: any = new Error('You have already created a seller account or submitted an application.');
      error.statusCode = 409;
      error.code = 'SELLER_ALREADY_EXISTS';
      throw error;
    }

    const seller = await sellerRepository.createSellerApplication(userId, input);
    await logAuditEvent('SELLER_APPLICATION_SUBMITTED', 'Seller', userId, seller.id, { sellerType: input.sellerType }, ipAddress);
    return seller;
  }

  async getMySeller(userId: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      const error: any = new Error('No seller account associated with this user.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }
    return seller;
  }

  async getPublicSeller(sellerId: string) {
    const seller = await sellerRepository.findById(sellerId);
    if (!seller || seller.deletedAt) {
      const error: any = new Error('Seller profile not found.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }

    // Sanitize output for public consumption: NEVER expose verification docs or internal financial details
    return {
      id: seller.id,
      storeName: seller.storeName,
      sellerType: seller.sellerType,
      status: seller.status,
      rating: seller.rating,
      totalSalesCount: seller.totalSalesCount,
      bio: seller.bio,
      createdAt: seller.createdAt,
      ownerName: `${seller.user.firstName} ${seller.user.lastName[0]}.`,
      collegeName: seller.user.college?.name || null,
      avatarUrl: seller.user.avatarUrl,
    };
  }

  async updateSellerProfile(userId: string, input: UpdateSellerProfileInput, ipAddress?: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      const error: any = new Error('No seller account found to update.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }

    if (seller.status === SellerStatus.SUSPENDED || seller.status === SellerStatus.REJECTED) {
      const error: any = new Error(`Cannot update profile while seller status is ${seller.status}.`);
      error.statusCode = 403;
      error.code = 'SELLER_SUSPENDED';
      throw error;
    }

    const updated = await sellerRepository.updateSellerProfile(seller.id, input);
    await logAuditEvent('SELLER_PROFILE_UPDATE', 'Seller', userId, seller.id, { updatedFields: Object.keys(input) }, ipAddress);
    return updated;
  }

  async submitVerification(userId: string, input: SubmitVerificationInput, ipAddress?: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      const error: any = new Error('No seller account found.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }

    const verification = await sellerRepository.addVerificationDocument(seller.id, input.documentType, input.documentUrl);
    
    // Reset status to PENDING if previously rejected
    if (seller.status === SellerStatus.REJECTED) {
      await sellerRepository.updateSellerStatus(seller.id, SellerStatus.PENDING);
    }

    await logAuditEvent('VERIFICATION_SUBMITTED', 'SellerVerification', userId, verification.id, { documentType: input.documentType }, ipAddress);
    return verification;
  }
}

export const sellerService = new SellerService();
