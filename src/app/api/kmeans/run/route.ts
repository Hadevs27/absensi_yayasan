import { apiFail, apiOk } from "@/core/http/api-response";
import { getDb } from "@/db/db";
import { clusteringResults, clusterRuns } from "@/db/schema";
import {
  getStudentDisciplineDataset,
  runStudentDisciplineClustering,
} from "@/features/analytics/services/student-analytics-service";
import { isDateOnly } from "@/lib/attendance";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return apiFail("Akses admin diperlukan.", 403);
  }

  const body = (await request.json().catch(() => null)) as
    | { startDate?: unknown; endDate?: unknown; k?: unknown }
    | null;

  if (!isDateOnly(body?.startDate) || !isDateOnly(body?.endDate)) {
    return apiFail("Periode tidak valid.", 400);
  }

  const k = Number(body?.k ?? 3);

  if (!Number.isInteger(k) || k < 2 || k > 5) {
    return apiFail("Nilai K harus 2 sampai 5.", 400);
  }

  const db = getDb();
  const dataset = await getStudentDisciplineDataset(db, body.startDate, body.endDate);

  if (dataset.length < 2) {
    return apiFail("Minimal dua siswa aktif diperlukan untuk analisis K-Means.", 400);
  }

  const result = runStudentDisciplineClustering(dataset, k);
  const [run] = await db
    .insert(clusterRuns)
    .values({
      startDate: body.startDate,
      endDate: body.endDate,
      k,
      silhouetteScore: result.silhouetteScore,
      createdBy: session.userId,
    })
    .returning();

  await db.insert(clusteringResults).values(
    result.assignments.map((assignment) => ({
      runId: run.id,
      studentId: assignment.studentId,
      clusterIndex: assignment.clusterIndex,
      clusterLabel: assignment.clusterLabel,
      totalHadir: assignment.metrics.total_hadir,
      totalTerlambat: assignment.metrics.total_terlambat,
      totalAlfa: assignment.metrics.total_alfa,
      totalIzin: assignment.metrics.total_izin,
    })),
  );

  return apiOk({ runId: run.id }, `Analisis selesai untuk ${result.assignments.length} siswa.`);
}
