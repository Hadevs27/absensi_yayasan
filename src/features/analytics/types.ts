import type { DisciplineClusterLabel } from "@/db/schema";

export type StudentDisciplineMetrics = {
  total_hadir: number;
  total_terlambat: number;
  total_alfa: number;
  total_izin: number;
};

export type StudentDisciplinePoint = {
  studentId: string;
  nis: string;
  studentName: string;
  className: string;
  metrics: StudentDisciplineMetrics;
};

export type StudentClusterAssignment = StudentDisciplinePoint & {
  clusterIndex: number;
  clusterLabel: DisciplineClusterLabel;
};
