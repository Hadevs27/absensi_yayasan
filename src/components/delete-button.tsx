"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";

export function DeleteButton({
  endpoint,
  label = "Hapus",
  confirmMessage = "Hapus data ini?",
}: {
  endpoint: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Data gagal dihapus.");
      return;
    }

    toast.success(payload.message ?? "Data berhasil dihapus.");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "..." : label}
    </button>
  );
}
