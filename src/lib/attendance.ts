import type { AttendanceRecord, ClusterMetrics } from "@/db/schema";

export const statusLabels: Record<AttendanceRecord["status"], string> = {
  present: "Hadir",
  late: "Terlambat",
  permission: "Izin",
  sick: "Sakit",
  leave: "Cuti",
  absent: "Alfa",
};

export const statusTone: Record<AttendanceRecord["status"], string> = {
  present: "bg-emerald-50 text-emerald-800 border-emerald-200",
  late: "bg-amber-50 text-amber-800 border-amber-200",
  permission: "bg-sky-50 text-sky-800 border-sky-200",
  sick: "bg-violet-50 text-violet-800 border-violet-200",
  leave: "bg-stone-100 text-stone-700 border-stone-300",
  absent: "bg-rose-50 text-rose-800 border-rose-200",
};

export function emptyMetrics(): ClusterMetrics {
  return {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    cuti: 0,
    alfa: 0,
  };
}

export function addStatus(metrics: ClusterMetrics, status: AttendanceRecord["status"]) {
  if (status === "present") metrics.hadir += 1;
  if (status === "late") metrics.terlambat += 1;
  if (status === "permission") metrics.izin += 1;
  if (status === "sick") metrics.sakit += 1;
  if (status === "leave") metrics.cuti += 1;
  if (status === "absent") metrics.alfa += 1;
}

export function isDateOnly(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
