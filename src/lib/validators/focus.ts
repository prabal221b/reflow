import { z } from "zod";
import { MIN_FOCUS_INTERVAL, MAX_FOCUS_INTERVAL } from "../constants";

export const startFocusSchema = z.object({
  duration: z
    .number()
    .min(MIN_FOCUS_INTERVAL)
    .max(MAX_FOCUS_INTERVAL),
  task: z.string().max(200).optional(),
  type: z.enum(["regular", "rescue"]).default("regular"),
});

export const completeFocusSchema = z.object({
  sessionId: z.string().min(1),
  rating: z.enum(["great", "okay", "struggled", "interrupted"]),
  note: z.string().max(500).optional(),
});

export const sessionIdSchema = z.object({
  sessionId: z.string().min(1),
});

export type StartFocusInput = z.infer<typeof startFocusSchema>;
export type CompleteFocusInput = z.infer<typeof completeFocusSchema>;
