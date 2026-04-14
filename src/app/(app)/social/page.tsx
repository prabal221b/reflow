import { requireUserId } from "@/lib/auth/session";
import { getTodaySocialSessions } from "@/lib/actions/social";
import { SocialClient } from "./social-client";

export const metadata = { title: "Social Media" };

export default async function SocialPage() {
  const userId = await requireUserId();
  const sessions = await getTodaySocialSessions(userId);

  const serialized = sessions.map((s) => ({
    id: s._id.toString(),
    type: s.type as string,
    status: s.status as string,
    platform: s.platform,
    intent: s.intent || null,
    scheduledDuration: s.scheduledDuration || null,
    actualDuration: s.actualDuration || null,
    actualStart: s.actualStart?.toISOString() || null,
  }));

  return <SocialClient sessions={serialized} />;
}
