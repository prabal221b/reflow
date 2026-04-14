import { requireUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import { getActiveSession } from "@/lib/actions/focus";
import { FocusClient } from "./focus-client";

export const metadata = { title: "Focus" };

export default async function FocusPage() {
  const userId = await requireUserId();
  await connectDB();

  const user = await User.findById(userId).lean();
  const activeSession = await getActiveSession(userId);

  const focusInterval = user?.currentFocusInterval || user?.settings?.focusInterval || 8;

  const sessionData = activeSession
    ? {
        id: activeSession._id.toString(),
        status: activeSession.status as string,
        type: activeSession.type as string,
        startedAt: activeSession.startedAt.toISOString(),
        plannedDuration: activeSession.plannedDuration,
        pausedDuration: activeSession.pausedDuration || 0,
        task: activeSession.preReflection?.task,
      }
    : null;

  return (
    <FocusClient
      focusInterval={focusInterval}
      activeSession={sessionData}
    />
  );
}
