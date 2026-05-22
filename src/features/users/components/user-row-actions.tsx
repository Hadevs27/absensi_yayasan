"use client";

import { KeyRound, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";

export function UserRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function post(endpoint: string, successFallback: string, body?: unknown) {
    setLoading(true);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Aksi gagal.");
      return;
    }

    toast.success(payload.message ?? successFallback);
    router.refresh();
  }

  function resetPassword() {
    const password = window.prompt("Password baru minimal 6 karakter");

    if (!password) {
      return;
    }

    void post(`/api/users/${id}/reset-password`, "Password berhasil direset.", { password });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => post(`/api/users/${id}/${isActive ? "deactivate" : "activate"}`, "Status user diperbarui.")}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
      >
        {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={resetPassword}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
      >
        <KeyRound className="h-4 w-4" />
        Reset
      </button>
    </div>
  );
}
