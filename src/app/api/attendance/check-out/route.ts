import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/db";
import { attendanceRecords } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { getTodayInJakarta } from "@/lib/date";

export async function POST() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();
  const workDate = getTodayInJakarta(now);

  const existing = await db.query.attendanceRecords.findFirst({
    where: and(eq(attendanceRecords.userId, session.userId), eq(attendanceRecords.workDate, workDate)),
  });

  if (!existing?.checkInAt) {
    return NextResponse.json({ message: "Absen masuk belum tercatat." }, { status: 409 });
  }

  if (existing.checkOutAt) {
    return NextResponse.json({ message: "Absen keluar hari ini sudah tercatat." }, { status: 409 });
  }

  await db
    .update(attendanceRecords)
    .set({ checkOutAt: now, updatedAt: now })
    .where(eq(attendanceRecords.id, existing.id));

  return NextResponse.json({ message: "Absen keluar tersimpan." });
}
