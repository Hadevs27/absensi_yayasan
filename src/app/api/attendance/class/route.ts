import { and, eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { classAttendanceSchema } from "@/core/validation/attendance";
import { getDb } from "@/db/db";
import { attendanceDetails, attendanceSessions, classes } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return apiFail("Sesi tidak valid.", 401);
  }

  const parsed = classAttendanceSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return apiFail("Input absensi tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const db = getDb();
  const payload = parsed.data;

  if (session.role !== "admin") {
    const allowedClass = await db.query.classes.findFirst({
      where: and(eq(classes.id, payload.classId), eq(classes.homeroomTeacherId, session.userId)),
    });

    if (!allowedClass) {
      return apiFail("Anda hanya dapat mengisi absensi kelas yang Anda pegang.", 403);
    }
  }

  const [attendanceSession] = await db
    .insert(attendanceSessions)
    .values({
      classId: payload.classId,
      attendanceDate: payload.attendanceDate,
      createdBy: session.userId,
      notes: payload.notes || null,
    })
    .onConflictDoUpdate({
      target: [attendanceSessions.classId, attendanceSessions.attendanceDate],
      set: {
        createdBy: session.userId,
        notes: payload.notes || null,
        updatedAt: new Date(),
      },
    })
    .returning();

  for (const detail of payload.details) {
    await db
      .insert(attendanceDetails)
      .values({
        sessionId: attendanceSession.id,
        studentId: detail.studentId,
        status: detail.status,
        notes: detail.notes || null,
      })
      .onConflictDoUpdate({
        target: [attendanceDetails.sessionId, attendanceDetails.studentId],
        set: {
          status: detail.status,
          notes: detail.notes || null,
          recordedAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }

  return apiOk({ sessionId: attendanceSession.id }, "Absensi kelas berhasil disimpan.");
}
