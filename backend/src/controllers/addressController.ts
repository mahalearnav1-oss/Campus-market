import { Request, Response, NextFunction } from 'express';
import { addressService } from '../services/addressService';
import { createAddressSchema, updateAddressSchema } from '../validators/userValidators';

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const addresses = await addressService.getUserAddresses(userId);
    res.status(200).json({
      success: true,
      data: { addresses },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createAddressSchema.parse(req.body);
    const address = await addressService.createAddress(userId, validatedInput);
    res.status(201).json({
      success: true,
      data: { address },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const validatedInput = updateAddressSchema.parse(req.body);
    const updated = await addressService.updateAddress(addressId, userId, validatedInput);
    res.status(200).json({
      success: true,
      data: { address: updated },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    await addressService.deleteAddress(addressId, userId);
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
