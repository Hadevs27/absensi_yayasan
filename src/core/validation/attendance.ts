import { z } from "zod";
import { STUDENT_ATTENDANCE_STATUSES } from "@/core/constants/attendance";

export const attendanceDetailInputSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(STUDENT_ATTENDANCE_STATUSES),
  notes: z.string().trim().optional().default(""),
});

export const classAttendanceSchema = z.object({
  classId: z.string().uuid(),
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  notes: z.string().trim().optional().default(""),
  details: z.array(attendanceDetailInputSchema).min(1, "Minimal satu siswa harus diabsen."),
});

export type ClassAttendanceInput = z.infer<typeof classAttendanceSchema>;
export type ClassAttendanceFormValues = z.input<typeof classAttendanceSchema>;
