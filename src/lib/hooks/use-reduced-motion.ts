"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if the user prefers reduced motion.
 * Also checks the user's manual setting.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check manual override first
    const manual = localStorage.getItem("reflow-reduced-motion");
    if (manual === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefersReducedMotion(true);
      return;
    }

    // Then check OS preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
