import { describe, expect, it } from "vitest";
import { formatTimer, formatDuration } from "../time";

describe("Time Utility: formatTimer", () => {
  it("formats standard seconds correctly", () => {
    expect(formatTimer(65)).toBe("01:05");
    expect(formatTimer(120)).toBe("02:00");
    expect(formatTimer(3599)).toBe("59:59");
    expect(formatTimer(3600)).toBe("60:00");
  });

  it("handles negative seconds safely by clamping to zero", () => {
    expect(formatTimer(-10)).toBe("00:00");
  });

  it("handles decimal seconds by flooring", () => {
    expect(formatTimer(65.8)).toBe("01:05");
  });
});

describe("Time Utility: formatDuration", () => {
  it("formats minutes accurately", () => {
    expect(formatDuration(0)).toBe("< 1 min");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(120)).toBe("2h");
  });
});
