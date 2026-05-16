"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";
import { loginSchema, type LoginInput } from "@/core/validation/auth";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@absensi.test",
      password: "admin123",
      next: nextPath,
    },
  });

  async function onSubmit(values: LoginInput) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        next: nextPath,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<{ redirectTo: string }>
      | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Login gagal.");
      return;
    }

    toast.success("Login berhasil.");
    router.replace(payload.data.redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">Sistem Absensi</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Masuk akun</h1>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Email</span>
        <input
          type="email"
          {...form.register("email")}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          autoComplete="email"
        />
        {form.formState.errors.email ? (
          <span className="mt-1 block text-xs font-medium text-red-600">
            {form.formState.errors.email.message}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Password</span>
        <input
          type="password"
          {...form.register("password")}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          autoComplete="current-password"
        />
        {form.formState.errors.password ? (
          <span className="mt-1 block text-xs font-medium text-red-600">
            {form.formState.errors.password.message}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
