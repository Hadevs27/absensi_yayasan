import { z } from "zod";

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

export const classSchema = z.object({
  name: z.string().trim().min(2, "Nama kelas minimal 2 karakter."),
  level: z.string().trim().min(2, "Jenjang wajib diisi."),
  academicYear: z.string().trim().min(4, "Tahun ajaran wajib diisi."),
  homeroomTeacherId: optionalUuid,
});

export const studentSchema = z.object({
  nis: z.string().trim().min(2, "NIS wajib diisi."),
  name: z.string().trim().min(2, "Nama siswa minimal 2 karakter."),
  classId: optionalUuid,
  guardianName: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  isActive: z.boolean().default(true),
});

export type ClassInput = z.infer<typeof classSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ClassFormValues = z.input<typeof classSchema>;
export type StudentFormValues = z.input<typeof studentSchema>;
