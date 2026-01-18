import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Upsert a user on login.
 * Creates the user if they don't exist, or returns existing user.
 */
export const upsertOnLogin = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", args.workosUserId))
      .unique();

    if (existing) {
      // Update email if changed
      if (existing.email !== args.email) {
        await ctx.db.patch(existing._id, { email: args.email });
      }
      return existing._id;
    }

    // Create new user with free tier
    const userId = await ctx.db.insert("users", {
      workosUserId: args.workosUserId,
      email: args.email,
      tier: "free",
      createdAt: Date.now(),
    });

    return userId;
  },
});
