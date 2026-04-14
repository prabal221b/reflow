"use server";

import { connectDB } from "../db/connection";
import User from "../db/models/user";
import { registerSchema } from "../validators/auth";
import type { ActionResult } from "../types";
import bcrypt from "bcryptjs";

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

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      // Generic message — do not reveal whether the email is registered
      return {
        success: false,
        error: "Unable to create account. Please try a different email or sign in.",
        code: "CONFLICT",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: "credentials",
    });

    return { success: true, data: { id: user._id.toString() } };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      code: "SERVER",
    };
  }
}
