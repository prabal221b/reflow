import { z } from "zod";
import { PLATFORMS } from "../types";

export const scheduleSocialSchema = z.object({
  platform: z.enum(PLATFORMS),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  duration: z.number().min(5).max(60),
  intent: z.string().max(200).optional(),
});

export const startSocialSchema = z.object({
  windowId: z.string().min(1),
  intent: z.string().max(200).optional(),
});

export const completeSocialSchema = z.object({
  windowId: z.string().min(1),
  actualDuration: z.number().min(0).max(180),
});

export const logCheckSchema = z.object({
  platform: z.enum(PLATFORMS),
  duration: z.number().min(1).max(180),
});

export type ScheduleSocialInput = z.infer<typeof scheduleSocialSchema>;
export type LogCheckInput = z.infer<typeof logCheckSchema>;
