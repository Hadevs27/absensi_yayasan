"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";

export function AttendanceSessionActions({ sessionId, approved }: { sessionId: string; approved: boolean }) {
  const router = useRouter();

  async function run(endpoint: string, method: "POST" | "DELETE", fallback: string) {
    const response = await fetch(endpoint, { method });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Aksi gagal.");
      return;
    }

    toast.success(payload.message ?? fallback);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={approved}
        onClick={() => run(`/api/attendance/sessions/${sessionId}/approve`, "POST", "Absensi disetujui.")}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
      >
        <CheckCircle2 className="h-4 w-4" />
        {approved ? "Disetujui" : "Setujui"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Hapus absensi ini?")) {
            void run(`/api/attendance/sessions/${sessionId}`, "DELETE", "Absensi dihapus.");
          }
        }}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" />
        Hapus
      </button>
    </div>
  );
}
