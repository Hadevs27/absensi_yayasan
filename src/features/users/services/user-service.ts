import { hash } from "bcryptjs";
import { and, count, desc, eq, ilike, isNull, ne, or } from "drizzle-orm";
import { DEFAULT_PAGE_SIZE } from "@/core/constants/attendance";
import type { CreateUserInput, UpdateUserInput } from "@/core/validation/user";
import type { AppDb } from "@/db/db";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/features/audit/services/audit-service";

export async function getUsersPage(
  db: AppDb,
  {
    q,
    role,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  }: {
    q?: string;
    role?: "admin" | "user";
    page?: number;
    pageSize?: number;
  },
) {
  const conditions = [isNull(users.deletedAt)];

  if (q) {
    conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))!);
  }

  if (role) {
    conditions.push(eq(users.role, role));
  }

  const where = and(...conditions);
  const [{ total }] = await db.select({ total: count() }).from(users).where(where);
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      employeeCode: users.employeeCode,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
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

export async function getUserById(db: AppDb, id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getActiveAdminCount(db: AppDb) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.isActive, true), isNull(users.deletedAt)));

  return total;
}

export async function createUser(db: AppDb, actorId: string, input: CreateUserInput) {
  const [row] = await db
    .insert(users)
    .values({
      ...input,
      avatarUrl: input.avatarUrl || null,
      passwordHash: await hash(input.password, 10),
    })
    .returning();

  await writeAuditLog(db, {
    userId: actorId,
    action: "create",
    entity: "users",
    entityId: row.id,
    newData: { email: row.email, role: row.role },
  });

  return row;
}

export async function updateUser(db: AppDb, actorId: string, id: string, input: UpdateUserInput) {
  const existing = await getUserById(db, id);

  if (!existing) {
    return null;
  }

  const updates: Partial<typeof users.$inferInsert> = {
    name: input.name,
    email: input.email,
    role: input.role,
    employeeCode: input.employeeCode,
    avatarUrl: input.avatarUrl || null,
    phone: input.phone || null,
    address: input.address || null,
    preferredLanguage: input.preferredLanguage,
    themePreference: input.themePreference,
    isActive: input.isActive,
    updatedAt: new Date(),
  };

  if (input.password) {
    updates.passwordHash = await hash(input.password, 10);
  }

  const [row] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

  await writeAuditLog(db, {
    userId: actorId,
    action: "update",
    entity: "users",
    entityId: id,
    oldData: { email: existing.email, role: existing.role, isActive: existing.isActive },
    newData: { email: row.email, role: row.role, isActive: row.isActive },
  });

  return row;
}

export async function setUserActive(db: AppDb, actorId: string, id: string, isActive: boolean) {
  const [row] = await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (row) {
    await writeAuditLog(db, {
      userId: actorId,
      action: isActive ? "activate" : "deactivate",
      entity: "users",
      entityId: id,
      newData: { isActive },
    });
  }

  return row;
}

export async function softDeleteUser(db: AppDb, actorId: string, id: string) {
  const [row] = await db
    .update(users)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(and(eq(users.id, id), ne(users.id, actorId)))
    .returning();

  if (row) {
    await writeAuditLog(db, {
      userId: actorId,
      action: "delete",
      entity: "users",
      entityId: id,
      oldData: { email: row.email, role: row.role },
    });
  }

  return row;
}
