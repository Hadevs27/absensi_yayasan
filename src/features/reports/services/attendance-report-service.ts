import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { attendanceDetails, attendanceSessions, classes, students } from "@/db/schema";

export type AttendanceReportFilters = {
  startDate?: string;
  endDate?: string;
  classId?: string;
  status?: string;
  limit?: number;
};

export async function getAttendanceReportRows(db: AppDb, filters: AttendanceReportFilters) {
  const conditions = [];

  if (filters.startDate) {
    conditions.push(gte(attendanceSessions.attendanceDate, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(attendanceSessions.attendanceDate, filters.endDate));
  }

  if (filters.classId) {
    conditions.push(eq(attendanceSessions.classId, filters.classId));
  }

  if (filters.status) {
    conditions.push(eq(attendanceDetails.status, filters.status as typeof attendanceDetails.$inferSelect.status));
  }

  return db
    .select({
      id: attendanceDetails.id,
      attendanceDate: attendanceSessions.attendanceDate,
      nis: students.nis,
      studentName: students.name,
      className: classes.name,
      academicYear: classes.academicYear,
      status: attendanceDetails.status,
      notes: attendanceDetails.notes,
    })
    .from(attendanceDetails)
    .innerJoin(attendanceSessions, eq(attendanceDetails.sessionId, attendanceSessions.id))
    .innerJoin(students, eq(attendanceDetails.studentId, students.id))
    .leftJoin(classes, eq(attendanceSessions.classId, classes.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(attendanceSessions.attendanceDate))
    .limit(filters.limit ?? 500);
}
