"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "../db/connection";
import User from "../db/models/user";
import { registerSchema } from "../validators/auth";
import type { ActionResult } from "../types";

export async function registerUser(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input",
        code: "VALIDATION",
      };
    }

    const { name, email, password } = parsed.data;
    await connectDB();

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists",
        code: "CONFLICT",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      provider: "credentials",
    });

    return { success: true, data: { id: user._id.toString() } };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      code: "SERVER",
    };
  }
}
