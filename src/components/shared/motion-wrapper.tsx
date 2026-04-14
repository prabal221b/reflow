"use client";

import { motion, type MotionProps } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import type { ReactNode } from "react";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that respects reduced motion preferences.
 * When reduced motion is preferred, renders children with no animation.
 */
export function MotionWrapper({
  children,
  className,
  initial,
  animate,
  exit,
  transition,
  ...rest
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fade-in animation wrapper
 */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <MotionWrapper
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      {children}
    </MotionWrapper>
  );
}
