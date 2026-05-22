import { count, desc, eq, ilike, or } from "drizzle-orm";
import { DEFAULT_PAGE_SIZE } from "@/core/constants/attendance";
import type { AppDb } from "@/db/db";
import { auditLogs, users } from "@/db/schema";

export async function getAuditLogsPage(
  db: AppDb,
  {
    q,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  }: {
    q?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const where = q ? or(ilike(auditLogs.entity, `%${q}%`), ilike(auditLogs.entityId, `%${q}%`)) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(auditLogs).where(where);
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
