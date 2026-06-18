import { z } from "zod";

/**
 * Login form validation schema.
 * All error messages in Bahasa Indonesia.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form validation schema.
 * Password requirements per PRD: min 8 chars, at least 1 uppercase, at least 1 number.
 * All error messages in Bahasa Indonesia.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
  confirmPassword: z
    .string()
    .min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
