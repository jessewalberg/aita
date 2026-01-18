import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../../lib/constants/limits";

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const increment = mutation({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const date = getUtcDateString();
    const existing = await ctx.db
      .query("dailyUsage")
      .withIndex("by_identifier_date", (q) =>
        q.eq("identifier", args.identifier).eq("date", date)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("dailyUsage", {
        identifier: args.identifier,
        date,
        singleCount: 0,
        panelCount: 1,
      });
      return;
    }

    await ctx.db.patch(existing._id, {
      panelCount: existing.panelCount + 1,
    });
  },
});

/**
 * Atomically check and increment rate limit.
 * Returns { allowed: true } if under limit, { allowed: false } if rate limited.
 * This prevents race conditions by doing check + increment in a single transaction.
 *
 * Limits:
 * - Anonymous (visitor:xxx): 2/day
 * - Signed in (user:xxx): 3/day
 * - Pro/Super Admin: unlimited (hasUnlimitedAccess=true)
 */
export const checkAndIncrement = mutation({
  args: {
    identifier: v.string(),
    // Whether the user has unlimited access (computed by caller using permission helpers)
    hasUnlimitedAccess: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Users with unlimited access (pro, super_admin) are not rate limited
    if (args.hasUnlimitedAccess) {
      // Still track usage for analytics
      const date = getUtcDateString();
      const existing = await ctx.db
        .query("dailyUsage")
        .withIndex("by_identifier_date", (q) =>
          q.eq("identifier", args.identifier).eq("date", date)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("dailyUsage", {
          identifier: args.identifier,
          date,
          singleCount: 0,
          panelCount: 1,
        });
      } else {
        await ctx.db.patch(existing._id, {
          panelCount: existing.panelCount + 1,
        });
      }

      return { allowed: true, remaining: undefined };
    }

    const date = getUtcDateString();
    const existing = await ctx.db
      .query("dailyUsage")
      .withIndex("by_identifier_date", (q) =>
        q.eq("identifier", args.identifier).eq("date", date)
      )
      .unique();

    const currentCount = existing?.panelCount ?? 0;
    const isSignedIn = args.identifier.startsWith("user:");
    const limit = isSignedIn ? LIMITS.SIGNED_IN_PER_DAY : LIMITS.ANONYMOUS_PER_DAY;

    // Check limit
    if (currentCount >= limit) {
      return { allowed: false, remaining: 0 };
    }

    if (!existing) {
      await ctx.db.insert("dailyUsage", {
        identifier: args.identifier,
        date,
        singleCount: 0,
        panelCount: 1,
      });
      return {
        allowed: true,
        remaining: limit - 1,
      };
    }

    const newPanelCount = existing.panelCount + 1;

    await ctx.db.patch(existing._id, {
      panelCount: newPanelCount,
    });

    return {
      allowed: true,
      remaining: limit - newPanelCount,
    };
  },
});
