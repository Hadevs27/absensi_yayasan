import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/db";
import { attendanceRecords } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { getMinutesInJakarta, getTodayInJakarta } from "@/lib/date";

const LATE_AFTER_MINUTES = 8 * 60 + 15;

export async function POST() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();
  const workDate = getTodayInJakarta(now);
  const status = getMinutesInJakarta(now) > LATE_AFTER_MINUTES ? "late" : "present";

  const existing = await db.query.attendanceRecords.findFirst({
    where: and(eq(attendanceRecords.userId, session.userId), eq(attendanceRecords.workDate, workDate)),
  });

  if (existing?.checkInAt) {
    return NextResponse.json({ message: "Absen masuk hari ini sudah tercatat." }, { status: 409 });
  }

  if (existing) {
    await db
      .update(attendanceRecords)
      .set({ checkInAt: now, status, updatedAt: now })
      .where(eq(attendanceRecords.id, existing.id));
  } else {
    await db.insert(attendanceRecords).values({
      userId: session.userId,
      workDate,
      status,
      checkInAt: now,
    });
  }

  return NextResponse.json({ message: "Absen masuk tersimpan." });
}
