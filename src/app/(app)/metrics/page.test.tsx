import { describe, expect, it, vi, beforeEach } from "vitest";

const requireUserId = vi.fn();
const connectDB = vi.fn();
const getUser = vi.fn();
const dailyFind = vi.fn();

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
    find: dailyFind,
  },
}));

vi.mock("./metrics-client", () => ({
  MetricsClient: ({ logs }: { logs: unknown[] }) => <div data-testid="metrics-client">{logs.length}</div>,
}));

describe("Metrics page loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserId.mockResolvedValue("u_ab12cd34ef56");
    connectDB.mockResolvedValue(undefined);
    getUser.mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });

    dailyFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    });
  });

  it("queries logs with resolved user._id when session id is publicId", async () => {
    const mod = await import("./page");

    await expect(mod.default()).resolves.toBeTruthy();

    expect(getUser).toHaveBeenCalledWith("u_ab12cd34ef56");
    expect(dailyFind).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "507f1f77bcf86cd799439011",
      })
    );
  });
});
