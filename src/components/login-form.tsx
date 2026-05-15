"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@absensi.test");
  const [password, setPassword] = useState("admin123");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        next: nextPath,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string; redirectTo?: string }
      | null;

    setLoading(false);

    if (!response.ok) {
      setMessage(payload?.message ?? "Login gagal.");
      return;
    }

    router.replace(payload?.redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">Sistem Absensi</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Masuk akun</h1>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          autoComplete="current-password"
        />
      </label>

      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
