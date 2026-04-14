export class InMemoryRateLimiter {
  private store = new Map<string, { count: number; expiresAt: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  limit(key: string): { success: boolean } {
    const now = Date.now();
    const record = this.store.get(key);

    if (record) {
      if (now > record.expiresAt) {
        // Window expired, reset
        this.store.set(key, { count: 1, expiresAt: now + this.windowMs });
        return { success: true };
      }

      if (record.count >= this.maxRequests) {
        return { success: false };
      }

      record.count += 1;
      this.store.set(key, record);
      return { success: true };
    }

    // First request
    this.store.set(key, { count: 1, expiresAt: now + this.windowMs });

    // Clean up old entries periodically to prevent memory leak
    if (this.store.size > 1000) {
      this.cleanup(now);
    }

    return { success: true };
  }

  private cleanup(now: number) {
    for (const [key, value] of this.store.entries()) {
      if (now > value.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// 10 requests per minute
export const authRateLimit = new InMemoryRateLimiter(10, 60 * 1000);
