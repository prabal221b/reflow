"use client";

import { useCallback } from "react";

const STORAGE_PREFIX = "reflow_";

/**
 * Hook for localStorage backup of critical state (active sessions, etc.)
 * All reads are try-catch wrapped for corrupt data resilience.
 */
export function useLocalBackup() {
  const remove = useCallback((key: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Fail silently
    }
  }, []);

  const save = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${key}`,
        JSON.stringify(data)
      );
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, []);

  const load = useCallback(<T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt data — clear and return null
      remove(key);
      return null;
    }
  }, [remove]);

  return { save, load, remove };
}
