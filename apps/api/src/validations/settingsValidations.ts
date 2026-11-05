import { z } from "zod";

export const updateSettingsSchema = z.object({
  allowCookies: z.boolean(),
});

export const updateAnimationSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  transitionDuration: z.number().min(0).max(5).optional(),
});
