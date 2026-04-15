import { describe, expect, it, vi, beforeEach } from "vitest";

const requireUserId = vi.fn();
const connectDB = vi.fn();
const getUser = vi.fn();
const dailyFindOne = vi.fn();
const focusFindOne = vi.fn();
const getTodayString = vi.fn();
const daysSince = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireUserId,
}));

vi.mock("@/lib/db/connection", () => ({
  connectDB,
}));

vi.mock("@/lib/data/user", () => ({
  getUser,
}));

vi.mock("@/lib/db/models/daily-log", () => ({
  default: {
    findOne: dailyFindOne,
  },
}));

vi.mock("@/lib/db/models/focus-session", () => ({
  default: {
    findOne: focusFindOne,
  },
}));

vi.mock("@/lib/utils/date", () => ({
  getTodayString,
  daysSince,
}));

vi.mock("./dashboard-client", () => ({
  DashboardClient: ({ data }: { data: unknown }) => <div data-testid="dashboard-client">{JSON.stringify(data)}</div>,
}));

describe("Dashboard page loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserId.mockResolvedValue("u_ab12cd34ef56");
    connectDB.mockResolvedValue(undefined);
    getUser.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      currentFocusInterval: 8,
      settings: { timezone: "UTC", focusInterval: 8 },
      onboarding: { completedAt: new Date("2026-04-01T00:00:00.000Z") },
      lastActiveAt: new Date("2026-04-14T00:00:00.000Z"),
    });
    getTodayString.mockReturnValue("2026-04-15");
    daysSince.mockReturnValue(0);

    dailyFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    focusFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
  });

  it("uses resolved user._id for db queries when session id is publicId", async () => {
    const mod = await import("./page");

    await expect(mod.default()).resolves.toBeTruthy();

    expect(getUser).toHaveBeenCalledWith("u_ab12cd34ef56");
    expect(dailyFindOne).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
      date: "2026-04-15",
    });
    expect(focusFindOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "507f1f77bcf86cd799439011",
      })
    );
  });
});
