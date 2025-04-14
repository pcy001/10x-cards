import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email("Podaj poprawny adres email").min(1, "Email jest wymagany"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Podaj poprawny adres email").min(1, "Email jest wymagany"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Podaj poprawny adres email").min(1, "Email jest wymagany"),
  redirectTo: z.string().url("Niepoprawny URL przekierowania").optional(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "Hasło musi zawierać co najmniej 6 znaków"),
  confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
