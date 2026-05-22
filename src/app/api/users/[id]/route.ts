import { apiFail, apiOk } from "@/core/http/api-response";
import { updateUserSchema } from "@/core/validation/user";
import { getDb } from "@/db/db";
import {
  getActiveAdminCount,
  getUserById,
  softDeleteUser,
  updateUser,
} from "@/features/users/services/user-service";
import { getCurrentSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input user tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const existing = await getUserById(db, id);

  if (!existing) {
    return apiFail("User tidak ditemukan.", 404);
  }

  if (existing.role === "admin" && parsed.data.role !== "admin" && (await getActiveAdminCount(db)) <= 1) {
    return apiFail("Minimal harus ada 1 admin aktif.", 409);
  }

  if (existing.role === "admin" && parsed.data.isActive === false && (await getActiveAdminCount(db)) <= 1) {
    return apiFail("Minimal harus ada 1 admin aktif.", 409);
  }

  const row = await updateUser(db, session.userId, id, parsed.data);

  return apiOk(row, "User berhasil diperbarui.");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;

  if (id === session.userId) {
    return apiFail("Admin tidak boleh menghapus dirinya sendiri.", 409);
  }

  const db = getDb();
  const existing = await getUserById(db, id);

  if (!existing) {
    return apiFail("User tidak ditemukan.", 404);
  }

  if (existing.role === "admin" && (await getActiveAdminCount(db)) <= 1) {
    return apiFail("Minimal harus ada 1 admin aktif.", 409);
  }

  const row = await softDeleteUser(db, session.userId, id);

  if (!row) {
    return apiFail("User gagal dihapus.", 400);
  }

  return apiOk({ id }, "User berhasil dihapus.");
}
