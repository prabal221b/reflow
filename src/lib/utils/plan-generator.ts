import type { OnboardingResponses } from "../types";
import type { UserSettings } from "../types";
import {
  DEFAULT_FOCUS_INTERVAL,
  DEFAULT_SETTINGS,
} from "../constants";

/**
 * Generate initial settings and focus plan from onboarding responses
 */
export function generateInitialPlan(responses: Partial<OnboardingResponses>): {
  settings: Partial<UserSettings>;
  focusInterval: number;
  dailyTarget: { sessions: number; label: string };
  suggestedWindows: Array<{ time: string; duration: number; label: string }>;
} {
  const settings: Partial<UserSettings> = { ...DEFAULT_SETTINGS };

  // Determine focus interval based on usage patterns
  let focusInterval = DEFAULT_FOCUS_INTERVAL;
  if (responses.dailyUsageHours) {
    if (responses.dailyUsageHours >= 5) {
      focusInterval = 5;
    } else if (responses.dailyUsageHours >= 3) {
      focusInterval = 8;
    } else {
      focusInterval = 10;
    }
  }

  // Determine daily target based on energy
  let dailyTarget: { sessions: number; label: string } = { sessions: 3, label: "Steady day" };
  if (responses.morningEnergy === "low") {
    dailyTarget = { sessions: 2, label: "Gentle day" };
  } else if (responses.morningEnergy === "high") {
    dailyTarget = { sessions: 4, label: "Strong day" };
  }

  // Adjust for sleep
  if (responses.avgSleepHours && responses.avgSleepHours < 6) {
    dailyTarget = { sessions: 2, label: "Gentle day" };
    focusInterval = Math.min(focusInterval, 8);
  }

  // Workday settings
  if (responses.workPattern === "nine_to_five") {
    settings.workdayStart = "09:00";
    settings.workdayEnd = "17:30";
  } else if (responses.workPattern === "flexible") {
    settings.workdayStart = "10:00";
    settings.workdayEnd = "18:00";
  } else if (responses.workPattern === "student") {
    settings.workdayStart = "09:00";
    settings.workdayEnd = "16:00";
  }

  // Suggest social media windows
  const suggestedWindows: Array<{ time: string; duration: number; label: string }> = [];

  if (responses.workPattern === "nine_to_five") {
    suggestedWindows.push(
      { time: "12:30", duration: 15, label: "Lunch break" },
      { time: "17:30", duration: 20, label: "After work" }
    );
  } else {
    suggestedWindows.push(
      { time: "12:00", duration: 15, label: "Midday break" },
      { time: "18:00", duration: 20, label: "Evening wind-down" }
    );
  }

  if (responses.platforms && responses.platforms.length >= 4) {
    suggestedWindows.unshift({
      time: "08:30",
      duration: 10,
      label: "Quick morning check",
    });
  }

  settings.focusInterval = focusInterval;

  return {
    settings,
    focusInterval,
    dailyTarget,
    suggestedWindows,
  };
}
