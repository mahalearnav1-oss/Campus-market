import { z } from 'zod';
import { ShippingMethod, ShipmentStatus } from '@prisma/client';

export const createShipmentSchema = z.object({
  shippingMethod: z.nativeEnum(ShippingMethod).optional().default(ShippingMethod.COURIER),
  courierPartner: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  estimatedDeliveryDate: z.string().optional(),
  initialNote: z.string().trim().max(250).optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().trim().max(150).optional(),
  description: z.string().trim().max(250).optional(),
});

export const confirmDeliverySchema = z.object({
  note: z.string().trim().max(250).optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
export type ConfirmDeliveryInput = z.infer<typeof confirmDeliverySchema>;
