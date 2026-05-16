import { Download, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ATTENDANCE_STATUS_LABEL, STUDENT_ATTENDANCE_STATUSES } from "@/core/constants/attendance";
import { getDb } from "@/db/db";
import { getClassOptions } from "@/features/students/services/student-service";
import { getAttendanceReportRows } from "@/features/reports/services/attendance-report-service";
import { statusTone } from "@/lib/attendance";
import { requireAdmin } from "@/lib/auth";
import { formatDateId, getTodayInJakarta, toIsoDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; classId?: string; status?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);

  const filters = {
    startDate: params.startDate ?? toIsoDate(start),
    endDate: params.endDate ?? getTodayInJakarta(),
    classId: params.classId || undefined,
    status: params.status || undefined,
  };

  const db = getDb();
  const [rows, classOptions] = await Promise.all([
    getAttendanceReportRows(db, { ...filters, limit: 200 }),
    getClassOptions(db),
  ]);

  const query = new URLSearchParams();
  query.set("startDate", filters.startDate);
  query.set("endDate", filters.endDate);
  if (filters.classId) query.set("classId", filters.classId);
  if (filters.status) query.set("status", filters.status);

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Rekap absensi siswa</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Laporan</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/export/attendance?${query.toString()}&format=csv`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              <Download className="h-4 w-4" />
              CSV
            </a>
            <a href={`/api/export/attendance?${query.toString()}&format=xls`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
              <Download className="h-4 w-4" />
              Excel
            </a>
            <a href={`/api/export/attendance?${query.toString()}&format=pdf`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800">
              <Download className="h-4 w-4" />
              PDF
            </a>
          </div>
        </div>

        <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Mulai</span>
            <input name="startDate" type="date" defaultValue={filters.startDate} className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Selesai</span>
            <input name="endDate" type="date" defaultValue={filters.endDate} className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Kelas</span>
            <select name="classId" defaultValue={filters.classId ?? ""} className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
              <option value="">Semua kelas</option>
              {classOptions.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({classItem.academicYear})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Status</span>
            <select name="status" defaultValue={filters.status ?? ""} className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
              <option value="">Semua status</option>
              {STUDENT_ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ATTENDANCE_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            <Search className="h-4 w-4" />
            Filter
          </button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {rows.length === 0 ? (
            <EmptyState title="Tidak ada data absensi" description="Ubah filter atau input absensi terlebih dahulu." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Tanggal</th>
                    <th className="py-2 pr-3">NIS</th>
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Kelas</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-3 font-medium text-stone-800">{formatDateId(row.attendanceDate)}</td>
                      <td className="py-3 pr-3 text-stone-600">{row.nis}</td>
                      <td className="py-3 pr-3 font-medium text-stone-900">{row.studentName}</td>
                      <td className="py-3 pr-3 text-stone-600">{row.className ?? "-"}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone[row.status]}`}>
                          {ATTENDANCE_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-stone-600">{row.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
