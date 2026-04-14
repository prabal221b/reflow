// ============================================================
// Core TypeScript types for Reflow
// ============================================================

export type WorkPattern = "nine_to_five" | "flexible" | "shift" | "student";
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type FogLevel = "none" | "mild" | "moderate" | "heavy";
export type CaffeineLevel = "none" | "light" | "moderate" | "heavy";
export type SleepDuration = "<5h" | "5-6h" | "6-7h" | "7-8h" | "8h+";
export type Theme = "light" | "dark" | "system";
export type FocusProgression = "auto" | "manual";
export type ProgressionSpeed = "slow" | "normal" | "fast";

export type SessionStatus =
  | "active"
  | "completed"
  | "paused"
  | "cancelled"
  | "expired";
export type SessionType = "regular" | "rescue";
export type PostRating = "great" | "okay" | "struggled" | "interrupted";

export type SocialSessionType = "planned" | "unplanned";
export type SocialSessionStatus = "scheduled" | "active" | "completed";

export type RecoveryAction = "rescue_block" | "dismissed" | "none";

export const PLATFORMS = [
  "instagram",
  "twitter",
  "youtube",
  "reddit",
  "whatsapp",
  "telegram",
  "tiktok",
  "linkedin",
  "news",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const TRIGGERS = [
  "boredom",
  "fatigue",
  "anxiety",
  "task_difficulty",
  "transition",
  "notification",
  "phone_nearby",
  "habit",
  "completed_task",
  "waiting",
  "social_pressure",
  "other",
] as const;
export type Trigger = (typeof TRIGGERS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  youtube: "YouTube",
  reddit: "Reddit",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  news: "News Apps",
  other: "Other",
};

export const TRIGGER_LABELS: Record<Trigger, string> = {
  boredom: "Boredom",
  fatigue: "Fatigue",
  anxiety: "Anxiety",
  task_difficulty: "Difficult task",
  transition: "Between tasks",
  notification: "Notification",
  phone_nearby: "Phone nearby",
  habit: "Just habit",
  completed_task: "After finishing something",
  waiting: "Waiting / idle",
  social_pressure: "Social pressure",
  other: "Other",
};

// Dashboard state
export type DashboardState =
  | "morning_fresh"
  | "in_focus"
  | "on_break"
  | "social_window"
  | "winding_down"
  | "day_complete"
  | "returning"
  | "bad_day"
  | "first_day"
  | "empty";

// Action result pattern for server actions
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code: "VALIDATION" | "AUTH" | "NOT_FOUND" | "CONFLICT" | "SERVER" | "RATE_LIMIT";
    };

// Onboarding responses
export interface OnboardingResponses {
  workPattern?: WorkPattern;
  peakFocus?: TimeOfDay;
  worstFocus?: TimeOfDay;
  platforms: Platform[];
  dailyUsageHours?: number;
  triggers: Trigger[];
  avgSleepHours?: number;
  phoneInBed?: boolean;
  morningEnergy?: "low" | "medium" | "high";
}

// Settings
export interface UserSettings {
  focusInterval: number;
  focusProgression: FocusProgression;
  progressionSpeed: ProgressionSpeed;
  theme: Theme;
  reducedMotion: boolean;
  notifications: {
    focusReminders: boolean;
    socialWindowAlerts: boolean;
    dailySummary: boolean;
  };
  timezone: string;
  workdayStart: string;
  workdayEnd: string;
  socialWindowDefaults: {
    duration: number;
    maxPerDay: number;
  };
}

// Daily summary (denormalized in DailyLog)
export interface DailySummary {
  totalFocusMinutes: number;
  sessionsCompleted: number;
  sessionsAttempted: number;
  longestSession: number;
  plannedSocialWindows: number;
  actualSocialWindows: number;
  unplannedChecks: number;
  urgesLogged: number;
  relapses: number;
  cleanWorkStart: boolean;
}
