"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { STUDENT_ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABEL } from "@/core/constants/attendance";
import type { ApiResponse } from "@/core/http/api-response";
import {
  classAttendanceSchema,
  type ClassAttendanceFormValues,
  type ClassAttendanceInput,
} from "@/core/validation/attendance";

export function ClassAttendanceForm({
  classId,
  attendanceDate,
  students,
}: {
  classId: string;
  attendanceDate: string;
  students: Array<{
    id: string;
    nis: string;
    name: string;
    status: ClassAttendanceInput["details"][number]["status"];
    notes: string;
  }>;
}) {
  const router = useRouter();
  const form = useForm<ClassAttendanceFormValues, unknown, ClassAttendanceInput>({
    resolver: zodResolver(classAttendanceSchema),
    defaultValues: {
      classId,
      attendanceDate,
      notes: "",
      details: students.map((student) => ({
        studentId: student.id,
        status: student.status,
        notes: student.notes,
      })),
    },
  });

  async function onSubmit(values: ClassAttendanceInput) {
    const response = await fetch("/api/attendance/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<{ sessionId: string }> | null;

    if (!response.ok || !payload?.ok) {
      toast.error(payload?.message ?? "Absensi gagal disimpan.");
      return;
    }

    toast.success(payload.message ?? "Absensi berhasil disimpan.");
    router.refresh();
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
        Belum ada siswa aktif di kelas ini.
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
            <tr>
              <th className="py-2 pr-3">NIS</th>
              <th className="py-2 pr-3">Nama</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="py-3 pr-3 font-medium text-stone-800">{student.nis}</td>
                <td className="py-3 pr-3 text-stone-900">{student.name}</td>
                <td className="py-3 pr-3">
                  <input type="hidden" {...form.register(`details.${index}.studentId`)} />
                  <select
                    className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    {...form.register(`details.${index}.status`)}
                  >
                    {STUDENT_ATTENDANCE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {ATTENDANCE_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-3">
                  <input
                    className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Opsional"
                    {...form.register(`details.${index}.notes`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          disabled={form.formState.isSubmitting}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan absensi"}
        </button>
      </div>
    </form>
  );
}
