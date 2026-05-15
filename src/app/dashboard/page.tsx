import { desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/stat-tile";
import { getDb } from "@/db/db";
import { attendanceRecords, clusterResults, clusterRuns, users } from "@/db/schema";
import { statusLabels } from "@/lib/attendance";
import { requireSession } from "@/lib/auth";
import { formatDateId, getTodayInJakarta } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const db = getDb();
  const today = getTodayInJakarta();

  const [allUsers, todayRecords, latestRuns] = await Promise.all([
    db.select().from(users),
    db.select().from(attendanceRecords).where(eq(attendanceRecords.workDate, today)),
    db.select().from(clusterRuns).orderBy(desc(clusterRuns.createdAt)).limit(1),
  ]);

  const latestRun = latestRuns[0];
  const latestResults = latestRun
    ? await db.select().from(clusterResults).where(eq(clusterResults.runId, latestRun.id))
    : [];

  const hadirHariIni = todayRecords.filter(
    (record) => record.status === "present" || record.status === "late",
  ).length;
  const terlambatHariIni = todayRecords.filter((record) => record.status === "late").length;
  const clusterLabels = new Set(latestResults.map((result) => result.label));

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">{formatDateId(today)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Dashboard statistik</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total pengguna" value={allUsers.filter((user) => user.role === "user").length} />
          <StatTile label="Hadir hari ini" value={hadirHariIni} tone="sky" />
          <StatTile label="Terlambat" value={terlambatHariIni} tone="amber" />
          <StatTile label="Cluster aktif" value={clusterLabels.size || "-"} tone="rose" />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-base font-semibold text-stone-950">Absensi hari ini</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Pengguna</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {todayRecords.length === 0 ? (
                    <tr>
                      <td className="py-4 text-stone-500" colSpan={3}>
                        Belum ada absensi hari ini.
                      </td>
                    </tr>
                  ) : (
                    todayRecords.map((record) => {
                      const user = allUsers.find((item) => item.id === record.userId);
                      return (
                        <tr key={record.id}>
                          <td className="py-3 pr-3 font-medium text-stone-800">{user?.name ?? "-"}</td>
                          <td className="py-3 pr-3">{statusLabels[record.status]}</td>
                          <td className="py-3 pr-3 text-stone-600">
                            {record.checkInAt
                              ? record.checkInAt.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Jakarta",
                                })
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-base font-semibold text-stone-950">Cluster terakhir</h2>
            <div className="mt-4 space-y-3">
              {!latestRun ? (
                <p className="text-sm text-stone-500">Analisis K-Means belum pernah dijalankan.</p>
              ) : (
                <>
                  <p className="text-sm text-stone-600">
                    Periode {formatDateId(latestRun.startDate)} - {formatDateId(latestRun.endDate)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Array.from(clusterLabels).map((label) => (
                      <div key={label} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                        <p className="text-sm font-semibold text-stone-900">{label}</p>
                        <p className="mt-1 text-sm text-stone-600">
                          {latestResults.filter((result) => result.label === label).length} pengguna
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
