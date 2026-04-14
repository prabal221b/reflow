"use server";

import { connectDB } from "../db/connection";
import DailyLog from "../db/models/daily-log";
import User from "../db/models/user";
import { requireUserId } from "../auth/session";
import { dailyCheckinSchema, workStartSchema } from "../validators/daily-log";
import { getTodayString } from "../utils/date";
import type { ActionResult } from "../types";
import mongoose from "mongoose";

export async function saveDailyCheckin(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = dailyCheckinSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      {
        $set: {
          sleep: parsed.data.sleep,
          energy: parsed.data.energy,
          fog: parsed.data.fog,
          caffeine: parsed.data.caffeine,
        },
      },
      { upsert: true }
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Daily checkin error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function saveWorkStart(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = workStartSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      {
        $set: {
          workStart: {
            firstStep: parsed.data.firstStep,
            noScrollCommitment: parsed.data.noScrollCommitment,
            startedAt: new Date(),
            clean: true,
          },
          "summary.cleanWorkStart": true,
        },
      },
      { upsert: true }
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Work start error:", error);
    return { success: false, error: "Couldn't save.", code: "SERVER" };
  }
}

export async function getTodayLog(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  const dateStr = getTodayString(user?.settings?.timezone);

  return DailyLog.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    date: dateStr,
  }).lean();
}
