import { apiFail, apiOk } from "@/core/http/api-response";
import { getDb } from "@/db/db";
import {
  getActiveAdminCount,
  getUserById,
  setUserActive,
} from "@/features/users/services/user-service";
import { getCurrentSession } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;

  if (id === session.userId) {
    return apiFail("Admin tidak boleh menonaktifkan dirinya sendiri.", 409);
  }

  const db = getDb();
  const existing = await getUserById(db, id);

  if (!existing) {
    return apiFail("User tidak ditemukan.", 404);
  }

  if (existing.role === "admin" && (await getActiveAdminCount(db)) <= 1) {
    return apiFail("Minimal harus ada 1 admin aktif.", 409);
  }

  const row = await setUserActive(db, session.userId, id, false);

  return apiOk(row, "User berhasil dinonaktifkan.");
}
