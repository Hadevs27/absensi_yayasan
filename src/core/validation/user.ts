import { z } from "zod";

export const roleSchema = z.enum(["admin", "user"]);
export const languageSchema = z.enum(["id", "en"]);
export const themeSchema = z.enum(["light", "dark", "system"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: roleSchema,
  employeeCode: z.string().trim().min(2, "Kode user wajib diisi."),
  avatarUrl: z.string().trim().url("URL avatar tidak valid.").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  preferredLanguage: languageSchema.default("id"),
  themePreference: themeSchema.default("system"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  avatarUrl: z.string().trim().url("URL avatar tidak valid.").or(z.literal("")).optional(),
});

export const preferencesSchema = z.object({
  preferredLanguage: languageSchema,
  themePreference: themeSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi."),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter."),
    confirmPassword: z.string().min(6),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
