"use server";

import { connectDB } from "../db/connection";
import Urge from "../db/models/urge";
import DailyLog from "../db/models/daily-log";
import User from "../db/models/user";
import { requireUserId } from "../auth/session";
import { logUrgeSchema, logRelapseSchema } from "../validators/urge";
import { getTodayString } from "../utils/date";
import { getRecoveryMessage } from "../utils/recovery-messages";
import type { ActionResult } from "../types";
import mongoose from "mongoose";

export async function logUrge(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = logUrgeSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    const urge = await Urge.create({
      userId: new mongoose.Types.ObjectId(userId),
      trigger: parsed.data.trigger,
      context: parsed.data.context,
      resultedInRelapse: false,
      date: dateStr,
      timestamp: new Date(),
    });

    // Update daily log
    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      { $inc: { "summary.urgesLogged": 1 } },
      { upsert: true }
    );

    return { success: true, data: { id: urge._id.toString() } };
  } catch (error) {
    console.error("Log urge error:", error);
    return { success: false, error: "Couldn't save. Please try again.", code: "SERVER" };
  }
}

export async function logRelapse(
  input: unknown
): Promise<ActionResult<{ recoveryMessage: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = logRelapseSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input", code: "VALIDATION" };
    }

    await connectDB();
    const user = await User.findById(userId);
    const dateStr = getTodayString(user?.settings?.timezone);

    await Urge.create({
      userId: new mongoose.Types.ObjectId(userId),
      trigger: parsed.data.trigger,
      resultedInRelapse: true,
      relapse: {
        platform: parsed.data.platform,
        estimatedDuration: parsed.data.estimatedDuration,
      },
      date: dateStr,
      timestamp: new Date(),
    });

    // Update daily log
    await DailyLog.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: dateStr },
      {
        $inc: {
          "summary.urgesLogged": 1,
          "summary.relapses": 1,
          "summary.unplannedChecks": 1,
        },
      },
      { upsert: true }
    );

    // Reset consecutive successes
    await User.findByIdAndUpdate(userId, { consecutiveSuccesses: 0 });

    const recoveryMessage = getRecoveryMessage();

    return { success: true, data: { recoveryMessage } };
  } catch (error) {
    console.error("Log relapse error:", error);
    return { success: false, error: "Couldn't save. Please try again.", code: "SERVER" };
  }
}
