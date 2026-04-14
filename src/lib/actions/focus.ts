"use server";

import { connectDB } from "../db/connection";
import FocusSession from "../db/models/focus-session";
import DailyLog from "../db/models/daily-log";
import User from "../db/models/user";
import { getUser } from "../data/user";
import { requireUserId } from "../auth/session";
import { startFocusSchema, completeFocusSchema, sessionIdSchema } from "../validators/focus";
import { getTodayString } from "../utils/date";
import { SESSION_GRACE_PERIOD, SESSIONS_BEFORE_PROGRESSION } from "../constants";
import type { ActionResult } from "../types";

export async function startFocusSession(
  input: unknown
): Promise<ActionResult<{ sessionId: string; expiresAt: string; startedAt: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = startFocusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input", code: "VALIDATION" };
    }

    await connectDB();

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    // Check for existing active session
    const existing = await FocusSession.findOne({
      userId: user._id,
      status: { $in: ["active", "paused"] },
    });

    if (existing) {
      return { success: false, error: "You already have an active focus session", code: "CONFLICT" };
    }

    const { duration, task, type } = parsed.data;
    const durationSeconds = duration * 60;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (durationSeconds + SESSION_GRACE_PERIOD) * 1000);
    const dateStr = getTodayString(user.settings?.timezone);

    const session = await FocusSession.create({
      userId: user._id,
      type: type || "regular",
      status: "active",
      plannedDuration: durationSeconds,
      startedAt: now,
      pausedDuration: 0,
      expiresAt,
      preReflection: task ? { task } : undefined,
      date: dateStr,
    });

    // Update daily log attempt count
    await DailyLog.findOneAndUpdate(
      { userId: user._id, date: dateStr },
      {
        $inc: { "summary.sessionsAttempted": 1 },
        $setOnInsert: {
          focusTarget: { sessions: 3, minutesPerSession: user.currentFocusInterval || 8 },
        },
      },
      { upsert: true }
    );

    // Update last active
    await User.findByIdAndUpdate(user._id, { lastActiveAt: now });

    return {
      success: true,
      data: {
        sessionId: session._id.toString(),
        expiresAt: expiresAt.toISOString(),
        startedAt: now.toISOString(),
      },
    };
  } catch (error) {
    console.error("Start focus error:", error);
    return { success: false, error: "Couldn't start session. Please try again.", code: "SERVER" };
  }
}

export async function pauseFocusSession(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = sessionIdSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid session", code: "VALIDATION" };
    }

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    await connectDB();
    const session = await FocusSession.findOneAndUpdate(
      {
        _id: parsed.data.sessionId,
        userId: user._id,
        status: "active",
      },
      { status: "paused", pausedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return { success: false, error: "Session not found or already paused", code: "NOT_FOUND" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Pause focus error:", error);
    return { success: false, error: "Couldn't pause session.", code: "SERVER" };
  }
}

export async function resumeFocusSession(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = sessionIdSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid session", code: "VALIDATION" };
    }

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    await connectDB();
    const session = await FocusSession.findOne({
      _id: parsed.data.sessionId,
      userId: user._id,
      status: "paused",
    });

    if (!session || !session.pausedAt) {
      return { success: false, error: "Session not found or not paused", code: "NOT_FOUND" };
    }

    const pausedMs = Date.now() - session.pausedAt.getTime();
    const additionalPausedSeconds = Math.floor(pausedMs / 1000);

    await FocusSession.findByIdAndUpdate(session._id, {
      status: "active",
      $inc: { pausedDuration: additionalPausedSeconds },
      $unset: { pausedAt: 1 },
      expiresAt: new Date(session.expiresAt.getTime() + pausedMs),
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Resume focus error:", error);
    return { success: false, error: "Couldn't resume session.", code: "SERVER" };
  }
}

export async function completeFocusSession(
  input: unknown
): Promise<ActionResult<{ actualDuration: number }>> {
  try {
    const userId = await requireUserId();
    const parsed = completeFocusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input", code: "VALIDATION" };
    }

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    await connectDB();
    const session = await FocusSession.findOne({
      _id: parsed.data.sessionId,
      userId: user._id,
      status: { $in: ["active", "paused"] },
    });

    if (!session) {
      return { success: false, error: "Session not found", code: "NOT_FOUND" };
    }

    const now = new Date();
    let totalPaused = session.pausedDuration || 0;
    if (session.status === "paused" && session.pausedAt) {
      totalPaused += Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000);
    }

    const actualDuration = Math.floor(
      (now.getTime() - session.startedAt.getTime()) / 1000 - totalPaused
    );
    const actualMinutes = Math.round(actualDuration / 60);

    const dateStr = session.date;

    // Consolidate non-dependent writes into a single parallel operation
    await Promise.all([
      FocusSession.findByIdAndUpdate(session._id, {
        status: "completed",
        completedAt: now,
        actualDuration,
        pausedDuration: totalPaused,
        postReflection: {
          rating: parsed.data.rating,
          note: parsed.data.note,
        },
      }),
      DailyLog.findOneAndUpdate(
        { userId: user._id, date: dateStr },
        {
          $inc: {
            "summary.sessionsCompleted": 1,
            "summary.totalFocusMinutes": actualMinutes,
          },
          $max: { "summary.longestSession": actualMinutes },
        },
        { upsert: true }
      ),
    ]);

    // Handle auto-progression
    if (user && user.settings.focusProgression === "auto" && parsed.data.rating !== "interrupted") {
      const newConsecutive = (user.consecutiveSuccesses || 0) + 1;

      if (newConsecutive >= SESSIONS_BEFORE_PROGRESSION) {
        const speedMultiplier = user.settings.progressionSpeed === "slow" ? 1 : user.settings.progressionSpeed === "fast" ? 3 : 2;
        const newInterval = Math.min(45, user.currentFocusInterval + speedMultiplier);
        await User.findByIdAndUpdate(user._id, {
          currentFocusInterval: newInterval,
          consecutiveSuccesses: 0,
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          consecutiveSuccesses: newConsecutive,
        });
      }
    }

    return { success: true, data: { actualDuration } };
  } catch (error) {
    console.error("Complete focus error:", error);
    return { success: false, error: "Couldn't save session.", code: "SERVER" };
  }
}

export async function cancelFocusSession(
  input: unknown
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = sessionIdSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid session", code: "VALIDATION" };
    }

    const user = await getUser(userId);
    if (!user) return { success: false, error: "User not found", code: "NOT_FOUND" };

    await connectDB();
    const result = await FocusSession.findOneAndUpdate(
      {
        _id: parsed.data.sessionId,
        userId: user._id,
        status: { $in: ["active", "paused"] },
      },
      { status: "cancelled", completedAt: new Date() }
    );

    if (!result) {
      return { success: false, error: "Session not found", code: "NOT_FOUND" };
    }

    // Reset consecutive successes on cancel
    await User.findByIdAndUpdate(user._id, { consecutiveSuccesses: 0 });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Cancel focus error:", error);
    return { success: false, error: "Couldn't cancel session.", code: "SERVER" };
  }
}

export async function getActiveSession() {
  const userId = await requireUserId();
  const user = await getUser(userId);
  if (!user) return null;

  await connectDB();
  
  // Also expire any old active sessions
  await FocusSession.updateMany(
    {
      userId: user._id,
      status: { $in: ["active", "paused"] },
      expiresAt: { $lt: new Date() },
    },
    { status: "expired" }
  );

  const session = await FocusSession.findOne({
    userId: user._id,
    status: { $in: ["active", "paused"] },
  })
    .select("-__v -userId") // Sanitize internal metadata
    .lean();

  return session;
}
