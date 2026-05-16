import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { ClassAttendanceForm } from "@/features/attendance/components/class-attendance-form";
import {
  getAccessibleClasses,
  getClassAttendanceEntry,
} from "@/features/attendance/services/class-attendance-service";
import { requireSession } from "@/lib/auth";
import { formatDateId, getTodayInJakarta } from "@/lib/date";
import { CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const db = getDb();
  const classOptions = await getAccessibleClasses(db, session);
  const attendanceDate = params.date?.match(/^\d{4}-\d{2}-\d{2}$/)
    ? params.date
    : getTodayInJakarta();
  const selectedClassId = params.classId ?? classOptions[0]?.id;
  const selectedClass = classOptions.find((item) => item.id === selectedClassId);
  const entry = selectedClassId
    ? await getClassAttendanceEntry(db, { classId: selectedClassId, attendanceDate })
    : null;

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">{formatDateId(attendanceDate)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Absensi harian siswa</h1>
        </div>

        {classOptions.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Belum ada kelas yang dapat diabsen"
            description="Admin perlu membuat kelas dan mengassign wali kelas terlebih dahulu."
          />
        ) : (
          <>
            <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-[1fr_220px_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Kelas</span>
                <select
                  name="classId"
                  defaultValue={selectedClassId}
                  className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {classOptions.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.academicYear})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Tanggal</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={attendanceDate}
                  className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <button className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
                Tampilkan
              </button>
            </form>

            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-stone-950">
                    {selectedClass?.name ?? "Kelas"} - {selectedClass?.academicYear ?? ""}
                  </h2>
                  <p className="text-sm text-stone-500">
                    {entry?.session ? "Absensi sudah pernah disimpan dan dapat diedit." : "Absensi belum disimpan."}
                  </p>
                </div>
                <Link href="/reports" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  Lihat rekap
                </Link>
              </div>
            </section>

            {selectedClassId && entry ? (
              <ClassAttendanceForm
                classId={selectedClassId}
                attendanceDate={attendanceDate}
                students={entry.students}
              />
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  );
}
