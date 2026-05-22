import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { profileSchema, preferencesSchema } from "@/core/validation/user";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/features/audit/services/audit-service";
import { getCurrentSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return apiFail("Sesi tidak valid.", 401);
  }

  const body = await request.json().catch(() => null);
  const schema = body?.type === "preferences" ? preferencesSchema : profileSchema;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return apiFail("Input profil tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const [row] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.userId))
    .returning();

  await writeAuditLog(db, {
    userId: session.userId,
    action: "update",
    entity: "profile",
    entityId: session.userId,
    newData: parsed.data,
  });

  return apiOk(row, "Profil berhasil diperbarui.");
}
