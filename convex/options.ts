import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all oversold options
export const getOversoldOptions = query({
  args: {},
  handler: async (ctx) => {
    const options = await ctx.db
      .query("scannedOptions")
      .withIndex("by_oversold", (q) => q.eq("isOversold", true))
      .order("desc")
      .take(50);
    return options;
  },
});

// Get all scanned options
export const getAllOptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scannedOptions")
      .withIndex("by_scanned")
      .order("desc")
      .take(100);
  },
});

// Get options by symbol
export const getBySymbol = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scannedOptions")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .collect();
  },
});

// Seed/refresh mock option data
export const refreshScanData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clear old data
    const oldOptions = await ctx.db.query("scannedOptions").collect();
    for (const opt of oldOptions) {
      await ctx.db.delete(opt._id);
    }

    // Generate mock oversold call options on low-price stocks
    const lowPriceStocks = [
      { symbol: "SNDL", price: 1.87 },
      { symbol: "SOFI", price: 8.42 },
      { symbol: "PLTR", price: 22.15 },
      { symbol: "NIO", price: 5.23 },
      { symbol: "LCID", price: 2.89 },
      { symbol: "RIVN", price: 11.67 },
      { symbol: "PLUG", price: 2.45 },
      { symbol: "FCEL", price: 1.12 },
      { symbol: "AMC", price: 4.56 },
      { symbol: "BB", price: 2.78 },
      { symbol: "CLOV", price: 0.89 },
      { symbol: "WISH", price: 0.45 },
      { symbol: "TLRY", price: 1.67 },
      { symbol: "SPCE", price: 1.23 },
      { symbol: "OPEN", price: 3.45 },
    ];

    const expirations = ["Dec 20", "Dec 27", "Jan 3", "Jan 10", "Jan 17"];
    const now = Date.now();

    for (const stock of lowPriceStocks) {
      const numOptions = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numOptions; i++) {
        const strikeMultiplier = 0.85 + Math.random() * 0.3;
        const strikePrice = Math.round(stock.price * strikeMultiplier * 100) / 100;
        const rsiValue = Math.floor(Math.random() * 35) + 15; // 15-50 RSI for oversold
        const isOversold = rsiValue < 30;

        const bid = Math.round((Math.random() * 0.5 + 0.05) * 100) / 100;
        const ask = Math.round((bid + Math.random() * 0.15 + 0.02) * 100) / 100;
        const breakeven = strikePrice + ask;
        const profitMargin = Math.round(((stock.price - breakeven) / ask) * 100 * 100) / 100;

        await ctx.db.insert("scannedOptions", {
          symbol: stock.symbol,
          stockPrice: stock.price,
          strikePrice,
          optionType: "CALL",
          expiration: expirations[Math.floor(Math.random() * expirations.length)],
          bid,
          ask,
          volume: Math.floor(Math.random() * 10000) + 500,
          openInterest: Math.floor(Math.random() * 50000) + 1000,
          impliedVolatility: Math.round((Math.random() * 80 + 40) * 100) / 100,
          rsiValue,
          profitMargin,
          breakeven,
          isOversold,
          scannedAt: now - Math.random() * 60000,
        });
      }
    }

    // Log scan history
    await ctx.db.insert("scanHistory", {
      userId,
      scanType: "oversold_calls",
      resultsCount: lowPriceStocks.length,
      timestamp: now,
    });

    return { success: true };
  },
});

// Get scan statistics
export const getScanStats = query({
  args: {},
  handler: async (ctx) => {
    const allOptions = await ctx.db.query("scannedOptions").collect();
    const oversoldOptions = allOptions.filter(o => o.isOversold);

    const avgProfitMargin = oversoldOptions.length > 0
      ? oversoldOptions.reduce((sum, o) => sum + o.profitMargin, 0) / oversoldOptions.length
      : 0;

    const avgRSI = oversoldOptions.length > 0
      ? oversoldOptions.reduce((sum, o) => sum + o.rsiValue, 0) / oversoldOptions.length
      : 0;

    const uniqueSymbols = new Set(allOptions.map(o => o.symbol));

    return {
      totalScanned: allOptions.length,
      oversoldCount: oversoldOptions.length,
      avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
      avgRSI: Math.round(avgRSI * 10) / 10,
      symbolsScanned: uniqueSymbols.size,
      lastScanTime: allOptions.length > 0 ? Math.max(...allOptions.map(o => o.scannedAt)) : null,
    };
  },
});
