import { describe, expect, it } from "vitest";
import { registerSchema } from "../auth";

describe("Registration Validator", () => {
  it("fails if password is too short", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Short1!",
      confirmPassword: "Short1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 12 characters");
    }
  });

  it("fails if password lacks complexity", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "alllowercasepassword",
      confirmPassword: "alllowercasepassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Use at least one uppercase letter, number, or symbol");
    }
  });

  it("fails if passwords do not match", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "ValidPassword123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords don't match");
    }
  });

  it("passes with valid complex 12+ character password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "SuperSecretLongPassword123!",
      confirmPassword: "SuperSecretLongPassword123!",
    });
    expect(result.success).toBe(true);
  });
});
