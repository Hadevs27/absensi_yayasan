import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { getDb } from "@/db/db";
import { classes, students } from "@/db/schema";
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

  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const rows = await getDb()
    .select({
      nis: students.nis,
      name: students.name,
      gender: students.gender,
      className: classes.name,
      parentName: students.parentName,
      phone: students.phone,
      isActive: students.isActive,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id));
  const header = ["NIS", "Nama", "Gender", "Kelas", "Orang Tua", "Telepon", "Status"];
  const body = rows.map((row) => [
    row.nis,
    row.name,
    row.gender ?? "-",
    row.className ?? "-",
    row.parentName ?? "-",
    row.phone ?? "-",
    row.isActive ? "Aktif" : "Nonaktif",
  ]);

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-siswa.xlsx"',
      },
    });
  }

  if (format === "pdf") {
    return new Response(toSimplePdf("Laporan Siswa", [header.join(" | "), ...body.map((row) => row.join(" | "))]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="laporan-siswa.pdf"',
      },
    });
  }

  return new Response([header.map(csvCell).join(","), ...body.map((row) => row.map(csvCell).join(","))].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="laporan-siswa.csv"',
    },
  });
}
