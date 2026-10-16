import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: password,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

// Profile update — every field optional (partial update). Mirrors the
// editable fields in the frontend Profile + Preferences.
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    age: z.string().trim().max(3),
    gender: z.enum(["Female", "Male", ""]),
    contact: z.string().trim().max(40),
    address: z.string().trim().max(300),
    avatar: z.string().max(2_000_000),
    language: z.string().trim().max(40),
    bookingUpdates: z.boolean(),
    resultAlerts: z.boolean(),
    healthTips: z.boolean(),
    twoFactor: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "At least one field is required" });

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
