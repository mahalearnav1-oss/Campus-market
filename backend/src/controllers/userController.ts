import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { updateProfileSchema, changePasswordSchema } from '../validators/authValidators';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const profile = await userService.getProfile(userId);
    res.status(200).json({
      success: true,
      data: { user: profile },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = updateProfileSchema.parse(req.body);
    const updatedUser = await userService.updateProfile(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = changePasswordSchema.parse(req.body);
    await userService.changePassword(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in with your new password.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
