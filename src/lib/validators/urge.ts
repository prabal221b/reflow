import { z } from "zod";
import { PLATFORMS, TRIGGERS } from "../types";

export const logUrgeSchema = z.object({
  trigger: z.enum(TRIGGERS).optional(),
  context: z.string().max(300).optional(),
});

export const logRelapseSchema = z.object({
  platform: z.enum(PLATFORMS),
  estimatedDuration: z.number().min(1).max(480),
  trigger: z.enum(TRIGGERS).optional(),
});

export type LogUrgeInput = z.infer<typeof logUrgeSchema>;
export type LogRelapseInput = z.infer<typeof logRelapseSchema>;
