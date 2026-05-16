import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { studentSchema } from "@/core/validation/master-data";
import { getDb } from "@/db/db";
import { students } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  const parsed = studentSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input siswa tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const [row] = await getDb()
    .update(students)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();

  if (!row) {
    return apiFail("Siswa tidak ditemukan.", 404);
  }

  return apiOk(row, "Siswa berhasil diperbarui.");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  await getDb().delete(students).where(eq(students.id, id));

  return apiOk({ id }, "Siswa berhasil dihapus.");
}
