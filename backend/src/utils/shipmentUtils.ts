import crypto from 'crypto';

export function generateShipmentNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char hex
  return `SHP-${year}-${randomHex}`;
}
