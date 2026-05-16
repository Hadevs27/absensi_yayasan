import { and, eq } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { attendanceDetails, attendanceSessions, classes, students } from "@/db/schema";
import type { SessionPayload } from "@/lib/session";

type StudentAttendanceStatus = "present" | "late" | "permission" | "sick" | "absent";

function normalizeStudentStatus(status: string | undefined): StudentAttendanceStatus {
  if (status === "present" || status === "late" || status === "permission" || status === "sick") {
    return status;
  }

  return "absent";
}

export async function getAccessibleClasses(db: AppDb, session: SessionPayload) {
  const query = db
    .select({
      id: classes.id,
      name: classes.name,
      academicYear: classes.academicYear,
      level: classes.level,
    })
    .from(classes)
    .orderBy(classes.name);

  if (session.role === "admin") {
    return query;
  }

  return db
    .select({
      id: classes.id,
      name: classes.name,
      academicYear: classes.academicYear,
      level: classes.level,
    })
    .from(classes)
    .where(eq(classes.homeroomTeacherId, session.userId))
    .orderBy(classes.name);
}

export async function getClassAttendanceEntry(
  db: AppDb,
  {
    classId,
    attendanceDate,
  }: {
    classId: string;
    attendanceDate: string;
  },
) {
  const studentRows = await db
    .select({
      id: students.id,
      nis: students.nis,
      name: students.name,
    })
    .from(students)
    .where(and(eq(students.classId, classId), eq(students.isActive, true)))
    .orderBy(students.name);

  const session = await db.query.attendanceSessions.findFirst({
    where: and(
      eq(attendanceSessions.classId, classId),
      eq(attendanceSessions.attendanceDate, attendanceDate),
    ),
  });

  const detailRows = session
    ? await db
        .select()
        .from(attendanceDetails)
        .where(eq(attendanceDetails.sessionId, session.id))
    : [];

  const detailByStudent = new Map(detailRows.map((detail) => [detail.studentId, detail]));

  return {
    session,
    students: studentRows.map((student) => {
      const detail = detailByStudent.get(student.id);

      return {
        ...student,
        status: normalizeStudentStatus(detail?.status),
        notes: detail?.notes ?? "",
      };
    }),
  };
}
