import { apiFail, apiOk } from "@/core/http/api-response";
import { getDb } from "@/db/db";
import { setUserActive } from "@/features/users/services/user-service";
import { getCurrentSession } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const { id } = await params;
  const row = await setUserActive(getDb(), session.userId, id, true);

  if (!row) {
    return apiFail("User tidak ditemukan.", 404);
  }

  return apiOk(row, "User berhasil diaktifkan.");
}
