"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TIMER_UI_INTERVAL } from "@/lib/constants";

interface UseTimerOptions {
  /** Total duration in seconds */
  duration: number;
  /** Server start time — timer calculates from this */
  startedAt: Date;
  /** Total accumulated paused seconds */
  pausedDuration?: number;
  /** Whether the timer is currently paused */
  isPaused?: boolean;
  /** Called when timer reaches zero */
  onComplete?: () => void;
}

interface UseTimerReturn {
  /** Remaining seconds */
  remaining: number;
  /** Elapsed seconds */
  elapsed: number;
  /** Progress 0–1 */
  progress: number;
  /** Whether timer is finished */
  isComplete: boolean;
}

/**
 * Reliable countdown timer hook.
 * Uses server timestamp as source of truth — immune to tab sleep, drift, etc.
 * Recalculates on every tick and on visibility change.
 */
export function useTimer({
  duration,
  startedAt,
  pausedDuration = 0,
  isPaused = false,
  onComplete,
}: UseTimerOptions): UseTimerReturn {
  const startTime = new Date(startedAt).getTime();
    
  const calculateState = useCallback(() => {
    const now = Date.now();
    
    if (isPaused) {
      const elapsed = (startTime - now) * -1 / 1000 - pausedDuration;
      // When paused, freeze at current position
      const actualElapsed = Math.max(0, Math.min(elapsed, duration));
      return {
        remaining: Math.max(0, duration - actualElapsed),
        elapsed: actualElapsed,
        progress: Math.min(1, actualElapsed / duration),
        isComplete: false,
      };
    }

    const elapsedMs = now - startTime;
    const elapsedSecs = elapsedMs / 1000 - pausedDuration;
    const remaining = Math.max(0, duration - elapsedSecs);
    const elapsed = Math.min(duration, Math.max(0, elapsedSecs));
    const progress = Math.min(1, elapsed / duration);
    const isComplete = remaining <= 0;

    return { remaining, elapsed, progress, isComplete };
  }, [duration, startTime, pausedDuration, isPaused]);

  const [state, setState] = useState(calculateState);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (isPaused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(calculateState());
      return;
    }

    hasCompletedRef.current = false;

    const tick = () => {
      const newState = calculateState();
      setState(newState);

      if (newState.isComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    tick(); // Initial calculation
    const interval = setInterval(tick, TIMER_UI_INTERVAL);

    // Recalculate on tab refocus (handles backgrounding)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [calculateState, isPaused]);

  return state;
}
