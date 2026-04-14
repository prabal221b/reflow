import { z } from "zod";

export const dailyCheckinSchema = z.object({
  sleep: z
    .object({
      duration: z.enum(["<5h", "5-6h", "6-7h", "7-8h", "8h+"]).optional(),
      phoneInBed: z.boolean().optional(),
    })
    .optional(),
  energy: z.number().min(1).max(5).optional(),
  fog: z.enum(["none", "mild", "moderate", "heavy"]).optional(),
  caffeine: z.enum(["none", "light", "moderate", "heavy"]).optional(),
});

export const workStartSchema = z.object({
  firstStep: z.string().min(1, "Enter your first step").max(200),
  noScrollCommitment: z.boolean().default(false),
});

export type DailyCheckinInput = z.infer<typeof dailyCheckinSchema>;
export type WorkStartInput = z.infer<typeof workStartSchema>;
