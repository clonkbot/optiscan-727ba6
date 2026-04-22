import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { OptionsTable } from "./OptionsTable";
import { StatsPanel } from "./StatsPanel";
import { Watchlist } from "./Watchlist";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const options = useQuery(api.options.getOversoldOptions);
  const stats = useQuery(api.options.getScanStats);
  const refreshScan = useMutation(api.options.refreshScanData);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"scanner" | "watchlist">("scanner");
  const [filterSymbol, setFilterSymbol] = useState("");

  useEffect(() => {
    // Auto-refresh on first load if no data
    if (options !== undefined && options.length === 0 && !isScanning) {
      handleScan();
    }
  }, [options]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await refreshScan();
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  const filteredOptions = options?.filter((opt: { symbol: string }) =>
    filterSymbol === "" || opt.symbol.toLowerCase().includes(filterSymbol.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neutral-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h18v18H3V3z" />
              <path d="M3 9h18M9 3v18" />
            </svg>
            <span className="text-base font-medium text-neutral-800 tracking-tight">OptiScan</span>
          </div>

          <button
            onClick={() => signOut()}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Stats Row */}
        <StatsPanel stats={stats} />

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 mb-4 border-b border-neutral-100">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "scanner"
                ? "text-neutral-800"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Options Scanner
            {activeTab === "scanner" && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-neutral-800" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "watchlist"
                ? "text-neutral-800"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Watchlist
            {activeTab === "watchlist" && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-neutral-800" />
            )}
          </button>
        </div>

        {activeTab === "scanner" ? (
          <>
            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                  placeholder="Filter by symbol..."
                  className="w-full sm:w-64 px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-400"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Scan Markets
                  </>
                )}
              </button>
            </div>

            {/* Options Table */}
            {options === undefined ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
              </div>
            ) : filteredOptions && filteredOptions.length > 0 ? (
              <OptionsTable options={filteredOptions} />
            ) : (
              <div className="text-center py-20">
                <p className="text-neutral-400 text-sm">No oversold options found.</p>
                <button
                  onClick={handleScan}
                  className="mt-4 text-sm text-neutral-600 hover:text-neutral-800 transition-colors underline underline-offset-2"
                >
                  Run a scan
                </button>
              </div>
            )}
          </>
        ) : (
          <Watchlist />
        )}
      </main>
    </div>
  );
}
