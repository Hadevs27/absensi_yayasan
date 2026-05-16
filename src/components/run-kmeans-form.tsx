"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";

export function RunKMeansForm() {
  const router = useRouter();
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);

  const [start, setStart] = useState(startDate.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(end);
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/kmeans/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start, endDate, k }),
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<{ runId: string }>
      | null;
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Analisis gagal.");
      return;
    }

    toast.success(payload.message ?? "Analisis selesai.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-[1fr_1fr_100px_auto] md:items-end">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Mulai</span>
        <input
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Selesai</span>
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">K</span>
        <input
          type="number"
          min="2"
          max="5"
          value={k}
          onChange={(event) => setK(Number(event.target.value))}
          className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60 md:w-auto"
        >
          <Play className="h-4 w-4" />
          {loading ? "Jalan..." : "Jalankan"}
        </button>
      </div>
    </form>
  );
}
