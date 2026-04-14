"use server";

import { connectDB } from "../db/connection";
import User from "../db/models/user";
import { getUser } from "../data/user";
import FocusSession from "../db/models/focus-session";
import SocialSession from "../db/models/social-session";
import Urge from "../db/models/urge";
import DailyLog from "../db/models/daily-log";
import { requireUserId } from "../auth/session";
import { updateSettingsSchema } from "../validators/settings";
import type { ActionResult } from "../types";

export async function updateSettings(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const updateFields: Record<string, unknown> = {};
    const data = parsed.data;

    if (data.focusInterval !== undefined) updateFields["settings.focusInterval"] = data.focusInterval;
    if (data.focusProgression !== undefined) updateFields["settings.focusProgression"] = data.focusProgression;
    if (data.progressionSpeed !== undefined) updateFields["settings.progressionSpeed"] = data.progressionSpeed;
    if (data.theme !== undefined) updateFields["settings.theme"] = data.theme;
    if (data.reducedMotion !== undefined) updateFields["settings.reducedMotion"] = data.reducedMotion;
    if (data.timezone !== undefined) updateFields["settings.timezone"] = data.timezone;
    if (data.workdayStart !== undefined) updateFields["settings.workdayStart"] = data.workdayStart;
    if (data.workdayEnd !== undefined) updateFields["settings.workdayEnd"] = data.workdayEnd;

    if (data.notifications) {
      if (data.notifications.focusReminders !== undefined) updateFields["settings.notifications.focusReminders"] = data.notifications.focusReminders;
      if (data.notifications.socialWindowAlerts !== undefined) updateFields["settings.notifications.socialWindowAlerts"] = data.notifications.socialWindowAlerts;
      if (data.notifications.dailySummary !== undefined) updateFields["settings.notifications.dailySummary"] = data.notifications.dailySummary;
    }

    if (data.socialWindowDefaults) {
      if (data.socialWindowDefaults.duration !== undefined) updateFields["settings.socialWindowDefaults.duration"] = data.socialWindowDefaults.duration;
      if (data.socialWindowDefaults.maxPerDay !== undefined) updateFields["settings.socialWindowDefaults.maxPerDay"] = data.socialWindowDefaults.maxPerDay;
    }

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };
    
    await User.findByIdAndUpdate(user._id, { $set: updateFields });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Couldn't save settings.", code: "SERVER" };
  }
}

export async function exportUserData(): Promise<ActionResult<string>> {
  try {
    const userId = await requireUserId();
    await connectDB();

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    const oid = user._id;
    const [userData, sessions, socialSessions, urges, dailyLogs] = await Promise.all([
      User.findById(oid).select("-passwordHash").lean(),
      FocusSession.find({ userId: oid }).lean(),
      SocialSession.find({ userId: oid }).lean(),
      Urge.find({ userId: oid }).lean(),
      DailyLog.find({ userId: oid }).lean(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userData,
      focusSessions: sessions,
      socialSessions,
      urges,
      dailyLogs,
    };

    return { success: true, data: JSON.stringify(exportData, null, 2) };
  } catch (error) {
    console.error("Export data error:", error);
    return { success: false, error: "Couldn't export data.", code: "SERVER" };
  }
}

export async function deleteAccount(
  confirmation: string
): Promise<ActionResult> {
  try {
    if (confirmation !== "DELETE") {
      return { success: false, error: "Please type DELETE to confirm", code: "VALIDATION" };
    }

    const userId = await requireUserId();
    await connectDB();

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    const oid = user._id;

    // Hard delete all user data across all collections
    await Promise.all([
      FocusSession.deleteMany({ userId: oid }),
      SocialSession.deleteMany({ userId: oid }),
      Urge.deleteMany({ userId: oid }),
      DailyLog.deleteMany({ userId: oid }),
      User.findByIdAndDelete(oid),
    ]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, error: "Couldn't delete account.", code: "SERVER" };
  }
}
