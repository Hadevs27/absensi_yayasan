import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { getDb } from "@/db/db";
import { attendanceSessions } from "@/db/schema";
import { writeAuditLog } from "@/features/audit/services/audit-service";
import { getCurrentSession } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  const db = getDb();
  const [row] = await db
    .update(attendanceSessions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(attendanceSessions.id, id))
    .returning();

  if (!row) {
    return apiFail("Absensi tidak ditemukan.", 404);
  }

  await writeAuditLog(db, {
    userId: session.userId,
    action: "delete",
    entity: "attendance_sessions",
    entityId: id,
  });

  return apiOk({ id }, "Absensi berhasil dihapus.");
}
