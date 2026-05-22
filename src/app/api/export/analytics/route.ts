import { desc, eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { getDb } from "@/db/db";
import { classes, clusteringResults, clusterRuns, students } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { toSimplePdf } from "@/lib/export";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return new Response("Akses admin diperlukan.", { status: 403 });
  }

  const db = getDb();
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const [latestRun] = await db.select().from(clusterRuns).orderBy(desc(clusterRuns.createdAt)).limit(1);
  const rows = latestRun
    ? await db
        .select({
          nis: students.nis,
          name: students.name,
          className: classes.name,
          label: clusteringResults.clusterLabel,
          hadir: clusteringResults.totalHadir,
          terlambat: clusteringResults.totalTerlambat,
          alfa: clusteringResults.totalAlfa,
          izin: clusteringResults.totalIzin,
        })
        .from(clusteringResults)
        .innerJoin(students, eq(clusteringResults.studentId, students.id))
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(eq(clusteringResults.runId, latestRun.id))
    : [];
  const header = ["NIS", "Nama", "Kelas", "Cluster", "Hadir", "Terlambat", "Alfa", "Izin"];
  const body = rows.map((row) => [
    row.nis,
    row.name,
    row.className ?? "-",
    row.label,
    row.hadir,
    row.terlambat,
    row.alfa,
    row.izin,
  ]);

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-analytics.xlsx"',
      },
    });
  }

  if (format === "pdf") {
    return new Response(toSimplePdf("Laporan Analytics", [header.join(" | "), ...body.map((row) => row.join(" | "))]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="laporan-analytics.pdf"',
      },
    });
  }

  return new Response([header.map(csvCell).join(","), ...body.map((row) => row.map(csvCell).join(","))].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="laporan-analytics.csv"',
    },
  });
}
