import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { changePasswordSchema } from "@/core/validation/user";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/features/audit/services/audit-service";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return apiFail("Sesi tidak valid.", 401);
  }

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input password tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });

  if (!user || !(await compare(parsed.data.oldPassword, user.passwordHash))) {
    return apiFail("Password lama tidak sesuai.", 400);
  }

  await db
    .update(users)
    .set({ passwordHash: await hash(parsed.data.newPassword, 10), updatedAt: new Date() })
    .where(eq(users.id, session.userId));
  await writeAuditLog(db, {
    userId: session.userId,
    action: "update",
    entity: "profile_security",
    entityId: session.userId,
  });

  return apiOk({ id: session.userId }, "Password berhasil diganti.");
}
