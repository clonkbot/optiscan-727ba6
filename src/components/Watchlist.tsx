import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface WatchlistItem {
  _id: Id<"watchlist">;
  symbol: string;
  addedAt: number;
}

interface OptionData {
  _id: string;
  symbol: string;
  stockPrice: number;
  strikePrice: number;
  optionType: string;
  expiration: string;
  rsiValue: number;
  profitMargin: number;
}

export function Watchlist() {
  const watchlist = useQuery(api.watchlist.get) as WatchlistItem[] | undefined;
  const options = useQuery(api.options.getAllOptions) as OptionData[] | undefined;
  const removeFromWatchlist = useMutation(api.watchlist.remove);

  if (watchlist === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-neutral-500 text-sm">Your watchlist is empty.</p>
        <p className="text-neutral-400 text-xs mt-1">Add symbols from the scanner to track them here.</p>
      </div>
    );
  }

  // Get option data for watchlist symbols
  const watchlistSymbols = new Set(watchlist.map((w: WatchlistItem) => w.symbol));
  const watchlistOptions = options?.filter((opt: OptionData) => watchlistSymbols.has(opt.symbol)) ?? [];

  // Group options by symbol
  const optionsBySymbol = watchlistOptions.reduce((acc: Record<string, OptionData[]>, opt: OptionData) => {
    if (!acc[opt.symbol]) acc[opt.symbol] = [];
    acc[opt.symbol].push(opt);
    return acc;
  }, {} as Record<string, OptionData[]>);

  return (
    <div className="space-y-4">
      {watchlist.map((item: WatchlistItem) => {
        const symbolOptions = optionsBySymbol[item.symbol] || [];
        const latestOption = symbolOptions[0];

        return (
          <div
            key={item._id}
            className="border border-neutral-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-neutral-800">{item.symbol}</span>
                {latestOption && (
                  <span className="text-sm text-neutral-500">
                    ${latestOption.stockPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeFromWatchlist({ id: item._id })}
                className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                title="Remove from watchlist"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {symbolOptions.length > 0 ? (
              <div className="space-y-2">
                {symbolOptions.slice(0, 3).map((opt: OptionData) => (
                  <div
                    key={opt._id}
                    className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-600">
                        ${opt.strikePrice.toFixed(2)} {opt.optionType}
                      </span>
                      <span className="text-neutral-400 text-xs">{opt.expiration}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        opt.rsiValue < 30 ? "text-orange-600 bg-orange-50" : "text-neutral-600 bg-neutral-100"
                      }`}>
                        RSI {opt.rsiValue}
                      </span>
                      <span className={`font-medium ${
                        opt.profitMargin > 0 ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {opt.profitMargin > 0 ? "+" : ""}{opt.profitMargin}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No recent scans for this symbol.</p>
            )}

            <p className="text-xs text-neutral-400 mt-3">
              Added {new Date(item.addedAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
