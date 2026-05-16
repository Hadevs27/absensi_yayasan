import type { AttendanceDetail } from "@/db/schema";

export const STUDENT_ATTENDANCE_STATUSES = [
  "present",
  "late",
  "permission",
  "sick",
  "absent",
] as const satisfies AttendanceDetail["status"][];

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceDetail["status"], string> = {
  present: "Hadir",
  late: "Terlambat",
  permission: "Izin",
  sick: "Sakit",
  leave: "Cuti",
  absent: "Alfa",
};

export const DISCIPLINE_CLUSTER_LABELS = [
  "Disiplin Tinggi",
  "Disiplin Sedang",
  "Disiplin Rendah",
] as const;

export const DEFAULT_PAGE_SIZE = 10;
