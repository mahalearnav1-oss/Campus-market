import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';
import { createPaymentOrderSchema, verifyPaymentSchema, retryPaymentSchema } from '../validators/paymentValidators';

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createPaymentOrderSchema.parse(req.body);

    const paymentDetails = await paymentService.createPaymentOrder(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { payment: paymentDetails },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = verifyPaymentSchema.parse(req.body);

    const result = await paymentService.verifyPayment(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: result,
      message: result.message,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const result = await paymentService.handleWebhook(rawBody, signature);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function retryPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = retryPaymentSchema.parse(req.body);

    const paymentDetails = await paymentService.retryPayment(userId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: { payment: paymentDetails },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const orderNumber = req.params.orderNumber;

    const status = await paymentService.getPaymentStatus(userId, orderNumber);
    res.status(200).json({
      success: true,
      data: status,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
