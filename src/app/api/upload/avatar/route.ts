import { put } from "@vercel/blob";
import { apiFail, apiOk } from "@/core/http/api-response";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return apiFail("Sesi tidak valid.", 401);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return apiFail("BLOB_READ_WRITE_TOKEN belum dikonfigurasi.", 500);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiFail("File avatar wajib diunggah.", 400);
  }

  if (!file.type.startsWith("image/")) {
    return apiFail("Avatar harus berupa gambar.", 400);
  }

  const extension = file.name.split(".").pop() || "png";
  const blob = await put(`avatars/${session.userId}-${Date.now()}.${extension}`, file, {
    access: "public",
  });

  return apiOk({ url: blob.url }, "Avatar berhasil diunggah.");
}
