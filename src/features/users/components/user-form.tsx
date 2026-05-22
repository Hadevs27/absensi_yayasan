"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import type { ApiResponse } from "@/core/http/api-response";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/core/validation/user";

type UserFormValues = CreateUserInput | UpdateUserInput;

export function UserForm({
  mode,
  userId,
  defaultValues,
}: {
  mode: "create" | "edit";
  userId?: string;
  defaultValues?: Partial<UpdateUserInput>;
}) {
  const router = useRouter();
  const schema = mode === "create" ? createUserSchema : updateUserSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: "",
      role: defaultValues?.role ?? "user",
      employeeCode: defaultValues?.employeeCode ?? "",
      avatarUrl: defaultValues?.avatarUrl ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      preferredLanguage: defaultValues?.preferredLanguage ?? "id",
      themePreference: defaultValues?.themePreference ?? "system",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(values: Record<string, unknown>) {
    const parsedValues = schema.parse(values);
    const response = await fetch(mode === "create" ? "/api/users" : `/api/users/${userId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedValues),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "User gagal disimpan.");
      return;
    }

    toast.success(payload.message ?? "User berhasil disimpan.");
    router.push("/dashboard/users");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("name")} />
          {form.formState.errors.name ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input type="email" className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("email")} />
          {form.formState.errors.email ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.email.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Password {mode === "edit" ? "(kosongkan jika tidak diganti)" : ""}</span>
          <input type="password" className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("password")} />
          {form.formState.errors.password ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.password.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Role</span>
          <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("role")}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Kode user</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("employeeCode")} />
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
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-emerald-700" {...form.register("isActive")} />
          <span className="text-sm font-medium text-stone-700">User aktif</span>
        </label>
      </div>
      <button disabled={form.formState.isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        <Save className="h-4 w-4" />
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan user"}
      </button>
    </form>
  );
}
