import { Request, Response, NextFunction } from 'express';
import { shipmentService } from '../services/shipmentService';
import { createShipmentSchema, updateShipmentStatusSchema, confirmDeliverySchema } from '../validators/shipmentValidators';
import { ShipmentStatus } from '@prisma/client';

export async function createShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const orderItemId = req.params.orderItemId;
    const validatedInput = createShipmentSchema.parse(req.body);

    const shipment = await shipmentService.createShipment(userId, sellerId, orderItemId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { shipment },
      message: 'Shipment created successfully!',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShipmentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const shipmentId = req.params.shipmentId;
    const validatedInput = updateShipmentStatusSchema.parse(req.body);

    const shipment = await shipmentService.updateShipmentStatus(userId, sellerId, shipmentId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { shipment },
      message: 'Shipment tracking status updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBuyerTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const orderNumber = req.params.orderNumber;

    const tracking = await shipmentService.getBuyerTracking(userId, orderNumber);
    res.status(200).json({
      success: true,
      data: tracking,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const shipmentNumber = req.params.shipmentNumber;

    const tracking = await shipmentService.getPublicTracking(shipmentNumber);
    res.status(200).json({
      success: true,
      data: { tracking },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as ShipmentStatus | undefined;

    const result = await shipmentService.getSellerShipments(userId, sellerId, page, limit, status);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmBuyerDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const orderNumber = req.params.orderNumber;
    const validatedInput = confirmDeliverySchema.parse(req.body || {});

    const order = await shipmentService.confirmBuyerDelivery(userId, orderNumber, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { order },
      message: 'Delivery confirmed! Order completed successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
