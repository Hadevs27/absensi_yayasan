import { and, eq, gte, lte } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { attendanceDetails, attendanceSessions, classes, students } from "@/db/schema";
import { runKMeans } from "@/lib/kmeans";
import type {
  StudentClusterAssignment,
  StudentDisciplineMetrics,
  StudentDisciplinePoint,
} from "../types";

function emptyMetrics(): StudentDisciplineMetrics {
  return {
    total_hadir: 0,
    total_terlambat: 0,
    total_alfa: 0,
    total_izin: 0,
  };
}

export async function getStudentDisciplineDataset(
  db: AppDb,
  startDate: string,
  endDate: string,
) {
  const studentRows = await db
    .select({
      studentId: students.id,
      nis: students.nis,
      studentName: students.name,
      className: classes.name,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.isActive, true));

  const detailRows = await db
    .select({
      studentId: attendanceDetails.studentId,
      status: attendanceDetails.status,
    })
    .from(attendanceDetails)
    .innerJoin(attendanceSessions, eq(attendanceDetails.sessionId, attendanceSessions.id))
    .where(
      and(
        gte(attendanceSessions.attendanceDate, startDate),
        lte(attendanceSessions.attendanceDate, endDate),
      ),
    );

  const metricsByStudent = new Map<string, StudentDisciplineMetrics>();

  for (const student of studentRows) {
    metricsByStudent.set(student.studentId, emptyMetrics());
  }

  for (const detail of detailRows) {
    const metrics = metricsByStudent.get(detail.studentId);

    if (!metrics) {
      continue;
    }

    if (detail.status === "present") metrics.total_hadir += 1;
    if (detail.status === "late") metrics.total_terlambat += 1;
    if (detail.status === "absent") metrics.total_alfa += 1;
    if (detail.status === "permission" || detail.status === "sick") metrics.total_izin += 1;
  }

  return studentRows.map<StudentDisciplinePoint>((student) => ({
    studentId: student.studentId,
    nis: student.nis,
    studentName: student.studentName,
    className: student.className ?? "-",
    metrics: metricsByStudent.get(student.studentId) ?? emptyMetrics(),
  }));
}

export function runStudentDisciplineClustering(
  dataset: StudentDisciplinePoint[],
  k: number,
) {
  const result = runKMeans(
    dataset.map((point) => ({
      userId: point.studentId,
      name: point.studentName,
      metrics: {
        hadir: point.metrics.total_hadir,
        terlambat: point.metrics.total_terlambat,
        alfa: point.metrics.total_alfa,
        izin: point.metrics.total_izin,
        sakit: 0,
        cuti: 0,
      },
    })),
    k,
  );

  const assignments = result.assignments.map<StudentClusterAssignment>((assignment) => {
    const source = dataset.find((point) => point.studentId === assignment.userId);

    if (!source) {
      throw new Error("Dataset clustering tidak sinkron.");
    }

    return {
      ...source,
      clusterIndex: assignment.clusterIndex,
      clusterLabel: assignment.label as StudentClusterAssignment["clusterLabel"],
    };
  });

  return {
    assignments,
    silhouetteScore: result.silhouetteScore,
  };
}
