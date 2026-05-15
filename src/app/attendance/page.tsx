import { and, desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { AttendanceActions } from "@/components/attendance-actions";
import { getDb } from "@/db/db";
import { attendanceRecords } from "@/db/schema";
import { statusLabels, statusTone } from "@/lib/attendance";
import { requireSession } from "@/lib/auth";
import { formatDateId, formatDateTimeId, getTodayInJakarta } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await requireSession();
  const db = getDb();
  const today = getTodayInJakarta();

  const [todayRecord, history] = await Promise.all([
    db.query.attendanceRecords.findFirst({
      where: and(eq(attendanceRecords.userId, session.userId), eq(attendanceRecords.workDate, today)),
    }),
    db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.userId, session.userId))
      .orderBy(desc(attendanceRecords.workDate))
      .limit(12),
  ]);

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">{formatDateId(today)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Absensi masuk/keluar</h1>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-stone-500">Status hari ini</p>
              <p className="mt-1 text-xl font-semibold text-stone-950">
                {todayRecord ? statusLabels[todayRecord.status] : "Belum absen"}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Masuk: {formatDateTimeId(todayRecord?.checkInAt ?? null)} | Keluar:{" "}
                {formatDateTimeId(todayRecord?.checkOutAt ?? null)}
              </p>
            </div>
            <AttendanceActions
              hasCheckedIn={Boolean(todayRecord?.checkInAt)}
              hasCheckedOut={Boolean(todayRecord?.checkOutAt)}
            />
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-base font-semibold text-stone-950">Riwayat terbaru</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <tr>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Masuk</th>
                  <th className="py-2 pr-3">Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {history.map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 pr-3 font-medium text-stone-800">{formatDateId(record.workDate)}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone[record.status]}`}>
                        {statusLabels[record.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(record.checkInAt)}</td>
                    <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(record.checkOutAt)}</td>
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
