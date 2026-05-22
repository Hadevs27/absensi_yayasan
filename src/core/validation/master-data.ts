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
  capacity: z.coerce.number().int().min(1).max(1000).default(30),
});

export const studentSchema = z.object({
  nis: z.string().trim().min(2, "NIS wajib diisi."),
  name: z.string().trim().min(2, "Nama siswa minimal 2 karakter."),
  gender: z.enum(["male", "female"]).nullable().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  address: z.string().trim().optional().transform((value) => value || null),
  parentName: z.string().trim().optional().transform((value) => value || null),
  phone: z.string().trim().optional().transform((value) => value || null),
  classId: optionalUuid,
  avatarUrl: z.string().trim().url("URL avatar tidak valid.").or(z.literal("")).optional(),
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
