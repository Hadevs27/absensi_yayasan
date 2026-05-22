"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";
import { changePasswordSchema, type ChangePasswordInput } from "@/core/validation/user";

export function SecurityForm() {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordInput) {
    const response = await fetch("/api/profile/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Password gagal diganti.");
      return;
    }

    toast.success(payload.message ?? "Password berhasil diganti.");
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      {(["oldPassword", "newPassword", "confirmPassword"] as const).map((field) => (
        <label key={field} className="block">
          <span className="text-sm font-medium text-stone-700">
            {field === "oldPassword" ? "Password lama" : field === "newPassword" ? "Password baru" : "Konfirmasi password"}
          </span>
          <input type="password" className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register(field)} />
          {form.formState.errors[field] ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors[field]?.message}</span> : null}
        </label>
      ))}
      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
        <KeyRound className="h-4 w-4" />
        Ganti password
      </button>
    </form>
  );
}
