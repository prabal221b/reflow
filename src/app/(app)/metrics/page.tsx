import { requireUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { getUser } from "@/lib/data/user";
import DailyLog from "@/lib/db/models/daily-log";
import { MetricsClient } from "./metrics-client";

export const metadata = { title: "Progress" };

export default async function MetricsPage() {
  const userId = await requireUserId();
  await connectDB();
  const user = await getUser(userId);
  if (!user) return <MetricsClient logs={[]} />;

  // Get last 14 days of logs
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const dateStr = twoWeeksAgo.toISOString().split("T")[0];

  const logs = await DailyLog.find({
    userId: user._id,
    date: { $gte: dateStr },
  })
    .sort({ date: 1 })
    .lean();

  const serialized = logs.map((log) => ({
    date: log.date,
    summary: log.summary || {
      totalFocusMinutes: 0,
      sessionsCompleted: 0,
      sessionsAttempted: 0,
      longestSession: 0,
      plannedSocialWindows: 0,
      actualSocialWindows: 0,
      unplannedChecks: 0,
      urgesLogged: 0,
      relapses: 0,
      cleanWorkStart: false,
    },
    energy: log.energy || null,
    fog: log.fog || null,
  }));

  return <MetricsClient logs={serialized} />;
}
