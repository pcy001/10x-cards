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
