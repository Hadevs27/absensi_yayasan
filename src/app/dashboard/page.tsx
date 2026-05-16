import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/stat-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { getAdminDashboardData, getUserDashboardData } from "@/features/dashboard/services/dashboard-service";
import { requireSession } from "@/lib/auth";
import { formatDateId } from "@/lib/date";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const db = getDb();

  if (session.role === "user") {
    const dashboard = await getUserDashboardData(db, session.userId);

    return (
      <AppShell session={session}>
        <section className="space-y-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">{formatDateId(dashboard.today)}</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Dashboard wali kelas</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Siswa kelas saya" value={dashboard.stats.totalStudents} />
            <StatTile label="Hadir hari ini" value={dashboard.stats.presentToday} tone="sky" />
            <StatTile label="Terlambat" value={dashboard.stats.lateToday} tone="amber" />
            <StatTile label="Belum diabsen" value={dashboard.stats.notRecorded} tone="rose" />
          </div>

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-base font-semibold text-stone-950">Siswa yang belum diabsen</h2>
            {dashboard.notRecordedStudents.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Semua siswa di kelas Anda sudah memiliki catatan absensi hari ini.
              </p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {dashboard.notRecordedStudents.map((student) => (
                  <div key={student.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                    <p className="text-sm font-semibold text-stone-900">{student.name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </AppShell>
    );
  }

  const dashboard = await getAdminDashboardData(db);

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">{formatDateId(dashboard.today)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Dashboard statistik</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total siswa" value={dashboard.stats.totalStudents} />
          <StatTile label="Hadir hari ini" value={dashboard.stats.presentToday} tone="sky" />
          <StatTile label="Terlambat" value={dashboard.stats.lateToday} tone="amber" />
          <StatTile label="Alfa" value={dashboard.stats.absentToday} tone="rose" />
        </div>

        {dashboard.trend.length === 0 && dashboard.clusterSummary.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Data analytics belum tersedia"
            description="Jalankan seed atau input absensi siswa untuk menampilkan grafik dan cluster."
          />
        ) : (
          <DashboardCharts trend={dashboard.trend} clusterSummary={dashboard.clusterSummary} />
        )}
      </section>
    </AppShell>
  );
}
