import { RECOVERY_MESSAGES } from "../constants";

let lastIndex = -1;

/**
 * Get a recovery message, cycling through without immediate repeats
 */
export function getRecoveryMessage(): string {
  let index: number;
  do {
    index = Math.floor(Math.random() * RECOVERY_MESSAGES.length);
  } while (index === lastIndex && RECOVERY_MESSAGES.length > 1);
  lastIndex = index;
  return RECOVERY_MESSAGES[index];
}
