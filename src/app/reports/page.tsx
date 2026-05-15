import { desc, eq } from "drizzle-orm";
import { Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { attendanceRecords, users } from "@/db/schema";
import { statusLabels, statusTone } from "@/lib/attendance";
import { requireAdmin } from "@/lib/auth";
import { formatDateId, formatDateTimeId, getTodayInJakarta, toIsoDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await requireAdmin();
  const db = getDb();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);
  const exportHref = `/api/export/attendance?startDate=${toIsoDate(startDate)}&endDate=${getTodayInJakarta()}`;

  const rows = await db
    .select({
      id: attendanceRecords.id,
      employeeCode: users.employeeCode,
      name: users.name,
      email: users.email,
      workDate: attendanceRecords.workDate,
      status: attendanceRecords.status,
      checkInAt: attendanceRecords.checkInAt,
      checkOutAt: attendanceRecords.checkOutAt,
    })
    .from(attendanceRecords)
    .innerJoin(users, eq(attendanceRecords.userId, users.id))
    .orderBy(desc(attendanceRecords.workDate))
    .limit(80);

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Rekap absensi</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Laporan</h1>
          </div>
          <a
            href={exportHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <tr>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="py-2 pr-3">Kode</th>
                  <th className="py-2 pr-3">Nama</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Masuk</th>
                  <th className="py-2 pr-3">Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-3 font-medium text-stone-800">{formatDateId(row.workDate)}</td>
                    <td className="py-3 pr-3 text-stone-600">{row.employeeCode}</td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-stone-900">{row.name}</p>
                      <p className="text-xs text-stone-500">{row.email}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone[row.status]}`}>
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(row.checkInAt)}</td>
                    <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(row.checkOutAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
