import { requireUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { getUser } from "@/lib/data/user";
import DailyLog from "@/lib/db/models/daily-log";
import FocusSession from "@/lib/db/models/focus-session";
import { getTodayString, daysSince } from "@/lib/utils/date";
import { DashboardClient } from "./dashboard-client";
import mongoose from "mongoose";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const userId = await requireUserId();
  await connectDB();

  const oid = new mongoose.Types.ObjectId(userId);
  const user = await getUser(userId);
  if (!user) return null;

  const dateStr = getTodayString(user.settings?.timezone);

  const [todayLog, activeSession] = await Promise.all([
    DailyLog.findOne({ userId: oid, date: dateStr }).lean(),
    FocusSession.findOne({
      userId: oid,
      status: { $in: ["active", "paused"] },
      expiresAt: { $gt: new Date() },
    }).lean(),
  ]);

  // Determine dashboard state
  const lastActive = user.lastActiveAt;
  const daysMissed = lastActive ? daysSince(lastActive) : 0;
  const isFirstDay = !user.onboarding?.completedAt || daysSince(user.onboarding.completedAt) === 0;
  const hasAnyData = todayLog !== null;

  let dashboardState: string;
  if (activeSession) {
    dashboardState = "in_focus";
  } else if (isFirstDay && !hasAnyData) {
    dashboardState = "first_day";
  } else if (daysMissed > 1) {
    dashboardState = "returning";
  } else if (!hasAnyData) {
    dashboardState = "morning_fresh";
  } else if (
    todayLog?.summary &&
    todayLog.summary.relapses >= 3 &&
    todayLog.summary.sessionsCompleted === 0
  ) {
    dashboardState = "bad_day";
  } else if (
    todayLog?.summary &&
    todayLog.summary.sessionsCompleted >= (todayLog.focusTarget?.sessions || 3)
  ) {
    dashboardState = "day_complete";
  } else {
    dashboardState = "on_break";
  }

  // Serialize for client
  const dashData = {
    state: dashboardState,
    userName: user.name,
    focusInterval: user.currentFocusInterval || user.settings?.focusInterval || 8,
    todaySummary: todayLog?.summary || null,
    todayEnergy: todayLog?.energy || null,
    todayFog: todayLog?.fog || null,
    workStart: todayLog?.workStart || null,
    focusTarget: todayLog?.focusTarget || { sessions: 3, minutesPerSession: user.currentFocusInterval || 8 },
    hasCheckinToday: !!(todayLog?.energy || todayLog?.sleep?.duration),
    activeSession: activeSession
      ? {
          id: activeSession._id.toString(),
          status: activeSession.status,
          startedAt: activeSession.startedAt.toISOString(),
          plannedDuration: activeSession.plannedDuration,
          pausedDuration: activeSession.pausedDuration,
          task: activeSession.preReflection?.task,
        }
      : null,
    daysMissed,
  };

  return <DashboardClient data={dashData} />;
}
