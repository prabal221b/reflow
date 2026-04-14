/**
 * Format seconds into MM:SS display
 */
export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${mins.toString().padStart(2, "0")}:${Math.floor(secs)
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Format minutes into human-readable duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Calculate remaining seconds from a start time and planned duration
 * Accounts for paused duration
 */
export function calculateRemaining(
  startedAt: Date,
  plannedDurationSeconds: number,
  pausedDurationSeconds: number = 0
): number {
  const elapsed = (Date.now() - startedAt.getTime()) / 1000 - pausedDurationSeconds;
  return Math.max(0, plannedDurationSeconds - elapsed);
}

/**
 * Calculate elapsed seconds from a start time
 * Accounts for paused duration
 */
export function calculateElapsed(
  startedAt: Date,
  pausedDurationSeconds: number = 0
): number {
  return Math.max(0, (Date.now() - startedAt.getTime()) / 1000 - pausedDurationSeconds);
}
