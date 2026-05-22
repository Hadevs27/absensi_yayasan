"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import type { ApiResponse } from "@/core/http/api-response";
import { profileSchema, type ProfileInput } from "@/core/validation/user";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const router = useRouter();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileInput) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Profil gagal disimpan.");
      return;
    }

    toast.success(payload.message ?? "Profil berhasil disimpan.");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("name")} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Telepon</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("phone")} />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-stone-700">Avatar URL</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("avatarUrl")} />
          <div className="mt-2">
            <AvatarUpload onUploaded={(url) => form.setValue("avatarUrl", url, { shouldDirty: true })} />
          </div>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-stone-700">Alamat</span>
          <textarea className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("address")} />
        </label>
      </div>
      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
        <Save className="h-4 w-4" />
        Simpan profil
      </button>
    </form>
  );
}
