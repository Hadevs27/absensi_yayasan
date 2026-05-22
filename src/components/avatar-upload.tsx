"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";

export function AvatarUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setLoading(true);
    const response = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<{ url: string }> | null;
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Avatar gagal diunggah.");
      return;
    }

    onUploaded(payload.data.url);
    toast.success(payload.message ?? "Avatar berhasil diunggah.");
  }

  return (
    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
      <Upload className="h-4 w-4" />
      {loading ? "Mengunggah..." : "Upload avatar"}
      <input type="file" accept="image/*" className="sr-only" onChange={onChange} disabled={loading} />
    </label>
  );
}
