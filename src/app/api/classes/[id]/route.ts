import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { classSchema } from "@/core/validation/master-data";
import { getDb } from "@/db/db";
import { classes } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  const parsed = classSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input kelas tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const [row] = await db
    .update(classes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(classes.id, id))
    .returning();

  if (!row) {
    return apiFail("Kelas tidak ditemukan.", 404);
  }

  return apiOk(row, "Kelas berhasil diperbarui.");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  await getDb().delete(classes).where(eq(classes.id, id));

  return apiOk({ id }, "Kelas berhasil dihapus.");
}
