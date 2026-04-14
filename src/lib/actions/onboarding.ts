"use server";

import { connectDB } from "../db/connection";
import User from "../db/models/user";
import { getUser } from "../data/user";
import { requireUserId } from "../auth/session";
import type { ActionResult, OnboardingResponses } from "../types";
import { generateInitialPlan } from "../utils/plan-generator";
import { revalidatePath } from "next/cache";

export async function saveOnboardingStep(
  step: string,
  responses: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await connectDB();

    const updateFields: Record<string, unknown> = {};

    switch (step) {
      case "welcome":
        if (responses.name) {
          updateFields.name = responses.name;
        }
        break;
      case "work":
        if (responses.workPattern) updateFields["onboarding.responses.workPattern"] = responses.workPattern;
        if (responses.peakFocus) updateFields["onboarding.responses.peakFocus"] = responses.peakFocus;
        if (responses.worstFocus) updateFields["onboarding.responses.worstFocus"] = responses.worstFocus;
        break;
      case "social":
        if (responses.platforms) updateFields["onboarding.responses.platforms"] = responses.platforms;
        if (responses.dailyUsageHours !== undefined) updateFields["onboarding.responses.dailyUsageHours"] = responses.dailyUsageHours;
        if (responses.triggers) updateFields["onboarding.responses.triggers"] = responses.triggers;
        break;
      case "sleep":
        if (responses.avgSleepHours !== undefined) updateFields["onboarding.responses.avgSleepHours"] = responses.avgSleepHours;
        if (responses.phoneInBed !== undefined) updateFields["onboarding.responses.phoneInBed"] = responses.phoneInBed;
        if (responses.morningEnergy) updateFields["onboarding.responses.morningEnergy"] = responses.morningEnergy;
        break;
    }

    await User.findByIdAndUpdate(userId, { $set: updateFields });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Save onboarding error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function skipOnboardingStep(step: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await connectDB();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { "onboarding.skippedSteps": step },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Skip onboarding error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function completeOnboarding(): Promise<
  ActionResult<{ focusInterval: number }>
> {
  try {
    const userId = await requireUserId();
    await connectDB();
    const user = await getUser(userId);
    if (!user) {
      return { success: false, error: "User not found", code: "NOT_FOUND" };
    }

    const plan = generateInitialPlan(user.onboarding.responses as unknown as Partial<OnboardingResponses>);

    await User.findByIdAndUpdate(userId, {
      $set: {
        "onboarding.completed": true,
        "onboarding.completedAt": new Date(),
        "settings.focusInterval": plan.focusInterval,
        "settings.workdayStart": plan.settings.workdayStart || "09:00",
        "settings.workdayEnd": plan.settings.workdayEnd || "17:30",
        currentFocusInterval: plan.focusInterval,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: { focusInterval: plan.focusInterval } };
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return { success: false, error: "Couldn't complete setup.", code: "SERVER" };
  }
}
