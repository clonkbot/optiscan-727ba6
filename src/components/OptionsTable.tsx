import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface Option {
  _id: string;
  symbol: string;
  stockPrice: number;
  strikePrice: number;
  optionType: string;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  rsiValue: number;
  profitMargin: number;
  breakeven: number;
  isOversold: boolean;
}

interface OptionsTableProps {
  options: Option[];
}

export function OptionsTable({ options }: OptionsTableProps) {
  const addToWatchlist = useMutation(api.watchlist.add);
  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());

  const handleAddToWatchlist = async (symbol: string) => {
    await addToWatchlist({ symbol });
    setAddedSymbols(prev => new Set([...prev, symbol]));
  };

  const getRSIColor = (rsi: number) => {
    if (rsi < 20) return "text-red-600 bg-red-50";
    if (rsi < 30) return "text-orange-600 bg-orange-50";
    return "text-neutral-600 bg-neutral-50";
  };

  const getProfitColor = (profit: number) => {
    if (profit > 50) return "text-emerald-600";
    if (profit > 20) return "text-emerald-500";
    if (profit > 0) return "text-neutral-600";
    return "text-red-500";
  };

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-neutral-100">
        {options.map((opt) => (
          <div key={opt._id} className="p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-800">{opt.symbol}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getRSIColor(opt.rsiValue)}`}>
                    RSI {opt.rsiValue}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ${opt.stockPrice.toFixed(2)} · {opt.expiration}
                </p>
              </div>
              <button
                onClick={() => handleAddToWatchlist(opt.symbol)}
                disabled={addedSymbols.has(opt.symbol)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors disabled:text-emerald-500"
              >
                {addedSymbols.has(opt.symbol) ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-400">Strike</p>
                <p className="font-medium text-neutral-800">${opt.strikePrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Ask</p>
                <p className="text-neutral-600">${opt.ask.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Breakeven</p>
                <p className="text-neutral-600">${opt.breakeven.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>Vol: {opt.volume.toLocaleString()}</span>
                <span>OI: {opt.openInterest.toLocaleString()}</span>
                <span>IV: {opt.impliedVolatility}%</span>
              </div>
              <span className={`font-medium ${getProfitColor(opt.profitMargin)}`}>
                {opt.profitMargin > 0 ? "+" : ""}{opt.profitMargin}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Symbol</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Price</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Strike</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Exp</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Bid/Ask</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Volume</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">OI</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">IV</th>
              <th className="text-center px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">RSI</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Breakeven</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Margin</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {options.map((opt) => (
              <tr key={opt._id} className="bg-white hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-neutral-800">{opt.symbol}</span>
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  ${opt.stockPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-neutral-800 tabular-nums">
                  ${opt.strikePrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-neutral-500 text-xs">
                  {opt.expiration}
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  ${opt.bid.toFixed(2)} / ${opt.ask.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  {opt.volume.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  {opt.openInterest.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  {opt.impliedVolatility}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${getRSIColor(opt.rsiValue)}`}>
                    {opt.rsiValue}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">
                  ${opt.breakeven.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${getProfitColor(opt.profitMargin)}`}>
                  {opt.profitMargin > 0 ? "+" : ""}{opt.profitMargin}%
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleAddToWatchlist(opt.symbol)}
                    disabled={addedSymbols.has(opt.symbol)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors disabled:text-emerald-500"
                    title="Add to watchlist"
                  >
                    {addedSymbols.has(opt.symbol) ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
