"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ApiResponse } from "@/core/http/api-response";
import { classSchema, type ClassFormValues, type ClassInput } from "@/core/validation/master-data";

export function ClassForm({
  mode,
  classId,
  defaultValues,
  teachers,
}: {
  mode: "create" | "edit";
  classId?: string;
  defaultValues?: Partial<ClassInput>;
  teachers: Array<{ id: string; name: string; email: string }>;
}) {
  const router = useRouter();
  const form = useForm<ClassFormValues, unknown, ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      level: defaultValues?.level ?? "",
      academicYear: defaultValues?.academicYear ?? "2025/2026",
      homeroomTeacherId: defaultValues?.homeroomTeacherId ?? "",
    },
  });

  async function onSubmit(values: ClassInput) {
    const response = await fetch(mode === "create" ? "/api/classes" : `/api/classes/${classId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Kelas gagal disimpan.");
      return;
    }

    toast.success(payload.message ?? "Kelas berhasil disimpan.");
    router.push("/classes");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama kelas</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("name")} />
          {form.formState.errors.name ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Jenjang</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("level")} />
          {form.formState.errors.level ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.level.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Tahun ajaran</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("academicYear")} />
          {form.formState.errors.academicYear ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.academicYear.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Wali kelas</span>
          <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("homeroomTeacherId")}>
            <option value="">Belum ditentukan</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </label>
      </div>
      <button disabled={form.formState.isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        <Save className="h-4 w-4" />
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan kelas"}
      </button>
    </form>
  );
}
