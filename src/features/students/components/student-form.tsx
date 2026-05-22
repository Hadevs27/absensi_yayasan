"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";
import type { ApiResponse } from "@/core/http/api-response";
import { studentSchema, type StudentFormValues, type StudentInput } from "@/core/validation/master-data";

export function StudentForm({
  mode,
  studentId,
  defaultValues,
  classes,
}: {
  mode: "create" | "edit";
  studentId?: string;
  defaultValues?: Partial<StudentInput>;
  classes: Array<{ id: string; name: string; academicYear: string }>;
}) {
  const router = useRouter();
  const form = useForm<StudentFormValues, unknown, StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nis: defaultValues?.nis ?? "",
      name: defaultValues?.name ?? "",
      gender: defaultValues?.gender ?? null,
      birthDate: defaultValues?.birthDate ?? null,
      address: defaultValues?.address ?? "",
      parentName: defaultValues?.parentName ?? "",
      phone: defaultValues?.phone ?? "",
      classId: defaultValues?.classId ?? "",
      avatarUrl: defaultValues?.avatarUrl ?? "",
      guardianName: defaultValues?.guardianName ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(values: StudentInput) {
    const response = await fetch(mode === "create" ? "/api/students" : `/api/students/${studentId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Siswa gagal disimpan.");
      return;
    }

    toast.success(payload.message ?? "Siswa berhasil disimpan.");
    router.push("/students");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-stone-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">NIS</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("nis")} />
          {form.formState.errors.nis ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.nis.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama siswa</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("name")} />
          {form.formState.errors.name ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Jenis kelamin</span>
          <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("gender")}>
            <option value="">Belum diisi</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Tanggal lahir</span>
          <input type="date" className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("birthDate")} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Kelas</span>
          <select className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("classId")}>
            <option value="">Belum diassign</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name} ({classItem.academicYear})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama wali</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("guardianName")} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Nama orang tua</span>
          <input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" {...form.register("parentName")} />
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
          <span className="text-sm font-medium text-stone-700">Siswa aktif</span>
        </label>
      </div>
      <button disabled={form.formState.isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        <Save className="h-4 w-4" />
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan siswa"}
      </button>
    </form>
  );
}
