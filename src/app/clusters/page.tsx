import { desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { RunKMeansForm } from "@/components/run-kmeans-form";
import { getDb } from "@/db/db";
import { classes, clusteringResults, clusterRuns, students } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDateId } from "@/lib/date";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClustersPage() {
  const session = await requireAdmin();
  const db = getDb();
  const [latestRun] = await db.select().from(clusterRuns).orderBy(desc(clusterRuns.createdAt)).limit(1);

  const rows = latestRun
    ? await db
        .select({
          id: clusteringResults.id,
          studentName: students.name,
          nis: students.nis,
          className: classes.name,
          label: clusteringResults.clusterLabel,
          clusterIndex: clusteringResults.clusterIndex,
          totalHadir: clusteringResults.totalHadir,
          totalTerlambat: clusteringResults.totalTerlambat,
          totalIzin: clusteringResults.totalIzin,
          totalAlfa: clusteringResults.totalAlfa,
        })
        .from(clusteringResults)
        .innerJoin(students, eq(clusteringResults.studentId, students.id))
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(eq(clusteringResults.runId, latestRun.id))
    : [];

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Analisis pola kehadiran</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">K-Means clustering</h1>
        </div>

        <RunKMeansForm />

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-stone-950">Hasil terakhir</h2>
            {latestRun ? (
              <p className="text-sm text-stone-500">
                {formatDateId(latestRun.startDate)} - {formatDateId(latestRun.endDate)} | K={latestRun.k}
                {latestRun.silhouetteScore === null
                  ? ""
                  : ` | Silhouette ${latestRun.silhouetteScore.toFixed(2)}`}
              </p>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <tr>
                  <th className="py-2 pr-3">Pengguna</th>
                  <th className="py-2 pr-3">Cluster</th>
                  <th className="py-2 pr-3">Label</th>
                  <th className="py-2 pr-3">Hadir</th>
                  <th className="py-2 pr-3">Terlambat</th>
                  <th className="py-2 pr-3">Izin/Sakit/Cuti</th>
                  <th className="py-2 pr-3">Alfa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.length === 0 ? null : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-stone-900">{row.studentName}</p>
                        <p className="text-xs text-stone-500">
                          {row.nis} | {row.className ?? "-"}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-stone-700">{row.clusterIndex + 1}</td>
                      <td className="py-3 pr-3 font-semibold text-emerald-800">{row.label}</td>
                      <td className="py-3 pr-3 text-stone-700">{row.totalHadir}</td>
                      <td className="py-3 pr-3 text-stone-700">{row.totalTerlambat}</td>
                      <td className="py-3 pr-3 text-stone-700">{row.totalIzin}</td>
                      <td className="py-3 pr-3 text-stone-700">{row.totalAlfa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={BarChart3}
                title="Belum ada hasil clustering"
                description="Jalankan analisis untuk melihat pengelompokan kedisiplinan siswa."
              />
            </div>
          ) : null}
        </section>
      </section>
    </AppShell>
  );
}
