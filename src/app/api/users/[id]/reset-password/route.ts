import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { resetPasswordSchema } from "@/core/validation/user";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/features/audit/services/audit-service";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Password tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const { id } = await params;
  const [row] = await getDb()
    .update(users)
    .set({ passwordHash: await hash(parsed.data.password, 10), updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (!row) {
    return apiFail("User tidak ditemukan.", 404);
  }

  await writeAuditLog(getDb(), {
    userId: session.userId,
    action: "reset_password",
    entity: "users",
    entityId: id,
  });

  return apiOk({ id }, "Password user berhasil direset.");
}
