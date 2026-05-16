import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { classSchema } from "@/core/validation/master-data";
import { getDb } from "@/db/db";
import { classes } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const parsed = classSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input kelas tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const [row] = await db.insert(classes).values(parsed.data).returning();

  return apiOk(row, "Kelas berhasil dibuat.");
}
