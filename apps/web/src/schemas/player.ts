import { z } from "zod";

export const basePlayerSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")
    .transform((value) => {
      // Remove espaços extras no início, fim e entre palavras
      const trimmed = value.trim().replace(/\s+/g, ' ');
      // Garante que cada palavra comece com maiúscula
      return trimmed
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }),
  nickname: z
    .string()
    .min(2, "Apelido deve ter no mínimo 2 caracteres")
    .max(20, "Apelido deve ter no máximo 20 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "Apelido deve conter apenas letras minúsculas, números e '_'"
    )
    .transform((value) => value.toLowerCase().trim()),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(30, "Senha deve ter no máximo 30 caracteres"),
});

export const registerSchema = basePlayerSchema
  .extend({
    ...passwordSchema.shape,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = basePlayerSchema.extend({
  ...passwordSchema.shape,
});

export const editPlayerSchema = basePlayerSchema.extend({
  avatarUrl: z.instanceof(File).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type EditPlayerFormData = z.infer<typeof editPlayerSchema>;
