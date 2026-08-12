import crypto from 'crypto';

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char hex
  return `ORD-${year}-${randomHex}`;
}
