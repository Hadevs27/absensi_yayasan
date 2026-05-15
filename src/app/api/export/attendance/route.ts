import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/db/db";
import { attendanceRecords, users } from "@/db/schema";
import { statusLabels } from "@/lib/attendance";
import { getCurrentSession } from "@/lib/auth";
import { formatDateTimeId } from "@/lib/date";

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
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const db = getDb();

  const where =
    startDate && endDate
      ? and(gte(attendanceRecords.workDate, startDate), lte(attendanceRecords.workDate, endDate))
      : undefined;

  const rows = await db
    .select({
      employeeCode: users.employeeCode,
      name: users.name,
      email: users.email,
      workDate: attendanceRecords.workDate,
      status: attendanceRecords.status,
      checkInAt: attendanceRecords.checkInAt,
      checkOutAt: attendanceRecords.checkOutAt,
      notes: attendanceRecords.notes,
    })
    .from(attendanceRecords)
    .innerJoin(users, eq(attendanceRecords.userId, users.id))
    .where(where)
    .orderBy(desc(attendanceRecords.workDate));

  const header = [
    "Kode",
    "Nama",
    "Email",
    "Tanggal",
    "Status",
    "Masuk",
    "Keluar",
    "Catatan",
  ];

  const body = rows.map((row) =>
    [
      row.employeeCode,
      row.name,
      row.email,
      row.workDate,
      statusLabels[row.status],
      formatDateTimeId(row.checkInAt),
      formatDateTimeId(row.checkOutAt),
      row.notes,
    ]
      .map(csvCell)
      .join(","),
  );

  return new Response([header.map(csvCell).join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rekap-absensi.csv"',
    },
  });
}
