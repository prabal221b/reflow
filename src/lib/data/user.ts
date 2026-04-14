import { cache } from "react";
import { connectDB } from "../db/connection";
import User from "../db/models/user";

/**
 * Centralized Data Access Layer for User Settings.
 * Leverages React cache() to aggressively deduplicate exact MongoDB queries 
 * fired multiple times across layouts, pages, and components during a single server render matrix.
 */
export const getUser = cache(async (userId: string) => {
  await connectDB();
  const user = await User.findById(userId).select("-passwordHash -providerId -deletionRequestedAt").lean();
  return user;
});
