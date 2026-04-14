// ============================================================
// Application constants and defaults
// ============================================================

import type { UserSettings } from "./types";

export const APP_NAME = "Reflow";
export const APP_DESCRIPTION =
  "Rebuild focus, reduce compulsive checking, and take back control of your attention.";

// Focus session defaults
export const DEFAULT_FOCUS_INTERVAL = 8; // minutes
export const MIN_FOCUS_INTERVAL = 3;
export const MAX_FOCUS_INTERVAL = 45;
export const RESCUE_BLOCK_DURATIONS = [3, 5] as const;
export const FOCUS_PROGRESSION_STEP = 2; // minutes to add on auto-progression
export const SESSIONS_BEFORE_PROGRESSION = 3;
export const SESSION_GRACE_PERIOD = 5 * 60; // 5 minutes in seconds

// Social media defaults
export const DEFAULT_SOCIAL_WINDOW_DURATION = 15; // minutes
export const MAX_SOCIAL_WINDOWS_PER_DAY = 6;
export const SOCIAL_WARNING_THRESHOLD = 0.8; // 80% of window elapsed

// Timer
export const TIMER_POLL_INTERVAL = 30_000; // 30s server polling during focus
export const TIMER_UI_INTERVAL = 1_000; // 1s UI update

// Rate limiting
export const AUTH_RATE_LIMIT = 10; // attempts per minute
export const ACTION_RATE_LIMIT = 60; // actions per minute

// Defaults for new users
export const DEFAULT_SETTINGS: UserSettings = {
  focusInterval: DEFAULT_FOCUS_INTERVAL,
  focusProgression: "auto",
  progressionSpeed: "normal",
  theme: "system",
  reducedMotion: false,
  notifications: {
    focusReminders: true,
    socialWindowAlerts: true,
    dailySummary: false,
  },
  timezone: "UTC",
  workdayStart: "09:00",
  workdayEnd: "17:30",
  socialWindowDefaults: {
    duration: DEFAULT_SOCIAL_WINDOW_DURATION,
    maxPerDay: 4,
  },
};

// Focus target defaults based on energy
export const FOCUS_TARGETS = {
  high: { sessions: 4, label: "Strong day" },
  medium: { sessions: 3, label: "Steady day" },
  low: { sessions: 2, label: "Gentle day" },
  very_low: { sessions: 1, label: "Just one" },
} as const;

// Recovery messages pool (non-judgmental, rotating)
export const RECOVERY_MESSAGES = [
  "That's okay. Slipping is part of retraining. What matters is what you do next.",
  "One detour doesn't undo your progress. You noticed, logged it, and you're here. That's the skill.",
  "Recovery isn't about never slipping. It's about the return. You just did the hardest part.",
  "Your brain is rewiring. It will pull toward old patterns sometimes. Noticing is the work.",
  "Reset, not ruined. Every return to focus strengthens the pathway you're building.",
  "This moment right now — choosing to come back — is more valuable than a perfect streak.",
  "It's normal. The app didn't break. Your progress didn't reset. Take a breath and choose your next step.",
  "You caught it. That's awareness. Most people don't even notice the switch. You did.",
  "Think of this like a muscle. Fatigue happens. Rest, restart, rebuild.",
  "A 3-minute restart after a slip creates more change than a perfect hour you never attempt.",
  "Progress isn't linear. The trend line matters, not any single point on it.",
  "You're not starting over. You're continuing with more information.",
  "The fact that you're here, logging this, means the system is working. You're building a new default.",
  "Nobody heals in a straight line. Today is data, not a verdict.",
  "Small: that's the strategy. One tiny block. That's all we need right now.",
] as const;

// Onboarding steps
export const ONBOARDING_STEPS = [
  { id: "welcome", label: "Welcome", required: true },
  { id: "work", label: "Work Pattern", required: false },
  { id: "social", label: "Social Media", required: false },
  { id: "sleep", label: "Sleep & Energy", required: false },
  { id: "plan", label: "Your Plan", required: true },
] as const;
