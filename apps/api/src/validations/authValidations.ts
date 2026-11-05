import { z } from "zod";

const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
const nicknameRegex = /^[a-z0-9_.-]{1,20}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .min(5, "Nome deve ter pelo menos 5 caracteres")
    .max(30, "Nome pode ter no máximo 30 caracteres")
    .regex(nameRegex, "Nome deve conter apenas letras e espaços"),
  nickname: z
    .string()
    .min(2, "Apelido deve ter pelo menos 2 caracteres")
    .max(20, "Apelido pode ter no máximo 20 caracteres")
    .regex(nicknameRegex, "Apelido deve conter apenas letras minúsculas, números, pontos, traços ou underscores")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  nickname: z
    .string()
    .min(2, "Apelido deve ter pelo menos 2 caracteres")
    .max(20, "Apelido pode ter no máximo 20 caracteres")
    .regex(nicknameRegex, "Apelido deve conter apenas letras minúsculas, números, pontos, traços ou underscores")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
