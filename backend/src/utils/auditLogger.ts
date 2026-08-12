import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export async function logAuditEvent(
  action: string,
  resource: string,
  actorUserId?: string | null,
  resourceId?: string | null,
  payload?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        actorUserId: actorUserId || null,
        resourceId: resourceId || null,
        payload: payload ? (payload as Prisma.InputJsonValue) : undefined,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    // Non-blocking catch to prevent audit failure from interrupting primary flow
    console.error('Audit Log Error:', error);
  }
}
