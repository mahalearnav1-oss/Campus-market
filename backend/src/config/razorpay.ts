import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_campusmarket2026';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_secret_campusmarket_key_2026';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_2026';

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = RAZORPAY_KEY_SECRET
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const bufExpected = Buffer.from(expectedSignature);
  const bufSignature = Buffer.from(signature);

  if (bufExpected.length !== bufSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufExpected, bufSignature);
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = RAZORPAY_WEBHOOK_SECRET
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const bufExpected = Buffer.from(expectedSignature);
  const bufSignature = Buffer.from(signature);

  if (bufExpected.length !== bufSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufExpected, bufSignature);
}
