import { z } from "zod";

export const updateSettingsSchema = z.object({
  focusInterval: z.number().min(3).max(45).optional(),
  focusProgression: z.enum(["auto", "manual"]).optional(),
  progressionSpeed: z.enum(["slow", "normal", "fast"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  reducedMotion: z.boolean().optional(),
  notifications: z
    .object({
      focusReminders: z.boolean().optional(),
      socialWindowAlerts: z.boolean().optional(),
      dailySummary: z.boolean().optional(),
    })
    .optional(),
  timezone: z.string().max(50).optional(),
  workdayStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  workdayEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  socialWindowDefaults: z
    .object({
      duration: z.number().min(5).max(60).optional(),
      maxPerDay: z.number().min(1).max(10).optional(),
    })
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
