import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPaymentOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export const retryPaymentSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RetryPaymentInput = z.infer<typeof retryPaymentSchema>;
