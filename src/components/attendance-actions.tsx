"use client";

import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AttendanceActions({
  hasCheckedIn,
  hasCheckedOut,
}: {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<"in" | "out" | null>(null);

  async function submit(kind: "in" | "out") {
    setLoading(kind);
    setMessage("");

    const response = await fetch(kind === "in" ? "/api/attendance/check-in" : "/api/attendance/check-out", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setLoading(null);
    setMessage(payload?.message ?? (response.ok ? "Absensi tersimpan." : "Absensi gagal."));

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submit("in")}
          disabled={hasCheckedIn || loading !== null}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <LogIn className="h-4 w-4" />
          Absen Masuk
        </button>

        <button
          type="button"
          onClick={() => submit("out")}
          disabled={!hasCheckedIn || hasCheckedOut || loading !== null}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <LogOut className="h-4 w-4" />
          Absen Keluar
        </button>
      </div>

      {message ? <p className="text-sm font-medium text-stone-700">{message}</p> : null}
    </div>
  );
}
