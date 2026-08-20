import { z } from 'zod';

export const setPriceAlertSchema = z.object({
  targetPrice: z.coerce
    .number({
      invalid_type_error: 'Please enter a valid target price.',
      required_error: 'Target price is required.',
    })
    .positive('Please enter a valid target price greater than 0.'),
});

export const alertPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SetPriceAlertInput = z.infer<typeof setPriceAlertSchema>;
export type AlertPaginationInput = z.infer<typeof alertPaginationSchema>;
