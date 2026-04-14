import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  differenceInDays,
} from "date-fns";

/**
 * Get today's date string in YYYY-MM-DD format for a given timezone
 */
export function getTodayString(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    return now.toLocaleDateString("en-CA", { timeZone: timezone });
  }
  return now.toISOString().split("T")[0];
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

/**
 * Format a date with full format
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d, yyyy");
}

/**
 * Get relative time string
 */
export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get days since a date
 */
export function daysSince(date: Date | string): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInDays(startOfDay(new Date()), startOfDay(d));
}

/**
 * Check if a date string represents today
 */
export function isDateToday(dateStr: string, timezone?: string): boolean {
  return dateStr === getTodayString(timezone);
}
