import { z } from "zod";
import { PLATFORMS, TRIGGERS } from "../types";

export const onboardingWelcomeSchema = z.object({
  name: z.string().min(1).max(100),
  concerns: z.array(z.string()).min(1, "Select at least one"),
});

export const onboardingWorkSchema = z.object({
  workPattern: z.enum(["nine_to_five", "flexible", "shift", "student"]),
  peakFocus: z.enum(["morning", "afternoon", "evening"]),
  worstFocus: z.enum(["morning", "afternoon", "evening"]),
});

export const onboardingSocialSchema = z.object({
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Select at least one platform"),
  dailyUsageHours: z.number().min(0).max(24),
  triggers: z.array(z.enum(TRIGGERS)),
});

export const onboardingSleepSchema = z.object({
  avgSleepHours: z.number().min(0).max(24).optional(),
  phoneInBed: z.boolean().optional(),
  morningEnergy: z.enum(["low", "medium", "high"]).optional(),
});

export type OnboardingWelcomeInput = z.infer<typeof onboardingWelcomeSchema>;
export type OnboardingWorkInput = z.infer<typeof onboardingWorkSchema>;
export type OnboardingSocialInput = z.infer<typeof onboardingSocialSchema>;
export type OnboardingSleepInput = z.infer<typeof onboardingSleepSchema>;
