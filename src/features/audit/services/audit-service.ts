import type { AppDb } from "@/db/db";
import { auditLogs } from "@/db/schema";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "activate"
  | "deactivate"
  | "reset_password";

export async function writeAuditLog(
  db: AppDb,
  input: {
    userId?: string | null;
    action: AuditAction;
    entity: string;
    entityId?: string | null;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
  },
) {
  await db.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    oldData: input.oldData ?? null,
    newData: input.newData ?? null,
  });
}
