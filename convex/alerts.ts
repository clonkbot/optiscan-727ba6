import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    symbol: v.string(),
    targetPrice: v.number(),
    alertType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("alerts", {
      userId,
      symbol: args.symbol.toUpperCase(),
      targetPrice: args.targetPrice,
      alertType: args.alertType,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const alert = await ctx.db.get(args.id);
    if (!alert || alert.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isActive: !alert.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const alert = await ctx.db.get(args.id);
    if (!alert || alert.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
