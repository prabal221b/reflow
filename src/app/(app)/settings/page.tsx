import { requireUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connection";
import { getUser } from "@/lib/data/user";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const userId = await requireUserId();
  await connectDB();

  const user = await getUser(userId);
  if (!user) return null;

  const settings = {
    name: user.name,
    email: user.email,
    focusInterval: user.settings?.focusInterval || 8,
    currentFocusInterval: user.currentFocusInterval || 8,
    focusProgression: (user.settings?.focusProgression || "auto") as string,
    progressionSpeed: (user.settings?.progressionSpeed || "normal") as string,
    theme: (user.settings?.theme || "system") as string,
    reducedMotion: user.settings?.reducedMotion || false,
    notifications: user.settings?.notifications || {
      focusReminders: true,
      socialWindowAlerts: true,
      dailySummary: false,
    },
    timezone: user.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    workdayStart: user.settings?.workdayStart || "09:00",
    workdayEnd: user.settings?.workdayEnd || "17:30",
    socialWindowDefaults: user.settings?.socialWindowDefaults || { duration: 15, maxPerDay: 4 },
  };

  return <SettingsClient settings={settings} />;
}
