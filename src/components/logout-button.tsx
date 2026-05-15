"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-red-300 hover:text-red-700 disabled:opacity-60"
      aria-label="Keluar"
      title="Keluar"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
