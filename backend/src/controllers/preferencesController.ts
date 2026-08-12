import { Request, Response, NextFunction } from 'express';
import { preferencesService } from '../services/preferencesService';
import { updatePreferencesSchema } from '../validators/userValidators';

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const preferences = await preferencesService.getUserPreferences(userId);
    res.status(200).json({
      success: true,
      data: { preferences },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = updatePreferencesSchema.parse(req.body);
    const updated = await preferencesService.updatePreferences(userId, validatedInput);
    res.status(200).json({
      success: true,
      data: { preferences: updated },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
