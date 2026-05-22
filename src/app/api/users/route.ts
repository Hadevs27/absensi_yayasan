import { apiFail, apiOk } from "@/core/http/api-response";
import { createUserSchema } from "@/core/validation/user";
import { getDb } from "@/db/db";
import { createUser } from "@/features/users/services/user-service";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input user tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const row = await createUser(getDb(), session.userId, parsed.data);

  return apiOk(row, "User berhasil dibuat.");
}
