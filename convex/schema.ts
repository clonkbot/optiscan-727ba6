import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Watchlist for users to track specific stocks
  watchlist: defineTable({
    userId: v.id("users"),
    symbol: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Scanned options data
  scannedOptions: defineTable({
    symbol: v.string(),
    stockPrice: v.number(),
    strikePrice: v.number(),
    optionType: v.string(),
    expiration: v.string(),
    bid: v.number(),
    ask: v.number(),
    volume: v.number(),
    openInterest: v.number(),
    impliedVolatility: v.number(),
    rsiValue: v.number(),
    profitMargin: v.number(),
    breakeven: v.number(),
    isOversold: v.boolean(),
    scannedAt: v.number(),
  }).index("by_oversold", ["isOversold"])
    .index("by_symbol", ["symbol"])
    .index("by_scanned", ["scannedAt"]),

  // User alerts
  alerts: defineTable({
    userId: v.id("users"),
    symbol: v.string(),
    targetPrice: v.number(),
    alertType: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Scan history
  scanHistory: defineTable({
    userId: v.id("users"),
    scanType: v.string(),
    resultsCount: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
});
