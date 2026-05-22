import { getDb } from "@/db/db";
import { getAttendanceReportRows } from "@/features/reports/services/attendance-report-service";
import { ATTENDANCE_STATUS_LABEL } from "@/core/constants/attendance";
import { getCurrentSession } from "@/lib/auth";
import { toSimplePdf } from "@/lib/export";
import * as XLSX from "xlsx";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return new Response("Akses admin diperlukan.", { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  const rows = await getAttendanceReportRows(getDb(), {
    startDate: url.searchParams.get("startDate") ?? undefined,
    endDate: url.searchParams.get("endDate") ?? undefined,
    classId: url.searchParams.get("classId") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    limit: 1000,
  });

  const header = ["Tanggal", "NIS", "Nama", "Kelas", "Tahun Ajaran", "Status", "Catatan"];
  const body = rows.map((row) => [
    row.attendanceDate,
    row.nis,
    row.studentName,
    row.className ?? "-",
    row.academicYear ?? "-",
    ATTENDANCE_STATUS_LABEL[row.status],
    row.notes ?? "",
  ]);

  if (format === "xlsx" || format === "xls") {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="rekap-absensi.xlsx"',
      },
    });
  }

  if (format === "pdf") {
    const lines = body.map((row) => row.join(" | "));
    return new Response(toSimplePdf("Laporan Rekap Absensi", [header.join(" | "), ...lines]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rekap-absensi.pdf"',
      },
    });
  }

  return new Response([header.map(csvCell).join(","), ...body.map((row) => row.map(csvCell).join(","))].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rekap-absensi.csv"',
    },
  });
}
