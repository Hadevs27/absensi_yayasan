import { apiFail, apiOk } from "@/core/http/api-response";
import { studentSchema } from "@/core/validation/master-data";
import { getDb } from "@/db/db";
import { students } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const parsed = studentSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input siswa tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const [row] = await getDb().insert(students).values(parsed.data).returning();

  return apiOk(row, "Siswa berhasil dibuat.");
}
