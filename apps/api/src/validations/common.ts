import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido.");

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value, 10) : 5))
    .pipe(z.number().int().positive().max(50).default(5)),
});

export const gamemodeQuerySchema = z.object({
  gamemode: z.enum(["cara_a_cara", "parceirada"]),
});
