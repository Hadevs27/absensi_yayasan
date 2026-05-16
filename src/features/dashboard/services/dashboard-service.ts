import { desc, eq, gte } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { attendanceDetails, attendanceSessions, classes, clusteringResults, clusterRuns, students } from "@/db/schema";
import { getTodayInJakarta, toIsoDate } from "@/lib/date";

export type AttendanceTrendPoint = {
  date: string;
  hadir: number;
  terlambat: number;
  izin: number;
  alfa: number;
};

export type ClusterSummaryPoint = {
  label: string;
  total: number;
};

export async function getAdminDashboardData(db: AppDb) {
  const today = getTodayInJakarta();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const startDate = toIsoDate(start);

  const [studentRows, todayDetails, trendDetails, latestRunRows] = await Promise.all([
    db.select({ id: students.id }).from(students).where(eq(students.isActive, true)),
    db
      .select({ status: attendanceDetails.status })
      .from(attendanceDetails)
      .innerJoin(attendanceSessions, eq(attendanceDetails.sessionId, attendanceSessions.id))
      .where(eq(attendanceSessions.attendanceDate, today)),
    db
      .select({
        date: attendanceSessions.attendanceDate,
        status: attendanceDetails.status,
      })
      .from(attendanceDetails)
      .innerJoin(attendanceSessions, eq(attendanceDetails.sessionId, attendanceSessions.id))
      .where(gte(attendanceSessions.attendanceDate, startDate)),
    db.select().from(clusterRuns).orderBy(desc(clusterRuns.createdAt)).limit(1),
  ]);

  const latestRun = latestRunRows[0];
  const latestClusters = latestRun
    ? await db
        .select({ label: clusteringResults.clusterLabel })
        .from(clusteringResults)
        .where(eq(clusteringResults.runId, latestRun.id))
    : [];

  const trendMap = new Map<string, AttendanceTrendPoint>();

  for (const detail of trendDetails) {
    const point =
      trendMap.get(detail.date) ??
      ({
        date: detail.date,
        hadir: 0,
        terlambat: 0,
        izin: 0,
        alfa: 0,
      } satisfies AttendanceTrendPoint);

    if (detail.status === "present") point.hadir += 1;
    if (detail.status === "late") point.terlambat += 1;
    if (detail.status === "absent") point.alfa += 1;
    if (detail.status === "permission" || detail.status === "sick") point.izin += 1;

    trendMap.set(detail.date, point);
  }

  const clusterMap = new Map<string, number>();

  for (const cluster of latestClusters) {
    clusterMap.set(cluster.label, (clusterMap.get(cluster.label) ?? 0) + 1);
  }

  return {
    today,
    stats: {
      totalStudents: studentRows.length,
      presentToday: todayDetails.filter((detail) => detail.status === "present").length,
      lateToday: todayDetails.filter((detail) => detail.status === "late").length,
      absentToday: todayDetails.filter((detail) => detail.status === "absent").length,
    },
    trend: Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    clusterSummary: Array.from(clusterMap.entries()).map(([label, total]) => ({ label, total })),
    latestRun,
  };
}

export async function getUserDashboardData(db: AppDb, userId: string) {
  const today = getTodayInJakarta();
  const classRows = await db
    .select({
      id: classes.id,
      name: classes.name,
      academicYear: classes.academicYear,
    })
    .from(classes)
    .where(eq(classes.homeroomTeacherId, userId));

  const classIds = new Set(classRows.map((row) => row.id));
  const studentRows = await db
    .select({
      id: students.id,
      name: students.name,
      classId: students.classId,
    })
    .from(students)
    .where(eq(students.isActive, true));
  const ownedStudents = studentRows.filter((student) => student.classId && classIds.has(student.classId));
  const todaySessions = await db
    .select({
      id: attendanceSessions.id,
      classId: attendanceSessions.classId,
    })
    .from(attendanceSessions)
    .where(eq(attendanceSessions.attendanceDate, today));
  const sessionIds = todaySessions.filter((item) => classIds.has(item.classId)).map((item) => item.id);
  const todayDetails = [];

  for (const sessionId of sessionIds) {
    todayDetails.push(
      ...(await db
        .select({
          studentId: attendanceDetails.studentId,
          status: attendanceDetails.status,
        })
        .from(attendanceDetails)
        .where(eq(attendanceDetails.sessionId, sessionId))),
    );
  }

  const recordedStudentIds = new Set(todayDetails.map((detail) => detail.studentId));

  return {
    today,
    classes: classRows,
    stats: {
      totalStudents: ownedStudents.length,
      presentToday: todayDetails.filter((detail) => detail.status === "present").length,
      lateToday: todayDetails.filter((detail) => detail.status === "late").length,
      absentToday: todayDetails.filter((detail) => detail.status === "absent").length,
      notRecorded: ownedStudents.filter((student) => !recordedStudentIds.has(student.id)).length,
    },
    notRecordedStudents: ownedStudents.filter((student) => !recordedStudentIds.has(student.id)).slice(0, 8),
  };
}
