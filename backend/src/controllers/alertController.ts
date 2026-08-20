import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alertService';
import { setPriceAlertSchema, alertPaginationSchema } from '../validators/alertValidators';

export class AlertController {
  async setPriceAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;
      const validated = setPriceAlertSchema.parse(req.body);

      const alert = await alertService.setPriceAlert(userId, productId, validated.targetPrice);
      return res.status(200).json({
        success: true,
        data: { alert },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPriceAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const alert = await alertService.getPriceAlert(userId, productId);
      return res.status(200).json({
        success: true,
        data: { alert },
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePriceAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const result = await alertService.deactivatePriceAlert(userId, productId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserPriceAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = alertPaginationSchema.parse(req.query);

      const result = await alertService.getUserPriceAlerts(userId, page, limit);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async setAvailabilityAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const alert = await alertService.setAvailabilityAlert(userId, productId);
      return res.status(200).json({
        success: true,
        data: { alert },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAvailabilityAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const alert = await alertService.getAvailabilityAlert(userId, productId);
      return res.status(200).json({
        success: true,
        data: { alert },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAvailabilityAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const result = await alertService.deactivateAvailabilityAlert(userId, productId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const alertController = new AlertController();
