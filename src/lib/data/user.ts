import { cache } from "react";
import { connectDB } from "../db/connection";
import User from "../db/models/user";
import { randomBytes } from "crypto";

/**
 * Centralized Data Access Layer for User Settings.
 * Leverages React cache() to aggressively deduplicate exact MongoDB queries 
 * fired multiple times across layouts, pages, and components during a single server render matrix.
 */
export const getUser = cache(async (id: string) => {
  await connectDB();
  
  // Try finding by publicId first (new format)
  // If id starts with 'u_', it's definitely a publicId
  const isPublicId = id.startsWith('u_');
  
  let user;
  if (isPublicId) {
    user = await User.findOne({ publicId: id }).select("-passwordHash -providerId -deletionRequestedAt").lean();
  } else {
    // Fallback for legacy sessions during transition
    user = await User.findById(id).select("-passwordHash -providerId -deletionRequestedAt").lean();
    
    // Auto-backfill if publicId is missing (this handles existing users on first load)
    if (user && !user.publicId) {
      const publicId = `u_${randomBytes(6).toString("hex")}`;
      await User.findByIdAndUpdate(id, { $set: { publicId } });
      user.publicId = publicId;
    }
  }
  
  return user;
});
