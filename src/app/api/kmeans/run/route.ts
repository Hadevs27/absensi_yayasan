import { and, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/db";
import { attendanceRecords, clusterResults, clusterRuns, users } from "@/db/schema";
import { addStatus, emptyMetrics, isDateOnly } from "@/lib/attendance";
import { getCurrentSession } from "@/lib/auth";
import { runKMeans, type KMeansPoint } from "@/lib/kmeans";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Akses admin diperlukan." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { startDate?: unknown; endDate?: unknown; k?: unknown }
    | null;

  if (!isDateOnly(body?.startDate) || !isDateOnly(body?.endDate)) {
    return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
  }

  const k = Number(body?.k ?? 3);

  if (!Number.isInteger(k) || k < 2 || k > 5) {
    return NextResponse.json({ message: "Nilai K harus 2 sampai 5." }, { status: 400 });
  }

  const db = getDb();
  const employees = await db.select().from(users).where(eq(users.role, "user"));
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        gte(attendanceRecords.workDate, body.startDate),
        lte(attendanceRecords.workDate, body.endDate),
      ),
    );

  const metricsByUser = new Map(employees.map((employee) => [employee.id, emptyMetrics()]));

  for (const record of records) {
    const metrics = metricsByUser.get(record.userId);

    if (metrics) {
      addStatus(metrics, record.status);
    }
  }

  const points: KMeansPoint[] = employees.map((employee) => ({
    userId: employee.id,
    name: employee.name,
    metrics: metricsByUser.get(employee.id) ?? emptyMetrics(),
  }));

  if (points.length < 2) {
    return NextResponse.json(
      { message: "Minimal dua user diperlukan untuk analisis K-Means." },
      { status: 400 },
    );
  }

  const result = runKMeans(points, k);
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

  await db.insert(clusterResults).values(
    result.assignments.map((assignment) => ({
      runId: run.id,
      userId: assignment.userId,
      clusterIndex: assignment.clusterIndex,
      label: assignment.label,
      metrics: assignment.metrics,
    })),
  );

  return NextResponse.json({
    message: `Analisis selesai untuk ${result.assignments.length} pengguna.`,
    runId: run.id,
  });
}
