import { z } from 'zod';
import { FulfillmentMode, OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid('Invalid shipping address ID'),
  fulfillmentMode: z.nativeEnum(FulfillmentMode).optional().default(FulfillmentMode.CAMPUS_MEETUP),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(250).optional(),
});

export const updateSellerOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  reason: z.string().trim().max(250).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type UpdateSellerOrderStatusInput = z.infer<typeof updateSellerOrderStatusSchema>;
