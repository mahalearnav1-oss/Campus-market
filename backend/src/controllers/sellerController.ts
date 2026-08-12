import { Request, Response, NextFunction } from 'express';
import { sellerService } from '../services/sellerService';
import { applySellerSchema, updateSellerProfileSchema, submitVerificationSchema } from '../validators/sellerValidators';

export async function applySeller(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = applySellerSchema.parse(req.body);
    const seller = await sellerService.applySeller(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { seller },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMySeller(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const seller = await sellerService.getMySeller(userId);
    res.status(200).json({
      success: true,
      data: { seller },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const seller = await sellerService.getMySeller(userId);
    res.status(200).json({
      success: true,
      data: {
        sellerId: seller.id,
        sellerType: seller.sellerType,
        status: seller.status,
        verifications: seller.verifications,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMySeller(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = updateSellerProfileSchema.parse(req.body);
    const updated = await sellerService.updateSellerProfile(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { seller: updated },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = submitVerificationSchema.parse(req.body);
    const verification = await sellerService.submitVerification(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { verification },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicSeller(req: Request, res: Response, next: NextFunction) {
  try {
    const sellerId = req.params.id;
    const publicProfile = await sellerService.getPublicSeller(sellerId);
    res.status(200).json({
      success: true,
      data: { seller: publicProfile },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
