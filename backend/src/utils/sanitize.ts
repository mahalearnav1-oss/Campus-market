/**
 * Production XSS Content Sanitization Utility
 * Strips dangerous HTML tags, script elements, and event attributes.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as any)[key] = sanitizeText(sanitized[key]);
    }
  }
  return sanitized;
}
