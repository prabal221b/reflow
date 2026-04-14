"use server";

import { connectDB } from "../db/connection";
import SocialSession from "../db/models/social-session";
import DailyLog from "../db/models/daily-log";
import User from "../db/models/user";
import { requireUserId } from "../auth/session";
import { scheduleSocialSchema, logCheckSchema } from "../validators/social";
import { getTodayString } from "../utils/date";
import type { ActionResult } from "../types";
import mongoose from "mongoose";

export async function scheduleSocialWindow(
  input: unknown
): Promise<ActionResult<{ windowId: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = scheduleSocialSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    // Parse the time string to create a scheduled start date
    const [hours, minutes] = parsed.data.startTime.split(":").map(Number);
    const scheduledStart = new Date();
    scheduledStart.setHours(hours, minutes, 0, 0);

    const session = await SocialSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: "planned",
      status: "scheduled",
      platform: parsed.data.platform,
      intent: parsed.data.intent,
      scheduledStart,
      scheduledDuration: parsed.data.duration,
      date: dateStr,
    });

    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      { $inc: { "summary.plannedSocialWindows": 1 } },
      { upsert: true }
    );

    return { success: true, data: { windowId: session._id.toString() } };
  } catch (error) {
    console.error("Schedule social error:", error);
    return { success: false, error: "Couldn't schedule window.", code: "SERVER" };
  }
}

export async function startSocialWindow(
  windowId: string,
  intent?: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await connectDB();

    const result = await SocialSession.findOneAndUpdate(
      {
        _id: windowId,
        userId: new mongoose.Types.ObjectId(userId),
        status: "scheduled",
      },
      {
        status: "active",
        actualStart: new Date(),
        intent: intent || undefined,
      }
    );

    if (!result) {
      return { success: false, error: "Window not found", code: "NOT_FOUND" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Start social error:", error);
    return { success: false, error: "Couldn't start window.", code: "SERVER" };
  }
}

export async function completeSocialWindow(
  windowId: string,
  actualDuration: number
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await connectDB();

    const result = await SocialSession.findOneAndUpdate(
      {
        _id: windowId,
        userId: new mongoose.Types.ObjectId(userId),
        status: "active",
      },
      { status: "completed", actualDuration }
    );

    if (!result) {
      return { success: false, error: "Window not found", code: "NOT_FOUND" };
    }

    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      { $inc: { "summary.actualSocialWindows": 1 } },
      { upsert: true }
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Complete social error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function logUnplannedCheck(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = logCheckSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    await SocialSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: "unplanned",
      status: "completed",
      platform: parsed.data.platform,
      actualStart: new Date(),
      actualDuration: parsed.data.duration,
      date: dateStr,
    });

    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      { $inc: { "summary.unplannedChecks": 1 } },
      { upsert: true }
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Log check error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function getTodaySocialSessions(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  const dateStr = getTodayString(user?.settings?.timezone);

  return SocialSession.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: dateStr,
  })
    .sort({ createdAt: -1 })
    .lean();
}
