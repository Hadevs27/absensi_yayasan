"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";
import { preferencesSchema, type PreferencesInput } from "@/core/validation/user";

export function PreferencesForm({ defaultValues }: { defaultValues: PreferencesInput }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const form = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues,
  });

  async function onSubmit(values: PreferencesInput) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, type: "preferences" }),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Preferensi gagal disimpan.");
      return;
    }

    setTheme(values.themePreference);
    toast.success(payload.message ?? "Preferensi berhasil disimpan.");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Bahasa</span>
        <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("preferredLanguage")}>
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Tema</span>
        <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("themePreference")}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
        <Save className="h-4 w-4" />
        Simpan preferensi
      </button>
    </form>
  );
}
