import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { createOrderSchema, cancelOrderSchema, updateSellerOrderStatusSchema } from '../validators/orderValidators';

export async function getCheckoutPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const preview = await orderService.getCheckoutPreview(userId);
    res.status(200).json({
      success: true,
      data: { checkout: preview },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order created successfully! Review your order details below.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBuyerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await orderService.getBuyerOrders(userId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderByNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const orderNumber = req.params.orderNumber;

    const order = await orderService.getOrderByNumber(userId, orderNumber);
    res.status(200).json({
      success: true,
      data: { order },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const orderNumber = req.params.orderNumber;
    const validatedInput = cancelOrderSchema.parse(req.body || {});

    const order = await orderService.cancelOrder(userId, orderNumber, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { order },
      message: 'Order successfully cancelled and inventory restored.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await orderService.getSellerOrders(userId, sellerId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSellerOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sellerId = req.user!.sellerId!;
    const orderItemId = req.params.orderItemId;
    const validatedInput = updateSellerOrderStatusSchema.parse(req.body);

    const order = await orderService.updateSellerOrderStatus(userId, sellerId, orderItemId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { order },
      message: 'Order item status updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
