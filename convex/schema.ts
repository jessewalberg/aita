import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  verdicts: defineTable({
    situation: v.string(),
    mode: v.union(v.literal("single"), v.literal("panel")),

    // Panel data
    panelVerdicts: v.optional(
      v.array(
        v.object({
          modelId: v.string(),
          modelName: v.string(),
          verdict: v.string(),
          confidence: v.number(),
          summary: v.string(),
          reasoning: v.string(),
          keyPoints: v.array(v.string()),
        })
      )
    ),
    synthesis: v.optional(v.string()),
    dissent: v.optional(v.string()),
    panelSplit: v.optional(v.string()),

    // Final verdict
    verdict: v.union(
      v.literal("YTA"),
      v.literal("NTA"),
      v.literal("ESH"),
      v.literal("NAH"),
      v.literal("INFO")
    ),
    confidence: v.number(),
    summary: v.string(),
    reasoning: v.string(),
    keyPoints: v.array(v.string()),

    // Meta
    shareId: v.string(),
    isPublic: v.boolean(),
    isPro: v.boolean(),
    userId: v.optional(v.string()),
    visitorId: v.optional(v.string()),
    latencyMs: v.number(),
    createdAt: v.number(),
  })
    .index("by_shareId", ["shareId"])
    .index("by_userId", ["userId", "createdAt"])
    .index("by_public_createdAt", ["isPublic", "createdAt"]),

  dailyUsage: defineTable({
    identifier: v.string(),
    date: v.string(),
    singleCount: v.number(),
    panelCount: v.number(),
  }).index("by_identifier_date", ["identifier", "date"]),

  modelStats: defineTable({
    modelId: v.string(),
    modelName: v.string(),
    totalVerdicts: v.number(),
    ytaCount: v.number(),
    ntaCount: v.number(),
    eshCount: v.number(),
    nahCount: v.number(),
    infoCount: v.number(),
    leniencyScore: v.number(),
    updatedAt: v.number(),
  })
    .index("by_model", ["modelId"])
    .index("by_leniency", ["leniencyScore"]),

  users: defineTable({
    workosUserId: v.string(),
    email: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro")),
    // Role for permissions (optional for backwards compatibility)
    role: v.optional(
      v.union(v.literal("user"), v.literal("pro"), v.literal("admin"))
    ),
    createdAt: v.number(),
  }).index("by_workosUserId", ["workosUserId"]),
});
